use anchor_lang::prelude::*;

#[error_code]
pub enum NftError {
    #[msg("Membership is expired")]
    Expired,
    #[msg("Overflow")]
    Overflow,
    #[msg("Not Authorized")]
    NotAuthorized,
}

