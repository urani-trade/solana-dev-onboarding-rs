pub use anchor_lang::{prelude::*};
pub use anchor_spl::token_interface::{ Mint, TokenAccount };

use crate::state::*;


#[derive(Accounts)]
#[instruction(vesting_data: Vec<VestingData>)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,
    #[account(token::mint = mint)]
    pub token: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        init,
        payer = admin,
        space = VestingAccount::INIT_SPACE + vesting_data.len() * 10,
        seeds = [b"vesting", mint.key().as_ref(), token.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    pub system_program: Program<'info, System>,
}
