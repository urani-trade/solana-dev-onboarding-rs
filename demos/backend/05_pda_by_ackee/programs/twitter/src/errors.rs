use anchor_lang::prelude::*;

#[error_code]
pub enum TwitterError {
    #[msg("Cannot initialize, topic too long")]
    TopicTooLong,
    #[msg("Cannot initialize, content too long")]
    ContentTooLong,
    #[msg("Maximum number of Likes Reached")]
    MaxLikesReached,
    #[msg("Maximum number of Dislikes Reached")]
    MaxDislikesReached,
    #[msg("Minimum number of Likes Reached")]
    MinLikesReached,
    #[msg("Minimum number of Dislikes Reached")]
    MinDislikesReached,
    #[msg("Comment too Long")]
    CommentTooLong,
}
