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
```

<br>

* Now, test the connection by running the test located at `test/connecting.js`

<br>

```
npx esrun tests/connecting.ts

✅ Connected!
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