use anchor_lang::prelude::*;

declare_id!("m1BcEq4BfG5EKFEzR2MoqTArihzhj1sDY596jPpMZ8j");

#[program]
pub mod transfer_hook_extension {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
