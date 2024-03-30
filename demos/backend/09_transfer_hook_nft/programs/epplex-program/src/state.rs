use anchor_lang::prelude::*;

#[account]
pub struct EphemeralData {
    pub mint: Pubkey,
    pub rule: Pubkey,
    pub expiry_time: i64,
}

impl Space for EphemeralData {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8;
}

#[account]
pub struct EphemeralRule {
    pub seed: u64,
    pub rule_creator: Pubkey,
    pub renewal_price: u64,
    pub treasury: Pubkey,
}

impl Space for EphemeralRule {
    const INIT_SPACE: usize = 8 + 8 + 32 + 8 + 32;
}
