use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_reaction(ctx: Context<AddReactionContext>, reaction: ReactionType) -> Result<()> {
    
    let tweet = &mut ctx.accounts.tweet;
    let tweet_reaction = &mut ctx.accounts.tweet_reaction;
    let reaction_author = &ctx.accounts.reaction_author;

    // 1. Updating tweet account
    match reaction {
        ReactionType::Like => tweet.likes = tweet.likes.checked_add(1).ok_or(TwitterError::MaxLikesReached)?,
        ReactionType::Dislike => tweet.dislikes = tweet.dislikes.checked_add(1).ok_or(TwitterError::MinDislikesReached)?,
    };

    // 2. Updating tweet_reaction account
    tweet_reaction.reaction = reaction;
    tweet_reaction.parent_tweet = tweet.key();
    tweet_reaction.reaction_author = reaction_author.key();
    tweet_reaction.bump = ctx.bumps.tweet_reaction;


    // 3. Updating reaction_author account
    let mut reaction_author_data = [0u8; REACTION_AUTHOR];
    reaction_author_data[..reaction_author.key().to_bytes().len()]
        .copy_from_slice(&reaction_author.key().to_bytes());
    tweet_reaction.reaction_author = reaction_author_data.into();

    Ok(())
}
#[derive(Accounts)]
pub struct AddReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(
        init,
        payer = reaction_author,
        space = 8 + Reaction::LEN,
        seeds = [
            TWEET_REACTION_SEED.as_bytes(),
            reaction_author.key().as_ref(),
            tweet.key().as_ref(),
            ],
        bump)]
    pub tweet_reaction: Account<'info, Reaction>,
    #[account(
        mut,
        seeds = [
            tweet.topic[..tweet.topic_length as usize].as_ref(),
            TWEET_SEED.as_bytes(),
            tweet.tweet_author.key().as_ref(),
        ],
        bump = tweet.bump)] 
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
