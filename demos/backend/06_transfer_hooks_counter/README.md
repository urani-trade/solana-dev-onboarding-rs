# 🛹 Demo 6: Transfer Hooks with a Counter

<br>


### tl; dr

<br>

* This demo shows you how to increase a counter every time a token is transferred.

<br>

---

### Extra Accounts at `ExtraAccountMetaList`

<br>


* Additional logic to this transfer hook that needs an additional account should be added to the ExtraAccountMetaList account.

* In this case, we have a PDA saving the amount how often the token has been transferred by this code added to the  `initialize_extra_account_meta_list` instruction:

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

* This account needs to be created when we initialize the new mint account and we need to pass it in every time we transfer the token.

<br>

```rust
#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use these seeds
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
    /// CHECK: source token account owner, can be SystemAccount or PDA owned by another program
    pub owner: UncheckedAccount<'info>,
    /// CHECK: ExtraAccountMetaList Account,
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
    
    // Thus is the extra account for the counter
    pub counter_account: Account<'info, CounterAccount>,
}
```

<br>


* We then create an account holding an `u64` counter variable:

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
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {

    ctx.accounts.counter_account.counter.checked_add(1).unwrap();
    msg!("This token has been transferred {0} times", ctx.accounts.counter_account.counter);

    Ok(())
}
```

<br>

---

### The Client

<br>

* In the client, these accounts are added automatically by the helper function `createTransferCheckedWithTransferHookInstruction`:

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

* Check the [Solana Explore](https://explorer.solana.com/?cluster=devnet) (`localhost`) to see the log for the message `("This token has been transferred {0} times")`.

<br>

---

### References

<br>

* [Transfers Hook for a Counter, by Solana Labs](https://solana.com/developers/guides/token-extensions/transfer-hook)