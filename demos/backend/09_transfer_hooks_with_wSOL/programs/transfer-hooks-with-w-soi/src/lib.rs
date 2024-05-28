use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
  };
use anchor_spl::{
    token_interface::{transfer_checked, TransferChecked},
  };
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
  };
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

pub use { instructions::*, errors::* };
mod instructions;
mod errors;
mod state;

declare_id!("3VTHXbzY92FgZR7TK58pbEoFnrzrAWLdwj65JiXB2MV1");


#[program]
pub mod transfer_hooks_with_w_soi {

  use super::*;

  pub fn initialize_extra_account_meta_list(
      ctx: Context<InitializeExtraAccountMetaList>,
  ) -> Result<()> {

      let account_metas = vec![
          ExtraAccountMeta::new_with_pubkey(&ctx.accounts.wsol_mint.key(), false, false)?,
          ExtraAccountMeta::new_with_pubkey(&ctx.accounts.token_program.key(), false, false)?,
          // index 7, associated token program
          ExtraAccountMeta::new_with_pubkey(
              &ctx.accounts.associated_token_program.key(),
              false,
              false,
          )?,
          // index 8, delegate PDA
          ExtraAccountMeta::new_with_seeds(
              &[Seed::Literal {
                  bytes: "delegate".as_bytes().to_vec(),
              }],
              false, 
              true,  
          )?,
          // index 9, delegate wrapped SOL token account
          ExtraAccountMeta::new_external_pda_with_seeds(
              7, 
              &[
                  Seed::AccountKey { index: 8 }, // owner index (delegate PDA)
                  Seed::AccountKey { index: 6 }, // token program index
                  Seed::AccountKey { index: 5 }, // wsol mint index
              ],
              false, 
              true,  
          )?,
          // index 10, sender wrapped SOL token account
          ExtraAccountMeta::new_external_pda_with_seeds(
              7, 
              &[
                  Seed::AccountKey { index: 3 }, // owner index
                  Seed::AccountKey { index: 6 }, // token program index
                  Seed::AccountKey { index: 5 }, // wsol mint index
              ],
              false, 
              true, 
          )?
      ];

      let account_size = ExtraAccountMetaList::size_of(account_metas.len())? as u64;
      let lamports = Rent::get()?.minimum_balance(account_size as usize);

      let mint = ctx.accounts.mint.key();
      let signer_seeds: &[&[&[u8]]] = &[&[
          b"extra-account-metas",
          &mint.as_ref(),
          &[ctx.bumps.extra_account_meta_list],
      ]];

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

      ExtraAccountMetaList::init::<ExecuteInstruction>(
          &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
          &account_metas,
      )?;

      Ok(())
  }

  pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
     let signer_seeds: &[&[&[u8]]] = &[&[b"delegate", &[ctx.bumps.delegate]]];
     msg!("Transfer WSOL using delegate PDA");

      // transfer WSOL from sender to delegate token account using delegate PDA
      transfer_checked(
          CpiContext::new(
              ctx.accounts.token_program.to_account_info(),
              TransferChecked {
                  from: ctx.accounts.sender_wsol_token_account.to_account_info(),
                  mint: ctx.accounts.wsol_mint.to_account_info(),
                  to: ctx.accounts.delegate_wsol_token_account.to_account_info(),
                  authority: ctx.accounts.delegate.to_account_info(),
              },
          )
          .with_signer(signer_seeds),
          amount,
          ctx.accounts.wsol_mint.decimals,
      )?;
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
          _ => return Err(ThisError::Invalid.into()),
      }
  }
}

