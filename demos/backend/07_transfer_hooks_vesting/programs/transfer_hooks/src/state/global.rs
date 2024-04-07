use anchor_lang::prelude::*;

#[account]
pub struct VestingAccount {
    pub amount: u64,
    pub claimed: bool,
    pub vesting_data: Vec<VestingData>,
}


impl Space for VestingAccount {
    const INIT_SPACE: usize = 8 + 8 + 1 + 4;
}


#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct VestingData {
    pub amount_basis_point: u16,
    pub time: i64,
}
