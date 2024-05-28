pub use anchor_lang::{prelude::*};
pub use anchor_spl::token_interface::{ Mint, TokenAccount };
use anchor_spl::token_2022::{Token2022};

use crate::state::*;


#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
    )]
    pub token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        seeds = [b"vesting_auth", mint.key().as_ref()],
        bump
    )]
    /// CHECK: This is safe because the seeds are fixed and are just used to mint token.
    pub mint_auth: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"vesting", mint.key().as_ref(), token.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
