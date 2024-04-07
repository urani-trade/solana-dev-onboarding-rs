use anchor_lang::prelude::*;

#[account]
pub struct UserStats {
    pub level: u16,
    pub name: String,
    pub bump: u8,
}