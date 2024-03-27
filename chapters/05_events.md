# 🛹 Events and Communication

<br>

### tl; dr 

<br>

* Events in Archor provide a mechanism for notifying and communicating between different components of a Solana dapp.

* Events are structured pieces of data holding information about a specific occurrence in a program.

* Since there is no native support for events in Solana, Anchor events depend on logging to emit events.
    - Programs log `base64` encoded event data and clients parse the logs of the transaction to interpret the events.




<br>

---

### Defining Events

<br>


* Events are defined using `#[event]` attribute macro, which allows the specification of fields that an event should contain:

<br>

```rust
#[event]
pub struct TransferEvent {
    from: Pubkey,
    to: Pubkey,
    amount: u64,
}
```

<br>

---

### Emitting Events

<br>

* To emit an event, you can use the `emit!` macro:

<br>

```rust
emit!(TransferEvent {
    from: *ctx.accounts.from.key,
    to: *ctx.accounts.to.key,
    amount,
});
```

<br>

---

### Subscribing to Events

<br>

* Anyone can subscribe to events emitted by your program, through the [@coral-xyz/archor](@coral-xyz/anchor) library:

<br>

```rust
const subscriptionId = program.addEventListener("TransferEvent", (event) => {
  // Handle event...
});
```

<br>

* The event listener should be removed once it's no longer needed:

<br>

```rust
program.removeEventListener(subscriptionId);
```

<br>

---

### CPI Events

<br>

* Solana nodes truncate logs larger than 10KB, which makes regular events emitted via `emit!` unreliable.

* Unlike logs, RPC providers store instruction data without truncation.
    - CPI events make use of this by executing a self-invoke with the event data to store the event(s) in the instruction.

* To use CPI vents, you can enable `event-cpi`:

<br>

```
anchor-lang = { version = "0.29.0", features = ["event-cpi"] }
```

<br>

* Then, add `#[event_cpi]` to accounts struct:

<br>

```rust
#[event_cpi]
#[derive(Accounts)]
pub struct TransferContext {}
```

<br>

* And the instruction handler:

<br>

```rust

#![allow(unused)]
fn main() {
#[program]
pub mod my_program {
    use super::*;

    pub fn transfer(ctx: Context<TransferContext>, amount: u64) -> Result<()>  {
        // Perform transfer logic

        // Emit the TransferEvent
        emit_cpi!(TransferEvent {
            from: *ctx.accounts.from.key,
            to: *ctx.accounts.to.key,
            amount,
        });

        Ok(())
    }
}
}
```

<br>

---

### Resources

<br>

* [Events on The Anchor Book](https://book.anchor-lang.com/anchor_in_depth/events.html)
