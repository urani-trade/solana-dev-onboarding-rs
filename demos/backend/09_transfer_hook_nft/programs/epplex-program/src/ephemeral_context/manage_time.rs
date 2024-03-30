pub use anchor_lang::{
    system_program::{transfer, Transfer},
    prelude::*
};

pub use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct ManageTime<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    /// CHECK
    pub membership: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"ephemeral_rule", rule.seed.to_le_bytes().as_ref()],
        bump,
        has_one = treasury
    )]
    pub rule: Account<'info, EphemeralRule>,
    #[account(
        mut,
        seeds = [b"ephemeral_data", membership.key().as_ref()],
        bump,
        has_one = rule
    )]
    pub data: Account<'info, EphemeralData>,

    pub system_program: Program<'info, System>,
}

impl<'info> ManageTime<'info> {
    pub fn add(
        &mut self,
        time: u64, // Time in hours
    ) -> Result<()> {

        let mut cost = time * self.rule.renewal_price;
        let time: u64 = time.checked_mul(3600).ok_or(EphemeralError::Overflow)?;

        if self.data.expiry_time < Clock::get()?.unix_timestamp {
            let flat_fee: u64 = 20;
            cost = cost.checked_add(flat_fee.checked_mul(self.rule.renewal_price).ok_or(EphemeralError::Overflow)?).ok_or(EphemeralError::Overflow)?;
        } else if self.payer.key() == self.rule.rule_creator {
            cost = 0;
        }

        self.data.expiry_time = self.data.expiry_time.checked_add(time as i64).ok_or(EphemeralError::Overflow)?;

        transfer(
            CpiContext::new(
                self.system_program.to_account_info(), 
                Transfer {
                    from: self.payer.to_account_info(),
                    to: self.treasury.to_account_info(),
                }),
            cost
        )?;

        Ok(())
    }

    pub fn remove(
        &mut self,
        time: u64, // Time in hours
    ) -> Result<()> {

        require!(self.data.expiry_time > Clock::get()?.unix_timestamp, EphemeralError::AlreadyExpired);
        require!(self.payer.key() == self.rule.rule_creator, EphemeralError::EscalatedAuthority);

        let time: u64 = time.checked_mul(3600).ok_or(EphemeralError::Overflow)?;

        self.data.expiry_time = self.data.expiry_time.checked_sub(time as i64).ok_or(EphemeralError::Overflow)?;

        Ok(())
    }
}