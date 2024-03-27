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
  - The `declare_id` macro, which creates an `ID` field to store the address of the program.

<br>



#### The Program Module

<br>

* Where you define the business logic, by writing functions that can be called by clietns or other programs.

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
    - the program_id (`ctx.program_id`) of the executing programs
    -  remaining accounts (`ctx.remaining_accounts`)

<br>

* If a function requires instruction data, they can be added through arguments to the function after the context argument.

<br>

#### The Accounts Struct

<br>

* Define which accounts a instruction expects, and their constraints.

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

* Account types are not dynamic enough to handle all the security checks that the program requires

* Constraints can be added through:

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

* You can use the `require` macro to simplify writting errors.

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

* The way an endpoint is connected to its corresponding Accounts struct is the `ctx` argument in the endpoint.

* The argument is of type `Context` which is generic over an Account struct, i.e., this is where you put the name of your account validation struct (e.g. `Initalize`).


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

