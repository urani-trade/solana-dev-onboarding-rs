pub use anchor_lang::prelude::*;
use crate::{errors::*, state::*};

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct ManageRule<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = signer,
        space = NftRule::INIT_SPACE,
        seeds = [b"nft_rule", seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, NftRule>,
    pub system_program: Program<'info, System>,
}

impl<'info> ManageRule<'info> {
    pub fn create_rule(
        &mut self,    
        seed: u64,    
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        self.rule.set_inner(
            NftRule {
                seed,
                creator,
                price,
                treasury,
            }
        );

        Ok(())
    }

    pub fn modify_rule(
        &mut self,     
        _seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        require!(self.rule.creator == self.signer.key(), NftError::NotAuthorized);

        self.rule.creator = creator;
        self.rule.price = price;
        self.rule.treasury = treasury;
        
        Ok(())
    }
}