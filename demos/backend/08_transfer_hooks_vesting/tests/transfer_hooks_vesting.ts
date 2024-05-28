import * as anchor from "@coral-xyz/anchor";
import { IDL, VestingTemplate } from "../target/types/vesting_template";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";


describe("vesting_template", () => {
  
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  const programId = new PublicKey("2qaMkdHBvzCZsVNwcb5riqq4dm5tbKmph2BuN8u7Mr9Y");
  const program = new anchor.Program<VestingTemplate>(IDL, programId, provider);

  // Generate keypair to use as address for the transfer-hook enabled mint
  const mint = new Keypair();
  const decimals = 0;

  // Sender token account address
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Recipient token account address
  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
    program.programId
  );

  const vestingAccount = PublicKey.findProgramAddressSync([Buffer.from("vesting"), mint.publicKey.toBuffer(), sourceTokenAccount.toBuffer()], program.programId)[0];
  const mintAuth = PublicKey.findProgramAddressSync([Buffer.from("vesting_auth"), mint.publicKey.toBuffer()], program.programId)[0];

  it("Create Mint Account with Transfer Hook Extension", async () => {
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports =
      await provider.connection.getMinimumBalanceForRentExemption(mintLen);
  
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports: lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferHookInstruction(
        mint.publicKey,
        wallet.publicKey,
        program.programId, // Transfer Hook Program ID
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        mintAuth,
        null,
        TOKEN_2022_PROGRAM_ID,
      ),
    );
  
    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer, mint],
    );
    console.log(`Transaction Signature: ${txSig}`);
  });

  it("Create Token Accounts", async () => {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        sourceTokenAccount,
        wallet.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );

    console.log(`Transaction Signature: ${txSig}`);
  });

  // Account to store extra accounts required by the transfer hook instruction
  it("Create ExtraAccountMetaList Account", async () => {
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        payer: wallet.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
        mint: mint.publicKey,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction,
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );
    console.log("Transaction Signature:", txSig);
  });

  interface VestingData {
    amountBasisPoint: number;
    time: anchor.BN;
  }

  const vestingData: VestingData[] = [
    {
      amountBasisPoint: 10000,
      time: new anchor.BN(Math.floor(Date.now() + 3600 / 1000)),
    },
  ];

  it("Create Vesting Account", async () => {
    const tx = await program.methods
    .createVestingAccount(
      vestingData,
      new anchor.BN(1000 * 10 ** decimals),
    )
    .accounts({
      mint: mint.publicKey,
      token: sourceTokenAccount,
      vestingAccount,
    })
    .signers([wallet.payer]).rpc({ skipPreflight: true });

    console.log("Signature:", tx);
  });

  it("Claim Tokens", async () => {
    const tx = await program.methods
    .claimTokens()
    .accounts({
      mint: mint.publicKey,
      token: sourceTokenAccount,
      mintAuth,
      vestingAccount,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .signers([wallet.payer]).rpc({ skipPreflight: true });

    console.log("Signature:", tx);
  });
});