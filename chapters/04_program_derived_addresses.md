# 🛹 Program Derived Addresses


<br>

### tl; dr

<br>


* PDAs are addresses with special properties. They are not public keys (so they don't have an associated public key).

* PDAs provide a mechanism to build hashmap-like structures on-chain, allowing programs to sign instructions.

* PDAs simplify the programming model and make programs more secure. 


<br>

----

### PDA Creation

<br>

* PDA are created by hashing a number of seeds the user can choose with the `program_id`.

* Seeds can be anything: pubkey, strings, an array of numbers, etc.

* There is a 50% chance that this hash can result in a public key, so a bump has to be searched:

<br>


```rust
// pseudo code
fn find_pda(seeds, program_id) {
  for bump in 0..256 {
    let potential_pda = hash(seeds, bump, program_id);
    if is_pubkey(potential_pda) {
      continue;
    }
    return (potential_pda, bump);
  }
  panic!("Could not find pda after 256 tries.");
}
```

<br>

* The first bump that results in a PDA is called a "canonical bump," and they are the recommended one for usage.

<br>

---

### Hashmap-like Structures with PDAs

<br>

* PDAs are hashed from a bump, a program_id, and several seeds. These seeds can be used to build hashmap-like structures on-chain.

* With PDA, you can create structs that encode the information about a relationship between the user and some data account, so that PDA serves as the address:

<br>

```rust
pub struct UserStats {
  level: u16,
  name: String,
  bump: u8
}
```

<br>


----

### CPI Signing with PDAs

<br>


* In some cases, it's possible to reduce the number of accounts needed by making a PDA storing state also sign a CPI instead of defining a separate PDA for that.

* This means that programs can be given control over assets, which they then manage according to the rules defined in the code.

<br>

---

### Demos

<br>

* Learn how PDA works on Anchor through [demo 3](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/03_anchor_pda).

<br>


* Learn how PDA and CPI works on Anchor through [demo 4](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/04_pda_and_cpi).

<br>


---

### References

<br>

* [Anchor Docs on PDA](https://www.anchor-lang.com/docs/pdas)

