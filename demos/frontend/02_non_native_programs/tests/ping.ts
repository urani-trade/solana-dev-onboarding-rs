import { 
    clusterApiUrl,
    Connection,
    TransactionInstruction,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
  } from "@solana/web3.js";
import { 
    getKeypairFromEnvironment, 
    airdropIfRequired 
} from "@solana-developers/helpers";
import "dotenv/config"

// Get the sender's keypair and create a connection to the devnet cluster
const sender = getKeypairFromEnvironment('KEYPAIR_SECRET')
const connection = new Connection(clusterApiUrl('devnet'))

// Air drop SOL to the sender's account if required
const airdrop = await airdropIfRequired(
  connection,
  sender.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL,
);

// Get the program's address and the program data account's address
const PING_PROGRAM_ADDRESS = new PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa')
const PING_PROGRAM_DATA_ADDRESS =  new PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod')

// Create a new transaction, then initialize a PublicKey for the 
// program account, and another for the data account
const transaction = new Transaction()
const programId = new PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new PublicKey(PING_PROGRAM_DATA_ADDRESS)

// Create the instruction, which needs to include the public key for 
// the Ping program and an array with all the accounts that will be 
// read from or written to. In this example program, only the data 
// account referenced above is needed.
const instruction = new TransactionInstruction({
  keys: [
    {
      pubkey: pingProgramDataId,
      isSigner: false,
      isWritable: true
    },
  ],
  programId
})

// Add the instruction to the transaction we created. 
// Then, call sendAndConfirmTransaction() 
transaction.add(instruction)

const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [sender]
)
console.log(`✅ Transaction completed! Signature is ${signature}`)
console.log(`You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
