use anchor_lang::prelude::*;

#[error_code]
pub enum NftError {
    #[msg("Membership is not expired")]
    NotExpired,
    #[msg("Membership is expired")]
    AlreadyExpired,
    #[msg("Overflow")]
    Overflow,
    #[msg("Not Authorized")]
    NotAuthorized,
}

