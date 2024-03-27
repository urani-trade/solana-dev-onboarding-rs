# 🛹 Introduction to the Solana Blockchain


<br>

## tl; dr

* The Solana network can be thought of as one massive global computer. Anyone can store and execute code for a fee.
* To interact with these programs, you send a transaction from a Solana client, a collection of instructions for the blockchain to execute.
* The executable code to perform these actions in the network is called programs, and programs can call each other through cross-program invocation (which makes the Solana blockchain highly composable).
* Like in Linux, everything is a file; in Solana, everything is an account.
Everything else is built around these ideas

<br>

---

## Transactions

<br>

* A transaction is the unit of activity on the Solana blockchain. It is a signed data structure containing instructions for the network to perform a particular operation.
* Transactions create, update, or delete data on-chain, but you can read data without a transaction.
* On the Solana blockchain, program execution starts with transactions being submitted to the cluster.
* Each transaction consists of three parts: instructions, an array of accounts to read or write from, and one or more digital signatures.
* An instruction is the smallest execution logic on Solana, and it invokes programs that make calls to update the global state of the network.
* Each transaction consists of one or several instructions that will be processed by the runtime orderly and atomically. If any part of the instructions fails, the entire transaction fails.

<br>

#### What is inside a Transaction

<br>


* A compact-array of digital signatures of the given message:
    - Each digital signature is the ed25519 binary format and consumes 64 bytes.
    - The runtime verifies that the number of signatures matches the number in the first 8 bits of the message header. Each signature is signed by the private key corresponding to the public key at the same index in the message's account addresses array.

* A message containing a header, a compact array of account addresses, a recent blockhash, and a compact array of instructions:
    - The header contains 3 unsigned 8-bit values: the first is the number of required signatures in the containing transaction, the second is the number of those corresponding account addresses that are read-only, and the third is the message header in the number of read-only account addresses not requiring signatures.
    - The addresses that need signatures appear at the beginning of the account address array, first with the addresses for read-write, then the read-only accounts.
    - The blockhash contains a 32-byte SHA-256 hash, to prevent duplication and to give transactions lifetimes.
    - An instruction contains:
      - an unsigned 8-bit program `id` (to identify an on-chain program that can interpret the opaque data) -> this specifies a program
      - a compact-array of account address indexes, each a 32-byte of arbitrary data (when the address requires a digital signature, the runtime interprets it as a public key of an ed25519 keypair) -> these are the transaction's accounts passed to the program
      - a compact-array of opaque 8-bit data and a special multi-byte encoding of 16 buts, compact-u16, for its length -> this is the data

<br>

#### What's an instruction

<br>

* Each instruction specifies a single program and carries a general purpose byte that is passed to the program (along with the accounts).
* The contents of the instruction data convey what operation the program needs to perform.
* The [Solana Program Library's Token program](https://github.com/solana-labs/solana-program-library/tree/master/token) shows how instruction data can be encoded efficiently for fixed-sized types.
* Since a transaction can contain instructions in any order, programs should be hardened to safely handle any possible instructions sequence. For example, to deinitizlize an account, the program shoudl explicitly set the account's data to zero.

<br>

#### Transaction Fees

<br>

* Transaction fees are paid in "Lamports", the smallest units of SOL (0.000000001 SOL).
* The fee is paid to the validators who process the transaction.
Transaction fees are calculated based on two main parts:
  - a statically set base fee per signature
  - the computational resources used during the transaction.

<br>

---

### Programs

<br>

* Solana Programs are the executable code that interprets the instructions sent inside transactions on the blockchain.
* They run on top of the Sealevel runtime (Solana's parallel and high-speed processing model).
Programs are special types of accounts that are marked as "executable".
* Programs can own accounts and change the data of the accounts they own. Unlike other blockchains, they can also be upgraded by their owner.
* Programs are stateless, as the primary data stored in a program account is the compiled SBF code.
* Programs can be:
  - **Native Programs**: programs built directly into the core of the Solana blockchain.
  - **Chain Programs**: written by users and deployed directly to the blockchain for anyone to interact and execute. The Solana Labs also keep a library of them, the [Solana Program Library](https://spl.solana.com/).
* The instructions's program `id` specifies which program will process the instructions. 
* Programs on Solana don't store data/state: these are stored in accounts.

<br>

---

### Accounts


<br>

* Accounts referenced by an instruction represent on-chain state and server as both the inputs and outputs of a pogram.
* Accounts on Solana are storage spaces that can hold data up to 10MB. They can store data, programs, and native system programs.
  * All programs in Solana are stateless (they don't store any state data, only code).
  * If an account stores program code, it's market "executable" and can process instructions.
  * You can think of an account as a file: users can have many different files, and developers can write programs that can talk to these files.
  * The Solana client uses an address to look up an account: the address is a 256-bit public key.
  * The account also includes metadata that tells the runtime who is allowed to access the data and how.
  * When an account is created, it needs to be assigned some space, and tokens are required to rent this space. An account will be removed if it doesn't have enough tokens to cover the rent. However, if the account holds enough tokens to cover the rent for two years, it's considered "rent-exempt" and won't be deleted.


<br>


---

### Wallets

<br>

* A wallet is a pair of public and private keys used to verify actions on the blockchain. The public key is used to identify the account, and the private key is used to sign transactions.

<br>

---

### Development Overview

<br>

* Development takes two step:
    1. First, you deploy the program in the blockchain.
    2. Then, anyone can communicate with these programs by writing dApps connecting to a node's JSON RPC API (via HTTP or WebSocket methods). DApps can submit transactions with instructions to these programs via a client SDK.
  
<br>

<br>

* There are two sets of programs that are maintained by the Solana Labs teams:
  * Native Programs: used for core blockchain functionality like creating new accounts, assigning ownership, transferring SOL.
  * Solana Program Library (SPL): used for creating, swapping, and lending tokens, and generating stake pools and maintaining on-chain name service.
  * Both native and SPL programs can be interacted with using the Solana CLI and the SDKs.


<br>

----

### References

<br>

* [Solana Foundation dev documentation](https://solana.com/docs#start-learning)
* [Solana Transactions](https://solana.com/docs/core/transactions)
* [Solana Programs](https://solana.com/docs/core/programs#native-programs)
* [Terminology](https://solana.com/docs/terminology#instruction)