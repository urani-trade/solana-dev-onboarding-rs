# 🛹 Setup a Developing Environment

<br>

### tl; dr

<br>

* Local developing on Solana means  you will set up a local validator so that programs can be tested before being deployed to the blockchain. 

* In each environment, you will be using one of three networks:
  * **Mainnet**: the production network where all the action happens. Transactions cost real money.
  * **Testnet**: used for stress testing recent releases. Focused on network performance, stability, and validator behavior.
  * **Devnet**: the primary network for development (these tokens have no financial value, and you can get them from [these faucets](https://github.com/urani-labs/solana-dev-onboarding-rs/blob/main/chapters/07_sharpening_your_axes.md#faucets).
 
<br>


---

### Development Lifecycle

<br>

1. Setup the development environment with a local blockchain cluster.

2. Create a filesystem wallet and airdrop Solana tokens to it.

3. Write programs. 
    - Programs export a known `entrypoint` symbol which the Solana runtime looks up and calls when invoking a program.

4. Compile the program (down to [Berkley Packet Filter](https://solana.com/docs/programs/faq#berkeley-packet-filter-bpf) byte-code that will then be deployed to the blockchain).

5. Generate the program's public address (a new unique keypair, on which the pubkey is the `programId`).

6. Deploy the program to the selected blockchain cluster by creating transactions containing the program's byte-code. 

7. Once the entire program is in the blockchain, a final transaction is sent to write all of the buffered byte-code to the program's data account. 
    - This either marks the new program as executable or completes upgrading an existing program.

<br>

----


### Install Required Packages

<br>

#### Dependencies

<br>

* Install [Rust](https://rustup.rs/) and [Yarn](https://yarnpkg.com/getting-started/install).


<br>

#### Install the `solana-cli`

<br>

* Install `solana-cli` using [these instructions](https://solana.com/developers/guides/getstarted/setup-local-development). This will provide commands for:
  - creating and managing file-system Solana wallets/keypars
  - connecting to Solana clusters
  - building Solana programs
  - deploying your programs to the blockchain
 
* Install the Anchor framework using [these instructions](https://github.com/urani-labs/solana-dev-onboarding-rs/blob/main/chapters/03_anchor.md).

<br>

#### Setting up a `localhost` Blockchain Cluster

<br>

* You can run a full blockchain cluster on your machine with:


```shell
solana-test-validator
solana config set --url localhost
```


<br>

#### Creating a File System Wallet and Airdrop Solana tokens

<br>

* To deploy a program with Solana CLI, you need a Solana wallet with SOL tokens.

* To create a simple file system wallet (at `~/.config/solana/id.json`) to use during local developments, type:

```shell
solana-keygen new
```

<br>

* You can set your new wallet as the default:

```shell
solana config get -k ~/.config/solana/id.json
```

* Aidrop testing Solana tokens:

```shell
solana airdrop 10
solana balance
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


#### Devnet

<br>

* Devnet serves as a playground for devs.

* Gossip endpoint at `entrypoint.devnet.solana.com:8001`.

* Devnet endpoint: `https://api.devnet.solana.com`.

* From the CLI, one can connect with:

```shell
solana config set --url https://api.devnet.solana.com
```

<br>


#### Testnet

<br>

* Testnet serves as Solana's core contributors stress test.


* Gossip endpoint at `entrypoint.testnet.solana.com:8001`.

* Devnet endpoint: `https://api.testnet.solana.com`.

* From the CLI, one can connect with:

```shell
solana config set --url https://api.testnet.solana.com
```

<br>


#### Mainnet

<br>

* Solana's permissionless, persistent cluster.


* Gossip endpoint at `entrypoint.mainnet-beta.solana.com:8001`.

* Devnet endpoint: `https://api.mainnet-beta.solana.com`.

* From the CLI, one can connect with:

```shell
solana config set --url https://api.mainnet-beta.solana.com
```

<br>



---

### Demo 1: Hello World

<br>

* Test your setup by running [this hello world program](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/01_hello_world).

<br>

----

### Useful Commands

<br>

* Showing a program account:

```
solana program show <ACCOUNT_ADDRESS>
```

<br>

* Getting information about any transaction:

```
solana confirm -v <TRANSACTION_HASH>
```

<br>

* Getting the public key:

```
solana-keygen pubkey
```

<br>

* Redeploy a Solana Program: 
  
```
solana program deploy <PROGRAM_FILEPATH>
```

* If a program has been deployed, and redeployment goes beyond the `max_len` of the account, it's possible to extend the program to fit the larger redeployment:

```
> solana program extend <PROGRAM_ID> <ADDITIONAL_BYTES>
```

<br>

---

### References

<br>

* [Setup local dev, by Solana Labs](https://solana.com/developers/guides/getstarted/setup-local-development)
* [Intro to Solana development (on your browser)](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser)
* [Reference for many `solana-cli` commands](https://docs.solanalabs.com/cli/examples/deploy-a-program)
* [Seahorse: Python's wrapper for Anchor framework](https://seahorse.dev/)
