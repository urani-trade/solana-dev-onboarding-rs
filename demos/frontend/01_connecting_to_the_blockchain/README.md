# 🛹 Demo 1: Interacting with the Solana Blockchain


<br>

### Setting up

<br>

* In this demo, we will be using [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) package. You can install it with:

<br>

```
npm install
```

<br>

* The next step is to create your own keypair, with `Keypair.generate()`, by running `npx esrun tests/setup.ts`:

<br>

```javascript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The private key is: `, keypair.secretKey);
```

<br>

* Take note of your private key and add it to an `.env` file:

<br>

```
cp .env_example .env
vim .env
```

<br>

* To learn how to load your keys from `.env`, take a look at `tests/loading_env.ts`:

<br>

```javascript
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


const keypair = getKeypairFromEnvironment("KEYPAIR_SECRET");
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The private key is: `, keypair.secretKey);
```

<br>

---

### Connecting to the Network

<br>

* Let's start connecting to the `devnet`, with a very simple script:

<br>

```javascript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
console.log(`✅ Connected!`)

let slot = await connection.getSlot();
console.log('✅ Current slot:', slot);

let blockTime = await connection.getBlockTime(slot);
console.log('✅ Current block time:', blockTime);

let block = await connection.getBlock(slot);
console.log('✅ Current block:', block);

let slotLeader = await connection.getSlotLeader();
console.log('✅ Current slot leader:', slotLeader);
```

<br>

* Now, test the connection by running the test located at `test/connecting.js`

<br>

```shell
npx esrun tests/connecting.ts

✅ Connected!
✅ Current slot: 288483879
✅ Current block time: 1711651996
✅ Current block: {
  blockHeight: 276777181,
  blockTime: 1711651996,
  blockhash: 'BUa7WHUsFk57e6vuUk4E465KD2Wbjfr8kEMnGt8rQuek',
  parentSlot: 288483878,
  previousBlockhash: '2X7YzjmSJNBmRhmvEHxvRqzLmTW7niRRW2vSLgkYPz58',
  rewards: [
    {
      commission: null,
      lamports: -46,
      postBalance: 77290,
      pubkey: 'EZDo69JQyud4YEMQPebqZvAvvofs2tgA5LLX7wxXk9sx',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: -126,
      postBalance: 1978296,
      pubkey: 'EZDqi7keNM5dJXGvBEbSKPiSArjZqiEZGXCqkzMtZVcX',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 53324,
      postBalance: 1007469649584308,
      pubkey: 'dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV',
      rewardType: 'Fee'
    },
    {
      commission: null,
      lamports: 21,
      postBalance: 208159699129487,
      pubkey: 'dv3qDFk1DTF36Z62bNvrCXe9sKATA6xvVy6A798xxAS',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 21,
      postBalance: 3254383064416,
      pubkey: 'dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 21,
      postBalance: 1408492493813773,
      pubkey: 'dv4ACNkpYPcE3aKmYDqZm9G5EB3J4MRoeE7WNDRBVJB',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 20,
      postBalance: 1007469649584328,
      pubkey: 'dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 1,
      postBalance: 1999418212009,
      pubkey: 'BrX9Z85BbmXYMjvvuAWU8imwsAqutVQiDg9uNfTGkzrJ',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 1,
      postBalance: 798148481722,
      pubkey: 'Cw6X5R68muAyGRCb7W8ZSP2YbaRjwMs1t5sBEPkhdwbM',
      rewardType: 'Rent'
    },
    {
      commission: null,
      lamports: 1,
      postBalance: 891316,
      pubkey: '97YUjL2EK42M6jG5VA4fKuVxGXDfxsC5Zawd9haLQJGk',
      rewardType: 'Rent'
    }
  ],
  transactions: [
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined },
    { meta: [Object], transaction: [Object], version: undefined }
  ]
}
Current slot leader: dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV
```

<br>

---

### Reading from the Network

<br>

* Let's write another simple script to get the balance of an address:

<br>

```javascript
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config"

const connection = new Connection(clusterApiUrl("devnet"));
const address = getKeypairFromEnvironment("KEYPAIR_SECRET").publicKey;
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`); 
console.log(`✅ Finished!`)
```

<br>

* Run `test/reading.js` to check the balance of your account:

<br>

```
npx esrun tests/reading.ts

The balance of the account at Ez3Ky2kLbYuDehzSq1mYaVfJiVXfWzub6mxuVEprXDQ is 3 SOL
✅ Finished!
```

<br>

### Transactions

<br>

* With `solana/web3.js`, you can create a new transaction with the constructor `new Transaction()`.

* To transfer SOLs, you can add instructions to this transaction object with:
  - the `add()` method or 
  - by making an instruction for the `SystemProgram` program (at address `11111111111111111111111111111111`)

* Let's see how it works, with `test/transfering.ts`:

<br>

```javascript
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
```


<br>

* Pick an existing address you have to be the sender, and then run:

<br>

```shell
npx esrun tests/transfering.ts <destination wallet>

