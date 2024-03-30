use anchor_lang::prelude::*;

#[error_code]
pub enum EphemeralError {
    #[msg("You don't have the authority to perform this action")]
    EscalatedAuthority,
    #[msg("Overflow")]
    Overflow,
    #[msg("The membership has not yet expired! Note that the grace period is 14 hours.")]
    NotExpired,
    #[msg("The membership has already expired! You cannot remove time from it.")]
    AlreadyExpired,
}

