use anchor_lang::prelude::*;

#[error_code]
pub enum ThisError {
    #[msg("This Error is Invalid")]
    Invalid,
}

