# 🛹 Mastering the Anchor Framework 

<br>

### tl; dr

<br>


* Anchor is Solana's Sealevel runtime framework, providing several convenient developer tools for writing programs.

* Anchor writes various boilerplates, such as (de)serialization of accounts and instruction data.

* Anchor handles security checks and keeps them separated from business logic.

<br>

----

### Setting up Anchor

<br>


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

----

### Tests


<br>

---

### Resources

<br>

* [Anchor Docs](https://www.anchor-lang.com/)
* [The Anchor Book](https://book.anchor-lang.com/)
* [Developing with Rust, by Solana Labs](https://solana.com/docs/programs/lang-rust)
* [Debugging Programs, by Solana Labs](https://solana.com/docs/programs/debugging)

