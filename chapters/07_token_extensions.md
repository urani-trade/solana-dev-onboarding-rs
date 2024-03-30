# 🛹 Token Extensions 

<br>

### tl; dr

<br>


* The Transfer Hook extension and [Transfer Hook Interface](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface) allow users to create Mint Accounts that execute custom instruction logic on every token transfer.

* To achieve this, developers must build a program that implements the Transfer Hook Interface and initialize a Mint Account with an enabled Transfer Hook extension.

* For every token transfer involving tokens from the Mint Account, the Token Extensions program invokes a Cross-Program Instruction (CPI) to execute an instruction on the Transfer Hook program.

<br>

---

### Creating a Token with Token Extensions

<br>

*  You can use the [Solana Tool Suite]() to create tokens with a CLI:

<br>

```rust
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token <extension flags>
```

<br>

* These are the flags to add to create tokens with each type of extension:
    - Mint Close Authority: `--enable-close`
    - Transfer Fees	:`--transfer-fee <basis points> <max fee>`
    - Non-Transferable:	`--enable-non-transferable``
    - Interest-Bearing:	`--interest-rate <rate>`
    - Permanent Delegate:	`--enable-permanent-delegate`
    - Transfer Hook:	`--transfer-hook <programID>`
    - Metadata:	`--enable-metadata`
    - Metadata Pointer:	`--metadata-address <accountId>`
    - Confidential Transfers:	`--enable-confidential-transfers auto`

<br>

---

### Demo

<br>

* [Demo 9: Token Extensions for Membership NFT](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/backend/09_token_extensions)

<br>

---

### References

<br>


* [Token Extensions on Solana Developer Guides](https://www.youtube.com/playlist?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO)
* [How to use the Mint Close Authority extension](https://solana.com/developers/guides/token-extensions/mint-close-authority)
* [How to use the Transfer Fee extension](https://solana.com/developers/guides/token-extensions/transfer-fee)
* [How to use the Permanent Delegate extension](https://solana.com/developers/guides/token-extensions/interest-bearing-tokens)
* [How to use the Metadata Pointer extension](https://solana.com/developers/guides/token-extensions/metadata-pointer)
* [How to use the Non-transferable extension](https://solana.com/developers/guides/token-extensions/non-transferable)
* [Token-2022 Program official docs](https://spl.solana.com/token-2022)