use anchor_lang::prelude::*;

declare_id!("BuucTmJYAp3Pv1yjfHyKvGREvCqTGQTjuzjyaSiT4rkG");

#[program]
pub mod serialize_custom_data_iii {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
