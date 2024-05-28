pub use anchor_lang::{
    prelude::*,
    system_program::{ create_account, CreateAccount },
    solana_program::program_memory::sol_memcpy,
};
pub use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
pub use anchor_spl::token_interface::{ Mint, TokenAccount, TokenInterface };
pub use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};
use anchor_spl::token_2022::{mint_to, MintTo};

pub use { instructions::*, errors::*, state::* };
mod instructions;
mod errors;
mod state;


declare_id!("2qaMkdHBvzCZsVNwcb5riqq4dm5tbKmph2BuN8u7Mr9Y");


#[program]
pub mod vesting_template {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
        ) -> Result<()> {
        
        // index 0-3 are the accounts required for token transfer (source, mint, destination, owner)
        // index 4 is address of ExtraAccountMetaList account
        let account_metas = vec![
        
            // index 5, vesting_account
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal { bytes: "vesting".as_bytes().to_vec() },
                    Seed::AccountKey { index: 1 },
                    Seed::AccountKey { index: 0 }
                ],
                false, // is_signer
                true,  // is_writable
            )?,
        ];
    
        // calculate account size
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())? as u64;
        
        // calculate minimum required lamports
        let lamports = Rent::get()?.minimum_balance(account_size as usize);
    
        let mint = ctx.accounts.mint.key();
        
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"extra-account-metas",
            &mint.as_ref(),
            &[ctx.bumps.extra_account_meta_list],
        ]];
    
        // create ExtraAccountMetaList account
        create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.extra_account_meta_list.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            lamports,
            account_size,
            ctx.program_id,
        )?;
    
        // initialize ExtraAccountMetaList account with extra accounts
        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            &account_metas,
        )?;
        Ok(())
    }

    pub fn create_vesting_account(
            ctx: Context<CreateVestingAccount>, 
            vesting_data: Vec<VestingData>, 
            amount: u64
        ) -> Result<()> {
    
        let mut total_basis_points: u16 = 0;

        for vesting_data in vesting_data.iter() {
            total_basis_points = total_basis_points.
            checked_add(vesting_data.amount_basis_point).
            ok_or(VestingErr::Overflow)?;
        }

        require!(total_basis_points <= 10000, VestingErr::TooMuchBasisPoints);
        ctx.accounts.vesting_account.set_inner(
            VestingAccount {
                amount: amount,
                claimed: false,
                vesting_data,
            }
        );
        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        require!(ctx.accounts.vesting_account.claimed == false, VestingErr::AlreadyClaimed);
        ctx.accounts.vesting_account.claimed = true;

        let mint_key = ctx.accounts.mint.key();

        let seeds: &[&[u8]; 3] = &[
            b"vesting_auth",
            mint_key.as_ref(),
            &[ctx.bumps.mint_auth],
        ];
        let signer_seeds = &[&seeds[..]];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(), 
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token.to_account_info(),
                    authority: ctx.accounts.mint_auth.to_account_info(),
                },
                signer_seeds
            ),
            ctx.accounts.vesting_account.amount
        )
    }    

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        let info = ctx.accounts.vesting_account.to_account_info();
        let data = info.try_borrow_mut_data()?;
        
        // Try Deserialize the Account, if it deserialize then 
        // the sender has a vesting account and we should check it.
        match  VestingAccount::try_deserialize(&mut &data[..]) {
            Ok(vesting_account) => {
                let mut amount_locked: u64 = 0;
                let current_time = Clock::get()?.unix_timestamp;

                for vesting_data in vesting_account.vesting_data.iter() {
                    if vesting_data.time > current_time {
                        let amount_to_add: u64 = (vesting_data.amount_basis_point as u64)
                        .checked_mul(vesting_account.amount).ok_or(VestingErr::Overflow)?
                        .checked_div(10000).ok_or(VestingErr::Overflow)?;
                        amount_locked = amount_to_add.checked_add(amount)
                        .ok_or(VestingErr::Overflow)?;
                    }
                }
                // Check if the amount locked is less than what will remain after the transfer
                require!(amount_locked <= ctx.accounts
                    .source_token.amount
                    .checked_sub(amount)
                    .ok_or(VestingErr::Overflow)?, VestingErr::LockedAmount);
            },
            Err(_) => {}
        }
        Ok(())
    }

    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;

        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let amount_bytes = amount.to_le_bytes();
                __private::__global::transfer_hook(program_id, accounts, &amount_bytes)
            }
            _ => return Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}
