# 🛹 Transfer Hooks

<br>

### tl; dr


<br>

* The [Transfer Hook Interface](https://spl.solana.com/transfer-hook-interface), introduced within the [Solana Program Library](https://spl.solana.com/) allows token creators to "hook" additional custom logic into token transfers to shape the dynamics of users' and tokens' interactions.



<br>


---

### How Token Hooks Work

<br>

* Whenever the token is minted or transfered, the `Execute` instruction is triggered together with a Transfer Instruction (the custom logic).

* All accounts from the initial transfer are converted to read-only accounts (i.e., the signer privileges of the sender do not extend to the Transfer Hook program). 

* For every token transfer involving tokens from the Mint Account, the Token Extensions program makes a Cross Program Invocation (CPI) to execute an instruction on the Transfer Hook program.

* Extra accounts required by `Execute` are stored in a predefined PDA that must be derived using the following seeds: `extra-account-metas` string, the mint account address, and the transfer hook `_id`:

<br>

```javascript
const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), 
    mint.publicKey.toBuffer()],
    program.program_id, 
);
```

<br>

---

### Specifications

<br>

* [The Transfer Hook interface specification](https://spl.solana.com/transfer-hook-interface/specification) includes two optional instructions and one required one; each uses a specific 8-byte discriminator at the start of its data.

* The `Execute` instruction is required, and this is the instruction in which custom transfer functionality lives.
    - It contains the following parts:
        - `Discriminator`, the first 8 bytes of the hash of "spl-transfer-hook-interface:execute"
        - `Data`:
            - `amount`: `u64`, the transfer amount
            - `accounts`:
                - 1 []: Source token account
                - 2 []: Mint
                - 3 []: Destination token account
                - 4 []: Source token account authority
                - 5 []: Validation account

* `InitializeExtraAccountMetaList` is optional and intializes the validation account to store a list of extra required `AccountMeta` configurations for the `Execute` instruction.


* `UpdateExtraAccountMetaList` is optional and allows an on-chain program to update its list of required accounts for `Execute`. 


<br>

---

### Demos

<br>


* [Backend's Demo 5: Transfer Hook Hello World](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/backend/05_transfer_hooks_extension)
* [Backend's Demo 6: Transfer Hook with a Counter](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/backend/06_transfer_hooks_counter)
* [Backend's Demo 7: Transfer Hook for Vesting](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/backend/07_transfer_hooks_vesting)
* [Backend's Demo 8: Transfer Hooks with wSOl Transfer fee](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/backend/08_transfer_hooks_with_wSOI)


<br>


---

### References

<br>


* [Transfer Hook Interface, by Solana Labs](https://spl.solana.com/transfer-hook-interface)
* [Token Transfer Hooks with Token Extensions on Solana](https://www.youtube.com/watch?v=Cc6CZWd-iMw)
* [How to use the Transfer Hooks Token Extension Part 2](https://www.youtube.com/watch?v=LsduWRtT3r8)
* [How to use the Transfer Hook extension, by Solana Labs](https://solana.com/developers/guides/token-extensions/transfer-hook)
* [5 Ways to Get Hooked, by Solandy](https://www.youtube.com/watch?v=Sr-HiJdbf6w)