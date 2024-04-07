# 🛹 Demo 6: Transfer Hooks with a Counter

<br>


### tl; dr

<br>

* This demo demonstrates how to use `transfer_hook` to increase a counter every time a token is transferred.

<br>

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, _amount: u64) -> Result<()> {

    ctx.accounts.counter_account.counter.checked_add(1).unwrap();
    msg!("Token has been transferred {0} times", ctx.accounts.counter_account.counter);
       
    Ok(())
}
```

<br>


* Note that we organize the directories and files as recommended by [Neodyme's Secure Scaffold](https://github.com/neodyme-labs/tradeoffer-secure-coding-workshop.git):

<br>

```shell
.
├── Anchor.toml
├── Cargo.toml
├── README.md
├── package.json
├── programs
│   └── transfer_hooks_counter
│       ├── Cargo.toml
│       ├── Xargo.toml
│       └── src
│           ├── errors.rs
│           ├── instructions
│           │   ├── metalist.rs
│           │   ├── mod.rs
│           │   └── transfer_hook.rs
│           ├── lib.rs
│           └── state
│               ├── global.rs
│               └── mod.rs
├── tests
│   └── transfer_hooks_counter.ts
└── tsconfig.json
```

<br>

---

### Extra Accounts at `ExtraAccountMetaList`

<br>


* Any additional logic to a transfer hook needs additional accounts, that should be added to the `ExtraAccountMetaList` account.

* In this demo, we create a PDA saving how often the token has been transferred by this code, which should be added to the `initialize_extra_account_meta_list` instruction:

<br>

```rust
let account_metas = vec![
    ExtraAccountMeta::new_with_seeds(
        &[Seed::Literal {
            bytes: "counter".as_bytes().to_vec(),
        }],
        false, // is_signer
        true,  // is_writable
    )?,
];
```

<br>

* This account needs to be created when we initialize the new Mint Account, and we need to pass it in every time we transfer the token.

<br>

```rust
#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]

    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        seeds = [b"counter"],
        bump,
        payer = payer,
        space = 16 // u64
    )]
    
    // initialize the accounts
    pub counter_account: Account<'info, CounterAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    
    #[account(
        token::mint = mint,
        token::authority = owner,
    )]
    
    pub source_token: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        token::mint = mint,
    )]
    
    pub destination_token: InterfaceAccount<'info, TokenAccount>,

    pub owner: UncheckedAccount<'info>,
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    
    // this is the extra account for the counter
    pub counter_account: Account<'info, CounterAccount>,
}
```

<br>


* Note that this is the account holding the `u64` counter variable:

<br>

```rust
#[account]
pub struct CounterAccount {
    counter: u64,
}
```

<br>

---

### The Transfer Hook

<br>


* The transfer hook function increases the counter by one every time it gets called:

<br>

```rust
pub fn transfer_hook(
    ctx: Context<TransferHook>, 
    amount: u64
    ) -> Result<()> {

    ctx.accounts.counter_account.counter.checked_add(1).unwrap();
    msg!(
        "This token has been transferred {0} times", 
        ctx.accounts.counter_account.counter
    );

    Ok(())
}
```

<br>

---

### The Client

<br>

* In the client, these accounts are added automatically by the helper function `createTransferCheckedWithTransferHookInstructio()`:

<br>

```javascript
let transferInstructionWithHelper =
  await createTransferCheckedWithTransferHookInstruction(
    connection,
    sourceTokenAccount,
    mint.publicKey,
    destinationTokenAccount,
    wallet.publicKey,
    amountBigInt,
    decimals,
    [],
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
  );
```


<br>

----

### Running this Demo

<br>

* Build and run the tests:

<br>

```
anchor build
anchor test --detach
```

<br>

* Check the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) (`localhost`) to see the log for the message `("This token has been transferred X times")`.

<br>

---

### References

<br>

* [Transfers Hook for a Counter, by Solana Labs](https://solana.com/developers/guides/token-extensions/transfer-hook)