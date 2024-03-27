# 🛹 Demo 1: Hello World 

--

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
cargo init hello_world --lib
cd hello_world
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

* Every Solana program must define an `entrypoint` that tells the runtime where to start executing the code on-chain. 

* The entry point should provide a public function named `process_instruction`:

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

* Every on-chain program should return the `Ok` result enum with value `()`. 
  - This tells the Solana runtime that the program executed successfully.

<br>


#### Build your program


<br>

```
cargo build-bpf
```

<br>

#### Deploy your program:

<br>

```
solana program deploy ./target/deploy/hello_world.so
```

<br>

* When this program finishes being deployed, the program's public address (`program id`) is displayed.

* To execute an on-chain program, you must send a transaction with a listing of instructions. 
  - Each `instruction` must include all the keys involved in the operation and the program ID we want to execute.

<br>

---