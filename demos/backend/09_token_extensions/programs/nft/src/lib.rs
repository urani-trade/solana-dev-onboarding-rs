pub use { state::*, instructions::* };
mod instructions;
mod errors;
mod state;


declare_id!("HPPjTJWwTHTGxgoaqNaWGFQTbqkg25NuSctdkpGNdUL5");

#[program]
pub mod nft {
    use super::*;

    ////////////
    // rules.rs
    ////////////
    pub fn create_rule(
        ctx: Context<ManageRule>,
        seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        ctx.accounts.create_rule(seed, creator, price, treasury)
    }

    pub fn modify_rule(
        ctx: Context<ManageRule>,
        _seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        ctx.accounts.modify_rule(_seed, creator, price, treasury)
    }

    /////////////////
    // membership.rs
    /////////////////
    pub fn create_membership(
        ctx: Context<CreateMembership>,
        time: i64,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.create(time, name, symbol, uri, ctx.bumps)
    }

    /////////////////
    // time.rs
    /////////////////
    pub fn add_time(
        ctx: Context<ManageTime>,
        time: u64,
    ) -> Result<()> {
        ctx.accounts.add(time)
    }

    pub fn remove_time(
        ctx: Context<ManageTime>,
        time: u64,
    ) -> Result<()> {
        ctx.accounts.remove(time)
    }

}
