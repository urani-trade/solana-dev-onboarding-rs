use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn initialize_tweet(
    ctx: Context<InitializeTweet>,
    topic: String,
    content: String,
) -> Result<()> {
    let initialized_tweet = &mut ctx.accounts.tweet;

    require!(
        topic.as_bytes().len() <= TOPIC_LENGTH,
        TwitterError::TopicTooLong
    );
    require!(
        content.as_bytes().len() <= CONTENT_LENGTH,
        TwitterError::ContentTooLong
    );

    // NOTICE how we copy data from String into bytearray
    // firstly we create empty bytearray of predefined length (depends on the String we want to
    // save inside)
    let mut topic_data = [0u8; TOPIC_LENGTH];
    // then we copy contents of the String into the bytearray
    topic_data[..topic.as_bytes().len()].copy_from_slice(topic.as_bytes());
    // lastly we assign the bytearray into the bytearray stored within the Tweet Account
    initialized_tweet.topic = topic_data;

    // Same steps as above but now for content string
    let mut content_data = [0u8; CONTENT_LENGTH];
    content_data[..content.as_bytes().len()].copy_from_slice(content.as_bytes());
    initialized_tweet.content = content_data;

    let mut tweet_author_data = [0u8; TWEET_AUTHOR];
    tweet_author_data[..ctx.accounts.tweet_authority.key().to_bytes().len()]
        .copy_from_slice(&ctx.accounts.tweet_authority.key().to_bytes());
    initialized_tweet.tweet_author = tweet_author_data.into();

    let mut topic_length_data = [0u8; 1];
    topic_length_data[0] = topic.as_bytes().len() as u8;
    initialized_tweet.topic_length = topic_length_data[0];

    let mut likes = [0u8; 8];
    likes.copy_from_slice(&0u64.to_le_bytes());
    initialized_tweet.likes = u64::from_le_bytes(likes);

    let mut dislikes = [0u8; 8];
    dislikes.copy_from_slice(&0u64.to_le_bytes());
    initialized_tweet.dislikes = u64::from_le_bytes(dislikes);

    initialized_tweet.bump = ctx.bumps.tweet;

    Ok(())
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct InitializeTweet<'info> {
    #[account(mut)]
    pub tweet_authority: Signer<'info>,
    #[account(
        init,
        payer = tweet_authority,
        space = 8 + Tweet::LEN,
        seeds = [
            topic.as_bytes(),
            TWEET_SEED.as_bytes(),
            tweet_authority.key().as_ref()
            ],
        bump)]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
