# 🛹 Introduction to the Solana Blockchain


<br>

### tl; dr

<br>

* The Solana network can be thought of as one massive global computer. Anyone can store and execute code for a fee.

* To interact with these programs, you send a transaction from a Solana client, a collection of instructions for the blockchain to execute.

* The executable code to perform these actions in the network is called programs, and programs can call each other through cross-program invocation (which makes the Solana blockchain highly composable).

* Like in Linux, everything is a file; in Solana, everything is an account. Addresses in the network are represented by the public keys from asymmetric cryptography (on an ed25519 curve).

* Everything else is built around these ideas.

<br>

---

### ➡️ Transactions

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
      - an unsigned 8-bit `program_id` (to identify an on-chain program that can interpret the opaque data) -> this specifies a program
      - a compact-array of account address indexes, each a 32-byte of arbitrary data (when the address requires a digital signature, the runtime interprets it as a public key of an ed25519 keypair) -> these are the transaction's accounts passed to the program
      - a compact-array of opaque 8-bit data and a special multi-byte encoding of 16 buts, compact-u16, for its length -> this is the data

<br>

#### What's an Instruction

<br>

* Each instruction specifies a single program and carries a general purpose byte that is passed to the program (along with the accounts).

* The contents of the instruction data convey what operation the program needs to perform.

* The [Solana Program Library's Token program](https://github.com/solana-labs/solana-program-library/tree/master/token) shows how instruction data can be encoded efficiently for fixed-sized types.

* Since a transaction can contain instructions in any order, programs should be hardened to safely handle any possible instructions sequence. 
  - For example, to deinitizlize an account, the program shoudl explicitly set the account's data to zero.

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

### ➡️ Accounts


<br>

* Accounts on Solana are storage spaces that can hold data up to 10MB.

* Solana clients use an address (a 256-bit public key) to find an account.

* Accounts can hold arbitrary persistent data and hold ownership metadata for the runtime
  * The metadata also includes the lifetime info and is expressed by lamports.

* Accounts are referenced by an instruction representing the on-chain state and server as both the inputs and outputs of a program.

* Accounts can be signers if the transaction includes their addresses as a digital signature. 

* Accounts can be treated as read-only by transactions. 
    - This enables parallel account processing between transactions.

* An account is a program if it's marked as "executable" in its metadata. 
    - Accounts that store programs are owned by the `BPFLoader`, a program that can be used to deploy and upgrade other programs.
    - The `BPFLoader` is owned by the **Native Loader**.

* If a program is marked as final (non-upgradeable), the runtime makes the account's data (the program) immutable.


<br>

#### Creating an Account

<br>

* To create an account, a client generates a keypair and registers its public key.

* A created account is initialized to be owned by a built-in program (the System program). It includes owner metadata (a `program_id`).

* Accounts are held in validator memory by paying a "rent". Any account that drops to zero lamports is removed. 
  - Currently, all new accounts are required to be rent-exempt.
  - An account is considered rent-exempt if it holds at least 2 years' worth of rent (checked every time an account's balance is reduced).
  - Rent can be estimated via the command `solana rent`.


<br>



---

### ➡️ Programs

<br>

* Solana Programs are the executable code that interprets the instructions sent inside transactions on the blockchain.

* They run on top of the Sealevel runtime (Solana's parallel and high-speed processing model).
Programs are special types of accounts that are marked as "executable".

* Programs can own accounts and change the data of the accounts they own. Unlike other blockchains, they can also be upgraded by their owner.

* The instructions's `program_id` specifies which program will process the instructions. 

* Programs on Solana don't store data or state between transactions: these are stored in accounts.

* Programs can be:
  
  - **Native Programs**: programs built directly into the core of the Solana blockchain. Upgrades are controlled via the releases to the different clusters. Examples include:
      * System Program: create new accounts, transfer tokens
      * BPG Loader Program: Deploys, upgrades, and executes programs on-chain
      * Vote program: Create and manage accounts that track validator voting state and rewards
  
  - **Chain Programs**: written by users and deployed directly to the blockchain for anyone to interact and execute. 
      * The Solana Labs also keep a library of them, the [Solana Program Library](https://spl.solana.com/), a collection of on-chain programs targeting the Sealevel parallel runtime.




<br>


#### Memory on Solana

<br>


* Memory inside a Solana cluster can be thought of as a monolithic heap of data. All state lives in this heap.

* Programs each have access ot their own part of the heap.

* A memory region is "account" (and some programs own thousands of independent account)
    - Each memory region has a program that manages it (the `owner`).
    


<br>



#### Cross-Program Invocation (CPI)

<br>

* Cross-program invocation is how Solana's runtime allows programs to call other programs. This is achieved by one program invoking an instruction of the other.

* The invoking program, `invoke()`, requires the caller to pass all the accounts required by the instruction being invoked, except for the executbale account (`program_id`).

* The invoking program is halted until the invoked program finishes processing the instruction.

* The runtime uses the caller program's privileges to determine the callee's privileges.

* Cross-program invocations are constrained to a depth of 4.

<br>


> [!IMPORTANT]
> When writing CPI, it's important to not pull in the dependent program's entrypoint symbols (because they may conflict with the program's own). To avoid this, programs should define an `no-entrypoint` feature in `Cargo.toml`.

<br>

#### Program Derived Address (PDA)

<br>

* Program derived address allows programs to issue instructions that contain signed accounts that were not signed in the original transaction.

* With PDA, a program may be given the authority over an account for a while.

* With PDA, programs can control specific (program) addresses so that no external user can generate valid transactions with signatures for that address.

* PDA allows programs to programmatically sign for program addresses that are present in instructions invoked via CPI.

<br>

#### Private Keys for Program Addresses

<br>

* A program address does not lie on the ed25519 curve, so it has no valid private key and cannot generate a signature.

* However, a program address can be used by a program to issue an instruction that includes itself as a signer.

* Program addresses are deterministically derived from a collection of seeds and a `program_id` using a 256-bit pre-image resistant hash function.

* Programs can deterministically derive any number of addresses by using seeds. These seeds can symbolically identify how the addresses are used. 


<br>

---

### ➡️ Wallets

<br>


* A wallet is a pair of public and private keys used to verify actions on the blockchain. 

* The public key is used to identify the account, and the private key is used to sign transactions.

* You can choose your wallet from [this list](https://solana.com/ecosystem/explore?categories=wallet).

<br>

---

### ➡️ Development Overview

<br>

* Development takes two steps:
    1. first, deploy the program in the blockchain.
    2. then, anyone can communicate with these programs by writing dApps connecting to a node's JSON RPC API (via HTTP or WebSocket methods). DApps can submit transactions with instructions to these programs via a client SDK.
  

<br>

----

### ➡️ References

<br>

* [Solana Transactions](https://solana.com/docs/core/transactions)
* [Solana Programs](https://solana.com/docs/core/programs#native-programs)
* [Accounts and Storing State](https://solana.com/docs/core/accounts)
* [Cross-Program Invocation](https://solana.com/docs/core/cpi)
* [Wallets Explained](https://solana.com/developers/guides/intro/wallets-explained)
* [Terminology](https://solana.com/docs/terminology#instruction) and [FAQ](https://solana.com/docs/programs/faq)
* [Solana Beta StackExchange](https://solana.stackexchange.com/)
