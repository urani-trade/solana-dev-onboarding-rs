#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5ASqQu2RHgcxLfvMhnpVpECWswBm8QHLz37duPosGh7");

#[program]
pub mod dapp_example {
    use super::*;

  pub fn close(_ctx: Context<CloseDappExample>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.dapp_example.count = ctx.accounts.dapp_example.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.dapp_example.count = ctx.accounts.dapp_example.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeDappExample>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.dapp_example.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeDappExample<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + DappExample::INIT_SPACE,
  payer = payer
  )]
  pub dapp_example: Account<'info, DappExample>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseDappExample<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub dapp_example: Account<'info, DappExample>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub dapp_example: Account<'info, DappExample>,
}

#[account]
#[derive(InitSpace)]
pub struct DappExample {
  count: u8,
}
