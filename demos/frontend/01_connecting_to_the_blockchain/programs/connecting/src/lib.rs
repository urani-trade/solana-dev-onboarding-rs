use anchor_lang::prelude::*;

declare_id!("2AArskN4sVJCaa3eLsLnsFBNZeJQ7fRVjKNTeSVr7TNB");

#[program]
pub mod connecting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
