# 🛹 Token Extensions

<br>

### tl; dr

<br>

* Solana ecosystem faced a demand for enhanced token features:
    - Before, expanding the capabilities of tokens required forking the existing Token Program, which introduced challenges due to architectural requirements for transactions specifying the involved programs and accounts.

* Token-2022 was created to add new token functionality, with minimal disruption to users, wallets, and dApps.
    - This enabled Token Extensions, introducing a suite of program-level enhancements such as confidential transactions, customizable transfer logic, and enriched metadata.


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

### References

<br>


* [Token Extensions on Solana Developer Guides](https://www.youtube.com/playlist?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO)