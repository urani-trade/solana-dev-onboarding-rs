import * as anchor from "@coral-xyz/anchor";
import { IDL, EpplexProgram } from "../target/types/nft";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
} from "@solana/web3.js";
import {  
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";


describe("nft", () => {
  const wallet = anchor.Wallet.local();
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const connection = provider.connection;
  const programId = new PublicKey("CVDULabQV9WSVkyYnSCegKtEKmk1GLCW6nKjfWnU7BHG");

  const program = new anchor.Program<EpplexProgram>(IDL, programId, provider);

  // Helpers
  function wait(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`);
    return signature;
  }

  const seed =  new anchor.BN(Math.floor(Math.random() * 100000))
  const ruleCreator = wallet.publicKey;
  const renewalPrice = new anchor.BN(1000); // In Lamports
  const treasury = Keypair.generate().publicKey;
  const rule = PublicKey.findProgramAddressSync([Buffer.from("ephemeral_rule"), seed.toArrayLike(Buffer, "le", 8)], program.programId)[0];

  const endingTime = new anchor.BN(Date.now() + 7 * 24 * 3600);
  const name = "Epplex Membership";
  const symbol = "EPPLEX";
  const uri = "https://epplex.io/membership";
  const membership = Keypair.generate();
  const membershipAta = getAssociatedTokenAddressSync(membership.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
  const data = PublicKey.findProgramAddressSync([Buffer.from("ephemeral_data"), membership.publicKey.toBuffer()], program.programId)[0];
  const auth = PublicKey.findProgramAddressSync([Buffer.from("ephemeral_auth")], program.programId)[0];

  it("Creates a new Rule", async () => {
    await program.methods
    .createRule(seed, ruleCreator, renewalPrice, treasury)
    .accounts({rule})
    .signers([wallet.payer]).rpc().then(confirm).then(log);
  });

  it("Modify the Rule", async () => {
    await program.methods
    .modifyRule(seed, ruleCreator, renewalPrice, treasury)
    .accounts({rule})
    .signers([wallet.payer]).rpc().then(confirm).then(log);
  });

  it("Create a new Membership NFT", async () => {
    await program.methods
    .createMembership(endingTime, name, symbol, uri)
    .accounts({
      ruleCreator,
      payer: wallet.publicKey,
      membership: membership.publicKey,
      membershipAta,
      rule,
      data,
      auth,
      rent: SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([membership, wallet.payer]).rpc({skipPreflight: true}).then(confirm).then(log);
  });

  it("Add Time to Membership", async () => {
    await program.methods
    .addTime(new anchor.BN(7 * 24))
    .accounts({
      treasury,
      membership: membership.publicKey, 
      rule, 
      data, 
    })
    .signers([wallet.payer]).rpc({skipPreflight: true}).then(confirm).then(log);
  });

  it("Remove Time to Membership", async () => {
    await program.methods
    .removeTime(new anchor.BN(15 * 24))
    .accounts({
      treasury,
      membership: membership.publicKey, 
      rule, 
      data, 
    })
    .signers([wallet.payer]).rpc().then(confirm).then(log);
  });

  it("Burn Membership", async () => {
    await program.methods
    .burnMembership()
    .accounts({
      burner: wallet.publicKey,
      epplex: Keypair.generate().publicKey,
      membership: membership.publicKey,
      membershipAta,
      rule, 
      data, 
      auth,
      token2022Program: TOKEN_2022_PROGRAM_ID,
    })
    .signers([wallet.payer]).rpc({skipPreflight: true}).then(confirm).then(log);
  });


});
