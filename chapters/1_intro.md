# 🛹 Introduction to the Solana Blockchain [IN CONSTRUCTION]


<br>

#### ➡️ [The Solana network can be thought of as one massive global computer, where anyone can store and execute code for a fee](https://solana.com/docs/intro/dev). 
#### ➡️ To interact with these programs, you need to send a transaction (tx) from a Solana client.

<br>

---

### Transactions

<br>

* A transaction is the unit of activity on the Solana blockchain: a signed data structure containing instructions for the network to perform a particular operation.
    - You need a transaction to create, update, or delete data on-chain.
    - You can read data without a transaction.
    - A transaction contains an array of digital signatures and the message (the actual instructions that the transaction is issuing to the network, with a header, the account addresses, the recent blockhash, and instructions).

<br>

---

### Lamports

<br>

* Transaction fees are paid in "Lamports", the smallest units of SOL (0.000000001 SOL).
    - The fee is paid to the validators who process the transaction.
    - Transaction fees are calculated based on two main parts: 1) a statically set base fee per signature, and 2) the computational resources used during the transaction.
  

<br>

---

### Accounts


<br>

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