Sender address: H8UwSX8snKwuQ84EjAcFTj7FxbdJU5m8S3SD2wmJFHMf
Sender balance: 4999984100
Destination balance: 7000006000
Transaction created!
Transaction sent!
Sent 1000 to 5Tt2B6dy87oUdtmj34B3ypDoYrPh5QBSZUmWDjpZ3sYy with signature xF18WnoF5BW8uiQxPA9tBcizGx6Q4wC41U8qF4YbwLRcAguNUCgiuv9WLdMqHLjhS2FMRcgyWfPbAQpB3W3nxxG
```

<br>

* Lastly, find your transaction at [Solana's explore](https://explorer.solana.com/) (devnet).


<br>

---

### SystemProgram 

<br>

* `SystemProgram` grants the ability to:
  - create accounts
  - allocate account data
  - assign an account to programs
  - work with nonce accounts
  - transfer lamports
  
* `SystemInstruction` can help with decoding and reading individual instructions.

<br>

* The following example explores `SystemProgram` for:
  1. allocating account data and sending them as a transaction
  2. creating nounce accounts and sending them as a transaction

<br>

```javascript
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
```

<br>

* Run with:

<br>

```
npx esrun tests/sysprogram.ts

Airdrop successful? confirmed
Allocate Account Data created: 2jz35DZv7ziD9aMLqrymiHRs4GugwxqH5TDs6AJz5tVb
Allocation successfully sent? 33weabxwDWLYhAxPuKzSxAiTt2Xcf6aY3z43NAGfFFZgPe73rstcKkh1GkhgzY6qRLYrr8Nf7qNS2ZQ2Td5cgMih
Nonce account created: HkQ4ufaiN3Eezqgf3LFLh2Dte1up1oerNVtB55CUixSA
Transaction sent? 4DWP9tKEoZNhhA2EFdvY97jZYxbSuwfMaaQEM3aAXV673kWVDKmLZYhu3YU5CAoxFEkqNwqRYq1bcJpiDS8u9XWZ
```

<br>

---

### Message with Buffer

<br>

* `Message` is used as another way to construct transactions. 

* A `Transaction` is a`Message` plus the list of required signatures required to execute the transaction.

<br>

```javascript
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
```

<br>

* Run:

<br>

```shell
npx esrun tests/message.ts

Airdrop confirmed: {
  context: { apiVersion: '1.18.4', slot: 288489729 },
  value: {
    confirmationStatus: 'confirmed',
    confirmations: 0,
    err: null,
    slot: 288489729,
    status: { Ok: null }
  }
}
Instruction data: <Buffer 02 00 00 00 00 00 00 00 00 00 00 00>
Recent blockhash: {
  blockhash: 'CkmtmkbMVJr4PcSCJwQ1SZjzqC7w2coGWuBGrnh1zxNc',
  feeCalculator: { lamportsPerSignature: 5000 }
}
Message params: {
  accountKeys: [
    'CdWzXScEdEHDfcZh58Z6rpij4rAq5umqRM1BwyxJfAxZ',
    'CJoYpZzqiRZCfQmfvktRMhgyAx38vSckYpHgZE6rUDRz',
    '11111111111111111111111111111111'
  ],
  header: {
    numReadonlySignedAccounts: 0,
    numReadonlyUnsignedAccounts: 1,
    numRequiredSignatures: 1
  },
  instructions: [
    { accounts: [Array], data: '3Bxs3zrfFUZbEPqZ', programIdIndex: 2 }
  ],
  recentBlockhash: {
    blockhash: 'CkmtmkbMVJr4PcSCJwQ1SZjzqC7w2coGWuBGrnh1zxNc',
    feeCalculator: { lamportsPerSignature: 5000 }
  }
}
Message: Message {
  header: {
    numReadonlySignedAccounts: 0,
    numReadonlyUnsignedAccounts: 1,
    numRequiredSignatures: 1
  },
  accountKeys: [
    PublicKey [PublicKey(CdWzXScEdEHDfcZh58Z6rpij4rAq5umqRM1BwyxJfAxZ)] {
      _bn: <BN: accb608dacdec7142e2fcd61a6629c769aab1aed23fcdc8ea4870bf68c28573a>
    },
    PublicKey [PublicKey(CJoYpZzqiRZCfQmfvktRMhgyAx38vSckYpHgZE6rUDRz)] {
      _bn: <BN: a800100932d4cb843848bdd76cbf491c4de3689f34a87db0af5e1123cb02de01>
    },
    PublicKey [PublicKey(11111111111111111111111111111111)] {
      _bn: <BN: 0>
    }
  ],
  recentBlockhash: {
    blockhash: 'CkmtmkbMVJr4PcSCJwQ1SZjzqC7w2coGWuBGrnh1zxNc',
    feeCalculator: { lamportsPerSignature: 5000 }
  },
  instructions: [
    { accounts: [Array], data: '3Bxs3zrfFUZbEPqZ', programIdIndex: 2 }
  ],
  indexToProgramIds: Map(1) {
    2 => PublicKey [PublicKey(11111111111111111111111111111111)] {
      _bn: <BN: 0>
    }
  }
}
Transaction confirmed: 61zv2tG4KdpTUiXcmRQMzqzrBRuAcUCb2fgFv7hQ8QqQt5UhvtcnbsbPCUiDKm7fXHfKmQWkpAGt4FGZYDJ9NWgt
```