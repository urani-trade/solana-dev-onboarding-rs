# 🛹 Mastering the Anchor Framework [IN CONSTRUCTION]

<br>

### General Guidelines

<br>


* Anchor is Solana's Sealevel runtime framework, providing several convenient developer tools for writing smart contracts.
* Anchor writes various boilerplates, such as (de)serialization of accounts and instruction data.
* Anchor handles security checks and keeps them separated from business logic.

<br>

----

### Transactions and Accounts

<br>

* Your program can read and write data by sending a transaction, as programs provide endpoints that can be called by it.
* A function signature takes the following arguments:
  * the accounts that the program may read from and write to during this transaction.
  * additional data specific to the function.
 
* This design is partly responsible for Solana's high throughput. The runtime can look at all the incoming transactions of a program and can check whether the memory regions in the first argument of the transactions overlap. If the runtime sees two transactions access overlapping memory regions but only read and don't write, it can also parallelize those transactions.


<br>

----

### Hello World

<br>

* To initialize a new project (anchor workspace), run:

```
anchor init <workspace-name>
```

* These creates the following files:
   * `.anchor`: includes the most recent program logs and a local ledger for testing.
   * `app/`: an empty folder that can be used to hold the front end if you use a mono repo.
   * `programs/`: initially contains a program with the workspace name, and a `lib.rs`.
   * `tests/`
   * `migrations/`:you can save your deployment and migration scripts.
   * `Anchor.toml`: this file configures workspace wide settings. Initially, it configures:
      * the address of your programs on localnet (`[programs.localnet]`)
      * a registry your program can be pushed to (`[registry]`)
      * a provider which can be used in your tests (`[provider]`)
      * scripts that anchor executes for you (`[scripts]`).

* An anchor program consists of three parts:
  * the `program` module: where you write your business logic
  * the accounts structs which are market with `#[derive(Accounts)]`: where you validate accounts
  * the `declare_id` macro: creates an `ID` field that stores the address of your program. 

<br>

```rust
use anchor_lang::prelude::*;

declare_id!("<some string>");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```


<br>

---

### Installation

<br>

* [Installing Anchor version manager (avm)](https://www.anchor-lang.com/docs/installation), a tool for using multiple versions of the anchor-cli.
* [The Anchor Book](https://book.anchor-lang.com/).
