use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()> {
    
    let comment = &mut ctx.accounts.comment;
    let tweet = &ctx.accounts.tweet;
    let comment_author = &ctx.accounts.comment_author;

    require!(
        comment_content.as_bytes().len() <= COMMENT_LENGTH,
        TwitterError::CommentTooLong
    );

    let mut content_data = [0u8; COMMENT_LENGTH];
    content_data[..comment_content.as_bytes().len()].copy_from_slice(comment_content.as_bytes());
    comment.content = content_data;

    let mut comment_author_data = [0u8; COMMENT_AUTHOR];
    comment_author_data[..comment_author.key().to_bytes().len()]
        .copy_from_slice(&comment_author.key().to_bytes());
    comment.comment_author = comment_author_data.into();

    let mut parent_tweet_data = [0u8; PARENT_TWEET];
    parent_tweet_data[..tweet.key().to_bytes().len()]
        .copy_from_slice(&tweet.key().to_bytes());
    comment.parent_tweet = parent_tweet_data.into();

    let mut content_length_data = [0u8; 2];
    content_length_data.copy_from_slice(&(comment_content.as_bytes().len() as u16).to_le_bytes());
    comment.content_length = u16::from_le_bytes(content_length_data);

    comment.bump = ctx.bumps.comment;

    Ok(())
}
#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    #[account(mut)]
    pub comment_author: Signer<'info>,
    #[account(
        init,
        payer = comment_author,
        space = 8 + Comment::LEN,
        seeds = [
            COMMENT_SEED.as_bytes(),
            comment_author.key().as_ref(),
            anchor_lang::solana_program::hash::hash(comment_content.as_bytes()).to_bytes().as_ref(),
            tweet.key().as_ref(),
            ],
        bump)]
    pub comment: Account<'info, Comment>,
    #[account(
        mut,
        seeds = [
            tweet.topic[..tweet.topic_length as usize].as_ref(),
            TWEET_SEED.as_bytes(),
            tweet.tweet_author.key().as_ref()
        ],
        bump
    )]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
