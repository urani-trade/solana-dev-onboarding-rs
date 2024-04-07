use anchor_lang::{prelude::*};
use anchor_spl::{token_interface::{Mint, TokenInterface}, associated_token::AssociatedToken};

use crate::state::*;


#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    /// CHECK
    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        seeds = [b"counter"], 
        bump,
        payer = payer,
        space = 9
    )]
    pub counter_account: Account<'info, CounterAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
