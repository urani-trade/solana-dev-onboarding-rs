import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Twitter } from "../target/types/twitter";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import crypto from "crypto";


const TWEET_SEED = "TWEET_SEED";
const TWEET_REACTION = "TWEET_REACTION_SEED";
const COMMENT_SEED = "COMMENT_SEED";

describe("twitter", () => {
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace.Twitter as Program<Twitter>;

  const bob = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();

  const topic_bob1 = "Hello There";
  const content_bob1 = "This is my first tweet on this app, I like it here!"

  const topic_bob2 = "This Topic is too long bla bla bla bla bla bla bla bla bla bla bla bla";
  const content_bob2 = "This topic is too long , but I wanna try it !!"

  const topic_bob3 = "We have content too long";
  const content = "ten bytes!"
  let content_500_bytes = content.repeat(50);
  const content_bob3 = content_500_bytes + "+1"

  const topic_bob4 = "I don`t like Alice";
  const content_bob4 = "I bet Alice will dislikes this!";

  const comment_tmp = "I don`t like you Bob!"
  const comment_alice1 = comment_tmp.repeat(24);

  const comment_alice2 = "I dont`t like you Bob. It is enough if I say it once"

  describe("Initialize Tweet", async () => {
    it("Initialize Tweet!", async () => {
      await airdrop(provider.connection, bob.publicKey);
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob1, bob.publicKey, program.programId);

      await program.methods.initialize(topic_bob1, content_bob1).accounts(
        {
          tweetAuthority: bob.publicKey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([bob]).rpc({ commitment: "confirmed" })

      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob1, content_bob1, 0, 0, tweet_bump
      )
    });
    it("Cannot initialize tweet with topic longer than 32 bytes!", async () => {

      let should_fail = "This Should Fail"
      try {
        const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob2, bob.publicKey, program.programId);

        await program.methods.initialize(topic_bob2, content_bob2).accounts(
          {
            tweetAuthority: bob.publicKey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([bob]).rpc({ commitment: "confirmed" })
      } catch (error) {
        assert.strictEqual(error.message, "Max seed length exceeded");
        should_fail = "Failed"
      }
      assert.strictEqual(should_fail, "Failed")
    });
    it("Cannot initialize tweet with content longer than 500 bytes!", async () => {
      let should_fail = "This Should Fail"
      try {
        const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob3, bob.publicKey, program.programId);

        await program.methods.initialize(topic_bob3, content_bob3).accounts(
          {
            tweetAuthority: bob.publicKey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([bob]).rpc({ commitment: "confirmed" })
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "ContentTooLong");
        should_fail = "Failed"
      }
      assert.strictEqual(should_fail, "Failed")
    });
    it("Bob can Initialize second Tweet!", async () => {
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);

      await program.methods.initialize(topic_bob4, content_bob4).accounts(
        {
          tweetAuthority: bob.publicKey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([bob]).rpc({ commitment: "confirmed" })
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 0, 0, tweet_bump
      )
    });
  });

  describe("Alice wants to react on tweet!", async () => {
    it("Alice can like Bob`s Tweet 1!", async () => {
      await airdrop(provider.connection, alice.publicKey);

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob1, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      await program.methods.likeTweet().accounts(
        {
          reactionAuthor: alice.publicKey,
          tweetReaction: reaction_pkey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob1, content_bob1, 1, 0, tweet_bump
      )
      await checkReaction(
        program, reaction_pkey, alice.publicKey, tweet_pkey, reaction_bump
      )
    });
    it("Alice cannot like Bob`s Tweet 1 two times!", async () => {

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob1, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      let should_fail = "This should fail";
      try {
        await program.methods.likeTweet().accounts(
          {
            reactionAuthor: alice.publicKey,
            tweetReaction: reaction_pkey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([alice]).rpc({ commitment: "confirmed" })
      } catch (error) {
        should_fail = "Failed"
        assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
      }
      assert.strictEqual(should_fail, "Failed");
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob1, content_bob1, 1, 0, tweet_bump
      )
    });
    it("She cannot also dislikes it!", async () => {

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob1, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      let should_fail = "This should fail";
      try {
        await program.methods.dislikeTweet().accounts(
          {
            reactionAuthor: alice.publicKey,
            tweetReaction: reaction_pkey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([alice]).rpc({ commitment: "confirmed" })
      } catch (error) {
        should_fail = "Failed"
        assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
      }
      assert.strictEqual(should_fail, "Failed");

      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob1, content_bob1, 1, 0, tweet_bump
      )
    });
    it("Alice dislikes Bob`s second Tweet!", async () => {
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      await program.methods.dislikeTweet().accounts(
        {
          reactionAuthor: alice.publicKey,
          tweetReaction: reaction_pkey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 0, 1, tweet_bump
      )
      await checkReaction(
        program, reaction_pkey, alice.publicKey, tweet_pkey, reaction_bump
      )

    });
    it("But she certainly cannot do that twice!", async () => {

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      let should_fail = "This should fail";
      try {
        await program.methods.dislikeTweet().accounts(
          {
            reactionAuthor: alice.publicKey,
            tweetReaction: reaction_pkey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([alice]).rpc({ commitment: "confirmed" })
      } catch (error) {
        should_fail = "Failed"
        assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
      }
      assert.strictEqual(should_fail, "Failed");

      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 0, 1, tweet_bump
      )

      try {
        await program.methods.likeTweet().accounts(
          {
            reactionAuthor: alice.publicKey,
            tweetReaction: reaction_pkey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([alice]).rpc({ commitment: "confirmed" })
      } catch (error) {
        should_fail = "Failed"
        assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
      }
      assert.strictEqual(should_fail, "Failed");
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 0, 1, tweet_bump
      )
    });
  });
  describe("Alice changed her mind about the reactions!", async () => {
    it("Alice changed her mind about Bob`s second Tweet!", async () => {
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      await program.methods.reactionRemove().accounts(
        {
          reactionAuthor: alice.publicKey,
          tweetReaction: reaction_pkey,
          tweet: tweet_pkey,
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 0, 0, tweet_bump
      )

    });
    it("So she can react like for Bob`s second Tweet!", async () => {

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [reaction_pkey, reaction_bump] = getReactionAddress(alice.publicKey, tweet_pkey, program.programId);

      await program.methods.likeTweet().accounts(
        {
          reactionAuthor: alice.publicKey,
          tweetReaction: reaction_pkey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })
      await checkTweet(
        program, tweet_pkey, bob.publicKey, topic_bob4, content_bob4, 1, 0, tweet_bump
      )
      await checkReaction(
        program, reaction_pkey, alice.publicKey, tweet_pkey, reaction_bump
      )

    });
  });
  describe("Alice decided that maybe small comment about Bob`s tweet would be great!", async () => {
    it("Firstly she wants to comment a lot of stuff!", async () => {

      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [comment_pkey, comment_bump] = getCommentAddress(comment_alice1, alice.publicKey, tweet_pkey, program.programId);

      let should_fail = "This Should Fail"
      try {
        await program.methods.commentTweet(comment_alice1).accounts(
          {
            commentAuthor: alice.publicKey,
            comment: comment_pkey,
            tweet: tweet_pkey,
            systemProgram: anchor.web3.SystemProgram.programId
          }
        ).signers([alice]).rpc({ commitment: "confirmed" })
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "CommentTooLong");
        should_fail = "Failed"
      }
      assert.strictEqual(should_fail, "Failed")

    });
    it("But if the comment is not that long she can tweet on Bob`s second tweet!", async () => {
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [comment_pkey, comment_bump] = getCommentAddress(comment_alice2, alice.publicKey, tweet_pkey, program.programId);

      await program.methods.commentTweet(comment_alice2).accounts(
        {
          commentAuthor: alice.publicKey,
          comment: comment_pkey,
          tweet: tweet_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })
      await checkComment(
        program, comment_pkey, alice.publicKey, tweet_pkey, comment_alice2, comment_bump
      )
    });
  });
  describe("But Alice has bad day today, so she is unsure about her actions, she wants to delete the Comment!", async () => {
    it("She changed her mind about the comment !", async () => {
      const [tweet_pkey, tweet_bump] = getTweetAddress(topic_bob4, bob.publicKey, program.programId);
      const [comment_pkey, comment_bump] = getCommentAddress(comment_alice2, alice.publicKey, tweet_pkey, program.programId);

      await program.methods.commentRemove().accounts(
        {
          commentAuthor: alice.publicKey,
          comment: comment_pkey,
        }
      ).signers([alice]).rpc({ commitment: "confirmed" })

      let thisShouldFail = "This should fail"
      try {
        let commentData = await program.account.comment.fetch(comment_pkey);
      } catch (error) {
        thisShouldFail = "Failed"
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
      }
      assert.strictEqual(thisShouldFail, "Failed")

    });
  });

});


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function getCommentAddress(comment_content: string, author: PublicKey, parent_tweet: PublicKey, programID: PublicKey) {
  let hexString = crypto.createHash('sha256').update(comment_content, 'utf-8').digest('hex');
  let content_seed = Uint8Array.from(Buffer.from(hexString, 'hex'));


  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(COMMENT_SEED),
      author.toBuffer(),
      content_seed,
      parent_tweet.toBuffer(),
    ], programID);
}

function getTweetAddress(topic: string, author: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(topic),
      anchor.utils.bytes.utf8.encode(TWEET_SEED),
      author.toBuffer()
    ], programID);
}

function getReactionAddress(author: PublicKey, tweet: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(TWEET_REACTION),
      author.toBuffer(),
      tweet.toBuffer(),
    ], programID);
}


function stringToUtf8ByteArray(inputString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(inputString);
}

// Function to pad a byte array with zeroes to a specified length
function padByteArrayWithZeroes(byteArray: Uint8Array, length: number): Uint8Array {
  if (byteArray.length >= length) {
    return byteArray;
  }

  const paddedArray = new Uint8Array(length);
  paddedArray.set(byteArray, 0);
  return paddedArray;
}

class SolanaError {
  static contains(logs, error): boolean {
    const match = logs?.filter(s => s.includes(error));
    return Boolean(match?.length)
  }
}


async function checkTweet(
  program: anchor.Program<Twitter>,
  tweet: PublicKey,
  tweet_author?: PublicKey,
  topic?: string,
  content?: string,
  likes?: number,
  dislikes?: number,
  bump?: number,
) {
  let tweetData = await program.account.tweet.fetch(tweet);

  if (tweet_author) {
    assert.strictEqual(tweetData.tweetAuthor.toString(), tweet_author.toString())

  }
  if (topic) {
    const utf8ByteArray_topic = stringToUtf8ByteArray(topic);
    const paddedByteArray_topic = padByteArrayWithZeroes(utf8ByteArray_topic, 32);
    assert.strictEqual(tweetData.topic.toString(), paddedByteArray_topic.toString());
    assert.strictEqual(tweetData.topicLength.toString(), utf8ByteArray_topic.length.toString());
  }
  if (content) {
    const utf8ByteArray_content = stringToUtf8ByteArray(content);
    const paddedByteArray_content = padByteArrayWithZeroes(utf8ByteArray_content, 500);
    assert.strictEqual(tweetData.content.toString(), paddedByteArray_content.toString());
  }
  if (likes || likes == 0) {
    assert.strictEqual(tweetData.likes.toString(), new anchor.BN(likes).toString())
  }
  if (dislikes || dislikes == 0) {
    assert.strictEqual(tweetData.dislikes.toString(), new anchor.BN(dislikes).toString())
  }
  if (bump) {
    assert.strictEqual(tweetData.bump.toString(), bump.toString())

  }
}

async function checkReaction(
  program: anchor.Program<Twitter>,
  reaction: PublicKey,
  reaction_author?: PublicKey,
  parent_tweet?: PublicKey,
  bump?: number,
) {
  let reactionData = await program.account.reaction.fetch(reaction);

  if (reaction_author) {
    assert.strictEqual(reactionData.reactionAuthor.toString(), reaction_author.toString())
  }
  if (parent_tweet) {
    assert.strictEqual(reactionData.parentTweet.toString(), parent_tweet.toString());
  }
  if (bump) {
    assert.strictEqual(reactionData.bump.toString(), bump.toString())

  }
}


async function checkComment(
  program: anchor.Program<Twitter>,
  comment: PublicKey,
  comment_author?: PublicKey,
  parent_tweet?: PublicKey,
  content?: string,
  bump?: number,
) {
  let commentnData = await program.account.comment.fetch(comment);

  if (comment_author) {
    assert.strictEqual(commentnData.commentAuthor.toString(), comment_author.toString())
  }
  if (parent_tweet) {
    assert.strictEqual(commentnData.parentTweet.toString(), parent_tweet.toString())
  }
  if (content) {
    const utf8ByteArray_content = stringToUtf8ByteArray(content);
    const paddedByteArray_content = padByteArrayWithZeroes(utf8ByteArray_content, 500);
    assert.strictEqual(commentnData.content.toString(), paddedByteArray_content.toString())
    assert.strictEqual(commentnData.contentLength.toString(), utf8ByteArray_content.length.toString())

  }
  if (bump) {
    assert.strictEqual(commentnData.bump.toString(), bump.toString())
  }
}
