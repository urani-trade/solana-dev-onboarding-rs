use anchor_lang::prelude::*;

#[error_code]
pub enum VestingErr {
    #[msg("Total basis points must be equal or less than 10000")]
    TooMuchBasisPoints,
    #[msg("You already claimed your allocation.")]
    AlreadyClaimed,
    #[msg("You tried to transfer more than you are allowed")]
    LockedAmount,
    #[msg("Overflow")]
    Overflow,
}