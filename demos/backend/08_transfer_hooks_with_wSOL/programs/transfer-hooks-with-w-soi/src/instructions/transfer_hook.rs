use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};


#[derive(Accounts)]
pub struct TransferHook<'info> {
  #[account(
      token::mint = mint, 
      token::authority = owner,
  )]
  pub source_token: InterfaceAccount<'info, TokenAccount>,
  pub mint: InterfaceAccount<'info, Mint>,
  #[account(
      token::mint = mint,
  )]
  pub destination_token: InterfaceAccount<'info, TokenAccount>,
  /// CHECK
  pub owner: UncheckedAccount<'info>,
  /// CHECK
  #[account(
      seeds = [b"extra-account-metas", mint.key().as_ref()], 
      bump
  )]
  pub extra_account_meta_list: UncheckedAccount<'info>,
  pub wsol_mint: InterfaceAccount<'info, Mint>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  #[account(
      mut,
      seeds = [b"delegate"], 
      bump
  )]
  pub delegate: SystemAccount<'info>,
  #[account(
      mut,
      token::mint = wsol_mint, 
      token::authority = delegate,
  )]
  pub delegate_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
  #[account(
      mut,
      token::mint = wsol_mint, 
      token::authority = owner,
  )]
  pub sender_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
}
