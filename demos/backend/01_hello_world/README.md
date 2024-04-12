# 🛹 Demo 1: Hello World 

* [-> I want to create the demo from scratch and learn](#create-the-demo-from-scratch)
* [-> I just want to run the demo](#build-and-deploy-your-program)

<br>

### Create the demo from scratch

<br>

#### 1. Initialize a new Rust library via Cargo:

```shell 
cargo init hello_world --lib
cd hello_world
cargo add solana-program
```

this creates a very basic Solana Rust program following this layout:

```shell
.
├── Cargo.toml
└── src
    └── lib.rs
```

<br>

#### 2. Modify `Cargo.toml` to the following:

```
[package]
name = "hello_world"
version = "0.1.0"

[lib]
name = "hello_world"
crate-type = ["cdylib", "lib"]

[dependencies]
// add the right version given by the cmd $ solana-install list
solana-program = "=1.x.x"
```


#### 3. Write the source code of the program inside `src/lib.rs` 

At the top, we import the `solana-program` crate and bring needed items into the local namespace:

```rust
extern crate solana_program;

use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
  };
```

* Every Solana program must define an `entrypoint` that tells the runtime where to start executing the code on-chain. 
    - The entry point should provide a public function named `process_instruction`:

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
   _program_id: &Pubkey,
   _accounts: &[AccountInfo],
   _instruction_data: &[u8]
  ) -> ProgramResult {
  
   msg!("Only possible on Solana");
  
   Ok(())
}
```


<br>

* Note that every on-chain program should return the `Ok` result enum with value `()`. 
    - This tells the Solana runtime that the program executed successfully.

<br>


### Build and Deploy

#### 1. Make sure you have a local cluster running:

```shell
solana-test-validator
```

<br>

#### 2. Compile by running the following command from the `/01_hello_world` directory:

```
cargo build-sbf
```

If you get any errors see [troubleshooting](/demos/README.md#troubleshooting)

<br>

You can find the the compiled program's `.so` file inside `./target/deploy`:
```
find . -name '*.so'
```

<br>

#### 3. Now, deploy it:


```
solana program deploy ./target/deploy/hello_world.so 
```

The program's public address (`program id`) will be displayed.


Try checking your Solana wallet's balance to see how much it costs to deploy this simple program.

```shell
solana balance
```

<br>

