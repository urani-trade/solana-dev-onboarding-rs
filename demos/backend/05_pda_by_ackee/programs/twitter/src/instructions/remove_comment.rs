use anchor_lang::prelude::*;

use crate::states::*;

pub fn remove_comment(_ctx: Context<RemoveCommentContext>) -> Result<()> {
    Ok(())
}
#[derive(Accounts)]
pub struct RemoveCommentContext<'info> {
    #[account(mut)]
    pub comment_author: Signer<'info>,
    #[account(
        mut,
        close=comment_author,
        seeds = [
            COMMENT_SEED.as_bytes(),
            comment_author.key().as_ref(),
            anchor_lang::solana_program::hash::hash(comment.content[..comment.content_length as usize].as_ref()).to_bytes().as_ref(),
            comment.parent_tweet.key().as_ref(),
            ],
        bump = comment.bump)]
    pub comment: Account<'info, Comment>,
}
