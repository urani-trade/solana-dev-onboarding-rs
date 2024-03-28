# 🛹 Demo 2: Building Non-Native Programs


<br>

### tl; dr

<br>

* In the previous demo, we used [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)'s `SystemProgram.transfer()` function to create an instruction to send SOL.

* In this demo, we will be working with non-native programs, and specifying how to create  creating instructions that are structured to match the corresponding program.

<br>

---

### Setup

<br>

* Run `npm install` from the root of the project.
* Create an `.env` file, similar to the [previous demo](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/01_connecting_to_the_blockchain).


<br>

---


### Understanding `TransactionInstruction`

<br>

* With `@solana/web3`, non-native instructions can be created with the `TransactionInstruction` constructor. 

* This constructor takes a single argument of the data type `TransactionInstructionCtorFields`, with:
  - an array of keys of type `AccountMeta`, where each object represents an account that will be read from or written to during a transaction's execution containing =
    - `pubkey`, the public key of the account
    - `isSigner`, a boolean representing whether or not the account is a signer on the transaction
    - `isWritable`, a boolean representing whether or not the account is written to during the transaction's execution
  - `programId`, the public key for the program being called
  - an optional `Buffer` containing data to pass to the program


<br>

```javascript
export type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>;
  programId: PublicKey;
  data?: Buffer;
};
```

<br>

* To illustrate this concept, let's create a script to ping an on-chain program that increments a counter each time it has been pinged.
* This program exists on the Solana Devnet at address `ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa` and stores its data in a specific account at the address `Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod`.


<br>

```javascript
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
```

<br>

* Run this code with:

<br>

```shell
npx esrun tests/ping.ts
```

<br>

* Now copy the transaction signature and paste into the search at [the Solana explore](https://explorer.solana.com/?cluster=devnet) to find details and logs about the transaction, including how many times the program has been pinged.

<br>

```shell
> Program logged: "Pinged 7982 time(s)!"
> Program consumed: 1396 of 200000 compute units
```