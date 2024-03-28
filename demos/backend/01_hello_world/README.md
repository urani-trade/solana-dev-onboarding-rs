# 🛹 Demo 1: Hello World 


<br>

* In a separate terminal window, start your local cluster:

```shell
solana-test-validator
```

<br>

* Either use this directory or initialize a new Rust library via Cargo:

```shell 
cargo init hello_world --lib
cd hello_world
cargo add solana-program
```

<br>

* This creates a very basic Solana Rust program following this layout:

```shell
.
├── Cargo.toml
└── src
    └── lib.rs
```

<br>

* You should modify `Cargo.toml` to the following:

```
[package]
name = "hello_world"
version = "0.1.0"

[lib]
name = "hello_world"
crate-type = ["cdylib", "lib"]

[dependencies]
// add the right version
solana-program = "=1.1x.x"
```


<br>

* We will write this program inside `src/lib.rs`. 

* At the top, we import the `solana-program` crate and bring needed items into the local namespace:

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

<br>

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


#### Build and Deploy your Program

<br>

* Let's build this hello world program, by running the following command from the root of the project:

```
cargo build-sbf
```

<br>

* This command will create the compiled program's `.so` file inside a folder called `./target/deploy`:

```
find . -name '*.so'
```

<br>

* Now, let's deploy it:


```
solana program deploy ./target/deploy/hello_world.so 
```

<br>

* When this program finishes being deployed, the program's public address (`program id`) is displayed.

* You can check your Solana wallet's balance to see how much it costs to deploy this simple program.

```shell
solana balance
```

<br>

