use anchor_lang::{prelude::*};

pub use { state::*, instructions::* };

mod instructions;
mod state;

declare_id!("DiUrXVjpm8stNeqnzHcssBLTW3uQBC426Bc2j4QoazDT");


#[program]
pub mod anchor_pda_example {
    use super::*;

    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.level = 0;
        if name.as_bytes().len() > 200 {
            panic!();
        }
        user_stats.name = name;
        user_stats.bump = ctx.bumps.user_stats;
        Ok(())
    }

    pub fn change_user_name(ctx: Context<ChangeUserName>, new_name: String) -> Result<()> {
        if new_name.as_bytes().len() > 200 {
            panic!();
        }
        ctx.accounts.user_stats.name = new_name;
        Ok(())
    }
}
