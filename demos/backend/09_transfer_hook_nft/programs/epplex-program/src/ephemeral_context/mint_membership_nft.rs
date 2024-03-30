pub use anchor_lang::{
    solana_program::{
        sysvar::rent::ID as RENT_ID,
        program::{invoke, invoke_signed}
    },
    prelude::*
};

pub use anchor_spl::{
    token_2022::{Token2022, spl_token_2022::instruction::AuthorityType},
    associated_token::{Create, create, AssociatedToken},
    token_interface::{MintTo, mint_to, SetAuthority, set_authority},
};

pub use spl_token_2022::{
    extension::ExtensionType,
    instruction::{initialize_mint_close_authority, initialize_permanent_delegate, initialize_mint2},
    extension::{
        transfer_hook::instruction::initialize as intialize_transfer_hook,
        metadata_pointer::instruction::initialize as initialize_metadata_pointer,
    },
};

pub use spl_token_metadata_interface::{
    state::{TokenMetadata, Field},
    instruction::{initialize as initialize_metadata_account, update_field as update_metadata_account},
};

pub use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct CreateMembership<'info> {
    #[account(
        mut,
        constraint = rule_creator.key() == rule.rule_creator,
    )]
    pub rule_creator: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    /// CHECK
    pub membership: Signer<'info>,
    #[account(
        mut,
        seeds = [
            payer.key().as_ref(),
            token_2022_program.key().as_ref(),
            membership.key().as_ref()
        ],
        seeds::program = associated_token_program.key(),
        bump
    )]
    /// CHECK
    pub membership_ata: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"ephemeral_rule", rule.seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, EphemeralRule>,
    #[account(
        init,
        payer = payer,
        space = EphemeralData::INIT_SPACE,
        seeds = [b"ephemeral_data", membership.key().as_ref()],
        bump,
    )]
    pub data: Account<'info, EphemeralData>,

    /// CHECK:
    #[account(
        mut,
        seeds = [b"ephemeral_auth"],
        bump
    )]
    pub auth: UncheckedAccount<'info>,

    #[account(address = RENT_ID)]
    /// CHECK: this is fine since we are hard coding the rent sysvar.
    pub rent: UncheckedAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateMembership<'info> {
    pub fn create(
        &mut self,
        time: i64,
        name: String,
        symbol: String,
        uri: String,    
        bumps: CreateMembershipBumps,    
    ) -> Result<()> {

        // Step 0: Populate the EphemeralData account so we can reference it to use it.
        self.data.set_inner(
            EphemeralData {
                mint: self.membership.key(),
                rule: self.rule.key(),
                expiry_time: Clock::get()?.unix_timestamp + time,
            }
        );

        // Step 1: Initialize Account
        let size = ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(
            &[
                ExtensionType::MintCloseAuthority,
                ExtensionType::PermanentDelegate,
                ExtensionType::MetadataPointer,
                ExtensionType::TransferHook,
            ],
        ).unwrap();

        let metadata = TokenMetadata {
            update_authority: spl_pod::optional_keys::OptionalNonZeroPubkey::try_from(Some(self.auth.key())).unwrap(),
            mint: self.membership.key(),
            name,
            symbol,
            uri,
            additional_metadata: vec![]
        };

        let extension_extra_space = metadata.tlv_size_of().unwrap();
        let rent = &Rent::from_account_info(&self.rent.to_account_info())?;
        let lamports = rent.minimum_balance(size + extension_extra_space);

        invoke(
            &solana_program::system_instruction::create_account(
                &self.payer.key(),
                &self.membership.key(),
                lamports,
                (size).try_into().unwrap(),
                &spl_token_2022::id(),
            ),
            &vec![
                self.payer.to_account_info(),
                self.membership.to_account_info(),
            ],
        )?;

        // Step 2: Initialize Extension needed: 

        // 2.1: Permanent Delegate, 
        invoke(
            &initialize_permanent_delegate(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.auth.key(),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;
        
        // 2.2: Transfer Hook,
        invoke(
            &intialize_transfer_hook(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(self.auth.key()),
                None,  // TO-DO: Add Transfer Hook
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;
        
        // 2.3: Close Mint Authority, 
        invoke(
            &initialize_mint_close_authority(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(&self.auth.key()),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;
        
        // 2.4: Metadata Pointer
        invoke(
            &initialize_metadata_pointer(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(self.auth.key()),
                Some(self.membership.key()),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;

        // Step 3: Initialize Mint & Metadata Account
        invoke(
            &initialize_mint2(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.payer.key(),
                None,
                0,
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;

        let seeds: &[&[u8]; 2] = &[
            b"ephemeral_auth",
            &[bumps.auth],
        ];
        let signer_seeds = &[&seeds[..]];

        invoke_signed(
            &initialize_metadata_account(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.auth.key(),
                &self.membership.key(),
                &self.payer.key(),
                metadata.name,
                metadata.symbol,
                metadata.uri,
            ),
            &vec![
                self.membership.to_account_info(),
                self.auth.to_account_info(),
                self.payer.to_account_info(),
            ],
            signer_seeds
        )?;

        // Step 4: Initialize the ATA & Mint to ATA + Changing Mint Authority to None so that nobody can mint anymore tokens.: 

        // 4.1: Initialize ATA
        create(
            CpiContext::new(
                self.associated_token_program.to_account_info(),
                Create {
                    payer: self.payer.to_account_info(), // payer
                    associated_token: self.membership_ata.to_account_info(),
                    authority: self.payer.to_account_info(), // owner
                    mint: self.membership.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    token_program: self.token_2022_program.to_account_info(),
                }
            ),
        )?;

        // 4.2: Mint to ATA
        mint_to(
            CpiContext::new(
                self.token_2022_program.to_account_info(),
                MintTo {
                    mint: self.membership.to_account_info(),
                    to: self.membership_ata.to_account_info(),
                    authority: self.payer.to_account_info(),
                }
            ),
            1
        )?;

        // 4.3: Removing mint authority
        set_authority(
            CpiContext::new(
                self.token_2022_program.to_account_info(),
                anchor_spl::token_interface::SetAuthority {
                    current_authority: self.payer.to_account_info().clone(),
                    account_or_mint: self.membership.to_account_info().clone(),
                },
                // &[deployment_seeds]
            ),
            AuthorityType::MintTokens,
            None, // Set mint authority to be None
        )?;

        Ok(())
    }
}