use anchor_lang::prelude::*;

pub const TOPIC_LENGTH: usize = 32;
pub const TWEET_AUTHOR: usize = 32;
pub const COMMENT_AUTHOR: usize = 32;
pub const PARENT_TWEET: usize = 32;
pub const REACTION_AUTHOR: usize = 32;
pub const CONTENT_LENGTH: usize = 500;
pub const COMMENT_LENGTH: usize = 500;

pub const TWEET_SEED: &str = "TWEET_SEED";
pub const TWEET_REACTION_SEED: &str = "TWEET_REACTION_SEED";
pub const COMMENT_SEED: &str = "COMMENT_SEED";

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum ReactionType {
    Like,
    Dislike,
}

#[account]
pub struct Tweet {
    pub tweet_author: Pubkey, 
    pub topic: [u8; TOPIC_LENGTH], 
    pub topic_length: u8, 
    pub content: [u8; CONTENT_LENGTH], 
    pub likes: u64,
    pub dislikes: u64,
    pub bump: u8,
}

impl Tweet {
    // Pubkey + [u8; TOPIC_LENGTH] + u8 + [u8; CONTENT_LENGTH] + u64 + u64 + u8
    pub const LEN: usize = 32 + TOPIC_LENGTH + 1 + CONTENT_LENGTH + 8 + 8 + 1;
}

#[account]
pub struct Reaction {
    pub reaction_author: Pubkey,
    pub parent_tweet: Pubkey,
    pub reaction: ReactionType,
    pub bump: u8,
}
impl Reaction {
    // Pubkey + Pubkey + ReactionType(u8) + u8
    pub const LEN: usize = 32 + 32 + 1 + 1;
}

#[account]
pub struct Comment {
    pub comment_author: Pubkey,
    pub parent_tweet: Pubkey,
    pub content: [u8; COMMENT_LENGTH],
    pub content_length: u16,
    pub bump: u8,
}
impl Comment {
    // Pubkey + Pubkey + [u8; COMMENT_LENGTH] + u16 + u8
    pub const LEN: usize = 32 + 32 + COMMENT_LENGTH + 2 + 1;
}
