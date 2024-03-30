pub use anchor_lang::prelude::*;

pub use crate::{state::*, errors::*};

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct ManageRule<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = signer,
        space = EphemeralRule::INIT_SPACE,
        seeds = [b"ephemeral_rule", seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, EphemeralRule>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> ManageRule<'info> {
    pub fn create_rule(
        &mut self,    
        seed: u64,    
        rule_creator: Pubkey,
        renewal_price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        self.rule.set_inner(
            EphemeralRule {
                seed,
                rule_creator,
                renewal_price,
                treasury,
            }
        );

        Ok(())
    }

    pub fn modify_rule(
        &mut self, 
        seed: u64,       
        rule_creator: Pubkey,
        renewal_price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        require!(self.rule.rule_creator == self.signer.key(), EphemeralError::EscalatedAuthority);

        self.rule.rule_creator = rule_creator;
        self.rule.renewal_price = renewal_price;
        self.rule.treasury = treasury;
        
        Ok(())
    }
}