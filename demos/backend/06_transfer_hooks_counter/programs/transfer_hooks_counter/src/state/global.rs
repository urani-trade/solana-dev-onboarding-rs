use anchor_lang::prelude::*;

#[account]
pub struct CounterAccount {
    pub counter: u8,
}
