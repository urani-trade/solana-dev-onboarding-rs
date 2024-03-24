# 🛹 Setup a Testing and Developing Environment [IN CONSTRUCTION]

<br>

### General Guidelines

<br>

* When developing on Solana, you setup a local environment with a local validator that runs locally (so that programs can be tested before being deployed to any network). In each environment, you will be using one of three networks:
  * **Mainnet Beta**: the "production" network where all the action happens. Transactions cost real money.
  * **Testnet**: used for stress testing recent releases. Focused on network performance, stability, and validator behavior.
  * **Devnet**: the primary network for development (tokens are not real, and you can get them from [faucets](more_resources.md)).
 
<br>


---

### Solana Programs

<br>

* Solana on-chain programs are stored in "executable" accounts on Solana. Their development lifecycles have the following steps:
  * Setup the development environment.
  * Write the program.
  * Compile the program (down to [Berkley Packet Filter](https://solana.com/docs/programs/faq#berkeley-packet-filter-bpf) byte-code that will then be deployed to the blockchain).
  * Generate the program's public address (using the Solana CLI, a new unique Keypair is generated for the new program. The public address is the Pubkey and will be used on-chain as the program's public address, aka `programId`).
  * Deploy the program to the selected blockchain cluster by creating many transactions containing the program's byte-code. Once the entire program has been sent to the blockchain, a final transaction is sent to write all of the buffered byte-code to the program's data account. This either marks the new program as executable or completes upgrading an existing program.

<br>

----


### The Solana CLI

<br>

#### Install the CLI

<br>

* Install `solana-cli` using [these instructions](https://solana.com/developers/guides/getstarted/setup-local-development), which will provide commands needed to perform tasks such as:
  - creating and managing file-system Solana wallets/keypars,
  - connecting to Solana clusters,
  - building Solana programs,
  - and deploying your programs to the blockchain
 
* Install the Anchor framework using [these instructions](https://solana.com/developers/guides/getstarted/setup-local-development#4-install-anchor-for-solana).

<br>

#### Setting up a Localhost Blockchain Cluster

<br>

* The Solana CLI comes with the test validator built-in, so you can run a full blockchain cluster on your machine:

```
> solana-test-validator

Config File: /Users/<user>/.config/solana/cli/config.yml 
RPC URL: http://localhost:8899
WebSocket URL: ws://localhost:8900/ (computed)
Keypair Path: /Users/<user>/.config/solana/id.json
Commitment: confirmed
```

* You can configure your Solana CLI to use your localhost validator for all terminal commands:

```
> solana config set --url localhost
```

<br>

#### Creating a File System Wallet

<br>

* To deploy a program with Solana CLI, you need a Solana wallet with SOL tokens.
* To create a simple file system wallet (at `~/.config/solana/id.json`) to use during local developments, type:

```rust
> solana-keygen new
```

* You can set your new wallet as the default:

```
> solana config get -k ~/.config/solana/id.json
```

<br>

---

### Cluster and Public RPC Endpoints

<br>

* The Solana blockchain has several different groups of validators, known as Clusters.
* Each serves different purposes within the ecosystem and contains dedicated API nodes to fulfill JSON-RPC requests.
* The individual nodes within a Cluster are owned and operated by third parties, and each has a public endpoint.
* The Solana Labs organization operates a public RPC endpoint for each Cluster. Each of these public endpoints is subject to rate limits.

<br>

---

### Devnet

<br>

* Devnet serves as a playground for devs.
* Gossip endpoint at `entrypoint.devnet.solana.com:8001`.
* Devnet endpoint: `https://api.devnet.solana.com`.
* From the CLI, one can connect with `solana config set --url https://api.devnet.solana.com`.

<br>

---

### Testnet



<br>

---

### A "Hello World" Program 

<br>

* Solana Rust programs follow the typical Rust project layout:

```
/inc/
/src/
/Cargo.toml
```

<br>

* Initialize a new Rust library via Cargo:

```
> cargo init hello_world --lib
> cd hello_world
> cargo add solana-program@"=1.17.25"
```

<br>

* The Rust code for Solana lives inside `src/lib.rs`. There, you import your Rust crates and define your logic.
* At the top of `lib.rs`, we import the `solana-program` crate and bring needed items into the local namespace:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
  };
```

<br>

* Every Solana program must define an `entrypoint` that tells the runtime where to start executing the code on-chain. The entry point should provide a public function named `process_instruction`:

```rust
entrypoint!(process_instruction);

  pub fn process_instruction(
   program_id: &Pubkey,
   accounts: &[AccountInfo],
   instruction_data: &[u8]
  ) -> ProgramResult {
  
   msg!("Solana Summer 2.0!");
  
   Ok(())
}
```


<br>

* Every on-chain program should return the `Ok` result enum with value `()`. This tells the Solana runtime that the program executed successfully.

<br>

* Build your program:

```
> cargo build-bpf
```

<br>

* Deploy your program:

```
> solana program deploy ./target/deploy/hello_world.so
```

<br>

* When this program finishes being deployed, the program's public address (`program id`) is displayed.
* To execute an on-chain program, you must send a transaction with a listing of instructions. Each `instruction` must include all the keys involved in the operation and the program ID we want to execute.

<br>

---

### Useful commands

<br>

* Showing a program account:

```
> solana program show <ACCOUNT_ADDRESS>
```

<br>

* Getting information about any transaction:

```
> solana confirm -v <TRANSACTION_HASH>
```

<br>

* Getting the public key:

```
> solana-keygen pubkey
```

<br>

* Redeploy a Solana Program
  
```
> solana program deploy <PROGRAM_FILEPATH>
```

* If a program has been deployed, and redeployment goes beyond the `max_len` of the account, it's possible to extend the program to fit the larger redeployment:

```
> solana program extend <PROGRAM_ID> <ADDITIONAL_BYTES>
```

<br>

* [Here is a reference for many more CLI commands](https://docs.solanalabs.com/cli/examples/deploy-a-program).
