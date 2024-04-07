use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenInterface},
};


#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  /// CHECK
  #[account(
      mut,
      seeds = [b"extra-account-metas", mint.key().as_ref()], 
      bump
  )]
  pub extra_account_meta_list: AccountInfo<'info>,
  pub mint: InterfaceAccount<'info, Mint>,
  pub wsol_mint: InterfaceAccount<'info, Mint>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}

