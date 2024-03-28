#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5tHQrDY8TYevNnBXW2yDS4i6YV3Brnj6BkmUGvHZEDCR");

#[program]
pub mod 07_create_dapp_cli {
    use super::*;

  pub fn close(_ctx: Context<Close07CreateDappCli>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.07_create_dapp_cli.count = ctx.accounts.07_create_dapp_cli.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.07_create_dapp_cli.count = ctx.accounts.07_create_dapp_cli.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<Initialize07CreateDappCli>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.07_create_dapp_cli.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct Initialize07CreateDappCli<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + 07CreateDappCli::INIT_SPACE,
  payer = payer
  )]
  pub 07_create_dapp_cli: Account<'info, 07CreateDappCli>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct Close07CreateDappCli<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub 07_create_dapp_cli: Account<'info, 07CreateDappCli>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub 07_create_dapp_cli: Account<'info, 07CreateDappCli>,
}

#[account]
#[derive(InitSpace)]
pub struct 07CreateDappCli {
  count: u8,
}
