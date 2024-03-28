use anchor_lang::prelude::*;

declare_id!("Gs1SNS2TfUaV2MrpXawA9DEVacLbmzP5TodtqftkyEYo");

#[program]
pub mod non_native_programs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
