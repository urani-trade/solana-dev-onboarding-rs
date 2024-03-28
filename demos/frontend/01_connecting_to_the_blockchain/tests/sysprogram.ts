import { 
    Connection, 
    Keypair,
    clusterApiUrl,
    SystemProgram,
    sendAndConfirmTransaction,
    Transaction
} from "@solana/web3.js";
const web3 = require("@solana/web3.js");


// Connect to the cluster
let connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Generate a new keypair and irdrop SOL for paying transactions
let payer = Keypair.generate();
let airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  web3.LAMPORTS_PER_SOL,
);

let success = await connection.confirmTransaction({ signature: airdropSignature });
console.log("Airdrop successful?", success.value.confirmationStatus);

// Allocate Account Data
let allocatedAccount = Keypair.generate();
let allocateInstruction = SystemProgram.allocate({
  accountPubkey: allocatedAccount.publicKey,
  space: 100,
});
console.log
console.log("Allocate Account Data created:", allocatedAccount.publicKey.toBase58());

// Create a transaction and send it
let transaction = new Transaction().add(allocateInstruction);

let receipt = await sendAndConfirmTransaction(connection, transaction, [
  payer,
  allocatedAccount,
]);
console.log("Allocation successfully sent?", receipt);

// Create a nonce account
let nonceAccount = Keypair.generate();
let minimumAmountForNonceAccount =
  await connection.getMinimumBalanceForRentExemption(web3.NONCE_ACCOUNT_LENGTH);

// Create a transaction and send it
let createNonceAccountTransaction = new Transaction().add(
  web3.SystemProgram.createNonceAccount({
    fromPubkey: payer.publicKey,
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: payer.publicKey,
    lamports: minimumAmountForNonceAccount,
  }),
);
console.log("Nonce account created:", nonceAccount.publicKey.toBase58());

receipt = await sendAndConfirmTransaction(
  connection,
  createNonceAccountTransaction,
  [payer, nonceAccount],
);
console.log("Transaction sent?", receipt);
