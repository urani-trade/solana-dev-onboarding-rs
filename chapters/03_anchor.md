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

* Install Anchor using [these instructions](https://www.anchor-lang.com/docs/installation):

```shell
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

<br>

* Verify the installation with:

```shell
anchor --version
```


<br>

----

### Anchor Programs

<br>


* An Anchor program consists of three parts:
  - The `program` module: where the logic is written.
  - The account structs, marked with `#[derive(Accounts)]`, where accounts are validated.
  - The `declare_id` macro, creates an `ID` field to store the address of the program.

<br>



#### The Program Module

<br>

* Where you define the business logic by writing functions that clients or other programs can call:

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        if ctx.accounts.token_account.amount > 0 {
            ctx.accounts.my_account.data = data;
        }
        Ok(())
    }
}
```

<br>

* Each endpoint takes a `Context` type as its first argument, so it can access:
    - the accounts (`ctx.accounts`)
    - the program_id (`ctx.program_id`) of the executing program
    - remaining accounts (`ctx.remaining_accounts`)

<br>

* If a function requires instruction data, it can be added through arguments to the function after the context argument.

<br>

#### The Accounts Struct

<br>

* Define which accounts an instruction expects, and their constraints.

* There are two constructs:
    - `Types`: have a specific use case.
    - `Account`: when an instruction is the deserialized data of the account. It's a generic over `T`, created to store data.

* The `#[account]` attribute sets the owner of that data to the `declare_id`.
    - `Account` verifies that the owner of `my_account` equals to `declare_id`.

<br>

```rust
#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>
}
```

<br>

* Account types are not dynamic enough to handle all the security checks that the program requires.

* Constraints can be added through:

<br>

```rust
#[account(<constraints>)]
pub account: AccountType
```


<br>

#### Errors

<br>

* Anchor programs have two types of errors:   
    - `AnchorErrors`: divided into anchor internal errors and custom errors
    - non-anchor errors

* You can use the `require` macro to simplify writing errors.

<br>

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        require!(data.data < 100, MyError::DataTooLarge);
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

<br>


----

### Initializing an Anchor Project

<br>

* To initialize a new project (anchor workspace), run:

<br>

```
anchor init <workspace-name>
```

<br>

* The following files will be created:
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

<br>

---

### Demo

<br>

#### CPI

* Learn how cross-program-instructions work on Anchor through [demo 2](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/02_anchor_cpi).


<br>

#### PDA

* Learn how program-derived-addresses work on Anchor through [demo 3](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/03_anchor_pda).


<br>

---

### References

<br>

* [Anchor Docs](https://www.anchor-lang.com/)
* [The Anchor Book](https://book.anchor-lang.com/)
* [Developing with Rust, by Solana Labs](https://solana.com/docs/programs/lang-rust)
* [Debugging Programs, by Solana Labs](https://solana.com/docs/programs/debugging)

