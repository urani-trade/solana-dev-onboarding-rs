import { 
  Connection,
  Transaction, 
  clusterApiUrl, 
  SystemProgram, 
  sendAndConfirmTransaction,
  PublicKey
} from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config"

// The amount of SOL to send
const LAMPORTS_TO_SEND = 1000;
const LAMPORT_AIRDROP = 10000;
const LAMPORT_FOR_RENT = 1000;

// Connect to the devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// The sender's keypair
const sender = getKeypairFromEnvironment("KEYPAIR_SECRET");
console.log(`Sender address: ${sender.publicKey.toBase58()}`);

// The sender's balance
const sender_balance = await connection.getBalance(sender.publicKey);
console.log(`Sender balance: ${sender_balance}`);

// Create a function that airdrops SOL to the sender's account
// if they don't have enough balance
async function airdropToAccount(account: sender, lamports: LAMPORT_AIRDROP) {
  if (sender_balance < lamports) {
    console.log(`Airdropping ${lamports} to ${account.publicKey.toBase58()}`);
    await connection.requestAirdrop(sender.publicKey, LAMPORT_AIRDROP);
  }
}

// Because accounts have to be rent-exempt to send transactions,
// we will supply an existing account with enough balance
const destination = process.argv[2] || null;
if (!destination) {
  console.log(`Please provide a public key to send to!`);
  process.exit(1);
}

// The destination's balance
const destination_balance = await connection.getBalance(new PublicKey(destination));
console.log(`Destination balance: ${destination_balance}`);

// Create a new transaction
const transaction = new Transaction()
  .add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: destination,
      lamports: LAMPORTS_TO_SEND,
    })
  );
console.log(`Transaction created!`);

// Send the transaction
const signature = await sendAndConfirmTransaction(
    connection, 
    transaction, [
      sender
  ]);
console.log(`Transaction sent!`);

// Log the result
console.log('Sent', LAMPORTS_TO_SEND, 'to', destination, 'with signature', signature);
  