use anchor_lang::{prelude::*};
use anchor_spl::{token_interface::{Mint, TokenAccount}};


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
    /// CHECK: source token account owner: or SystemAccount or PDA owned by another program
    pub owner: UncheckedAccount<'info>,
    /// CHECK
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"vesting", mint.key().as_ref(), source_token.key().as_ref()],
        bump
    )]
    /// CHECK
    pub vesting_account: UncheckedAccount<'info>,
}
