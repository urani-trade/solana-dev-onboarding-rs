# 🛹 In-Depth Solana Programs, SPL, CPI [IN CONSTRUCTION]

<br>

### Solana Programs

<br>

* Referred to as "smart contracts" on other blockchains, Solana programs are the executable code that interprets the instructions sent inside of each transaction on the blockchain.
* They can be deployed directly into the core of the network as Native Programs, or published by anyone as On Chain Programs.
* Both types of programs run on top of the Sealevel runtime, which is Solana's parallel processing model for high transactions speeds of the blockchain.
* Programs can be seen as a type of account that is marked as executable. They can own other accounts and can only change the data or debit accounts they own.
* Programs are considered stateless since the primary data stored in a program account is the compiled SBF code.
* When a Solana program is deployed onto the network, it's marked as "executable" by the BPF loader program. This allows the Solana runtime to execute t
* Unlike other blockchains, Solana programs can be upgraded after they are deployed to the network. Native programs can only be upgraded as part of cluster updates when new software releases are made. On-chain programs can be upgraded by the account marked as the "Upgrade Authority" (usually the Solana account/address that deployed the program).

  
<br>

---

### The Solana Program Library (SPL)

<br>

* A collection of on-chain programs targeting the Sealevel parallel runtime.
* These programs are tested against Solana's implementation of Sealevel, solana-runtime, and deployed to its mainnet.

<br>


---

### On-chain Programs

<br>

* These programs are deployed directly to the blockchain for anyone to interact with or execute.
* They are not baked directly into the Solana cluster's core code.
* The Solana Labs maintains a small subset of them (SPL), but anyone can create or publish them, and the program's account owner can also update them.

<br>

---

### Native Programs

<br>

* Programs that are built directly into the core of the Solana blockchain.
* They are also called by other programs/users, but they can only be upgraded as part of the core blockchain and cluster updates.
* These native program upgrades are controlled via the releases to the different clusters.
* Examples include:
  * System Program: create new accounts, transfer tokens
  * BPG Loader Program: Deploys, upgrades, and executes programs on-chain
  * Vote program: Create and manage accounts that track validator voting state and rewards


<br>


---

### Cross-program Invocation (aka CPI)

<br>

* The Solana runtime allows programs to call each other via "cross-program invocation".
* Calling between programs is achieved by one program invoking instruction from the other. The invoking program is halted until the invoked program finishes processing the instruction.
* The runtime uses the privileges granted to the caller program to determine what privileges can be extended to the callee. Privileges refer to signers and writable accounts.
* Cross-program invocations allow programs to invoke other programs directly, but the depth is constrained to 4.
* Reentrancy is limited to direct self-recursion, capped at a fixed depth.

<br>

---

### Program Derived Addresses

<br>

* Allow programmatically generated signatures to be used when calling between programs.
* Using a program-derived address, a program may be given authority over an account and later transfer that authority to another.

<br>

---

### Memory on Solana

<br>

* Memory inside a Solana cluster can be thought of as a monolithic heap of data. Programs have access to their part of the heap.
* While a program may read any part of the global heap, if it tries to write to a part of the heap that is not its own, the Solana runtime makes the transaction fail.
* All state lives in this heap. Your SOL accounts, smart contracts, and memory are used by smart contracts.
* Each memory region has a program that manages it ("owner"). The term of a memory region is "account". Some programs own thousands of independent accounts.
* Accounts that store programs are owned by the `BPFLoader`. This is a program that can be used to deploy and upgrade other programs. The `BPFLoader` is owned by the `Native Loader`, and that is where the recursion ends.

<br>

----

### Rent

<br>

* Because validators don't have infinite storage and providing storage costs money, accounts need to pay rent for their existence. The rent is subtracted from their lamps regularly.

<br>

---

### The System Program

<br>

* The System Program is a smart contract with some additional privileges.
* All normal SOL accounts are owned by the System Program. One of the system program's responsibilities is handling transfers between the accounts it owns.
* The system program has a transfer endpoint to provide transfer functionality.


<br>

---

### Program Composition 

<br>

* There are two ways for developers to make programs interact with each other.
  - Via Multiple Instructions in a Transaction: while a transaction can be used to execute a single call to a program, a single transaction can also include multiple calls to different programs.
  - Via Cross-Program involcations (CPI), the explicit tool to compose programs. A CPI is a direct call from one program to another within the same instruction.






