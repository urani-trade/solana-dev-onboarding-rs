const { Buffer } = require("buffer");
const bs58 = require("bs58");
const web3 = require("@solana/web3.js");


// Connect to the devnet cluster
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

// Create a new keypair and airdrop SOL to it
let toPublicKey = web3.Keypair.generate().publicKey;
let fromPublicKey = web3.Keypair.generate();

let airdropSignature = await connection.requestAirdrop(
  fromPublicKey.publicKey,
  web3.LAMPORTS_PER_SOL,
);

let receipt = await connection.confirmTransaction({ signature: airdropSignature });
console.log("Airdrop confirmed:", receipt);


// Create a new transaction using the System Program
let type = web3.SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
let data = Buffer.alloc(type.layout.span);
let layoutFields = Object.assign({ instruction: type.index });
type.layout.encode(layoutFields, data);
console.log("Instruction data:", data);

// Get the recent blockhash
let recentBlockhash = await connection.getRecentBlockhash();
console.log("Recent blockhash:", recentBlockhash);

// Create the message
let messageParams = {
  accountKeys: [
    fromPublicKey.publicKey.toString(),
    toPublicKey.toString(),
    web3.SystemProgram.programId.toString(),
  ],
  header: {
    numReadonlySignedAccounts: 0,
    numReadonlyUnsignedAccounts: 1,
    numRequiredSignatures: 1,
  },
  instructions: [
    {
      accounts: [0, 1],
      data: bs58.encode(data),
      programIdIndex: 2,
    },
  ],
  recentBlockhash,
};

let message = new web3.Message(messageParams);

console.log("Message params:", messageParams);
console.log("Message:", message);

// Sign and send the transaction
let transaction = web3.Transaction.populate(message, [
  fromPublicKey.publicKey.toString(),
]);

receipt = await web3.sendAndConfirmTransaction(connection, transaction, [fromPublicKey]);
console.log("Transaction confirmed:", receipt);