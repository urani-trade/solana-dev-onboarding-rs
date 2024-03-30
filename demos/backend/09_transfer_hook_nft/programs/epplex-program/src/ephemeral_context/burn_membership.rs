pub use anchor_lang::prelude::*;

use anchor_spl::token_2022::{burn, Burn, close_account, CloseAccount, Token2022};

pub use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct BurnMembership<'info> {
    #[account(mut)]
    pub burner: Signer<'info>,

    #[account(mut)]
    pub epplex: SystemAccount<'info>,

    #[account(mut)]
    /// CHECK
    pub membership: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK
    pub membership_ata: UncheckedAccount<'info>,

    #[account(
        seeds = [b"ephemeral_rule", rule.seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, EphemeralRule>,
    #[account(
        mut,
        close = epplex,
        seeds = [b"ephemeral_data", membership.key().as_ref()],
        bump,
    )]
    pub data: Account<'info, EphemeralData>,

    /// CHECK:
    #[account(
        seeds = [b"ephemeral_auth"],
        bump
    )]
    pub auth: UncheckedAccount<'info>,

    pub token_2022_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,
}

impl<'info> BurnMembership<'info> {
    pub fn burn(
        &mut self,
        bumps: BurnMembershipBumps,
    ) -> Result<()> {

        require!(self.data.expiry_time + 14 * 3600 < Clock::get()?.unix_timestamp || self.burner.key() == self.rule.rule_creator, EphemeralError::NotExpired);

        let seeds: &[&[u8]; 2] = &[
            b"ephemeral_auth",
            &[bumps.auth],
        ];
        let signer_seeds = &[&seeds[..]];

        burn(
            CpiContext::new_with_signer(
                self.token_2022_program.to_account_info(),
                Burn {
                    mint: self.membership.to_account_info(),
                    from: self.membership_ata.to_account_info(),
                    authority: self.auth.to_account_info(),
                },
                signer_seeds,
            ),
            1
        )?;

        Ok(())
    }
}