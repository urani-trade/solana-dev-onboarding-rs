# 🛹 Demo 5: Implementing a Vesting Program with Transfer Hooks

<br>


### tl; dr

<br>

* In this demo, we implement a method for users to gradually gain access to tokens. 

* Unlike traditional locking mechanisms, this approach places tokens directly in users’ wallets from the start. 

* The security happens through a transfer hook, which restricts how many tokens can be transferred out of the owner’s associated token account (ATA).

<br>


---

### Instruction 1: Setting Up a Vesting Account

<br>

* Create an account to:
    - record the amount of tokens vested
    - check if the airdrop has been claimed
    - store vesting specifics

<br>

```rust
#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct VestingData {
    pub amount_basis_point: u16,
    pub time: i64,
}


// Iterate through vesting data, calculate total_basis_points, 
// and set the vesting account state
pub fn create_vesting_account(ctx: Context<CreateVestingAccount>, vesting_data: Vec<VestingData>, amount: u64) -> Result<()> {

    let mut total_basis_points: u16 = 0;

    for vesting_data in vesting_data.iter() {
            total_basis_points = total_basis_points.checked_add(vesting_data.amount_basis_point).ok_or(VestingErr::Overflow)?;
    }

    require!(total_basis_points <= 10000, VestingErr::TooMuchBasisPoints);

    ctx.accounts.vesting_account.set_inner(
            VestingAccount {
                amount: amount,
                claimed: false,
                vesting_data,
            }
    );
         
    Ok(())
}
```

<br>

---

### Instruction 2: Claiming Vested Tokens


<br>

* Claiming results in tokens being minted to the user’s wallet. 

<br>

```rust
pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
    
    require!(ctx.accounts.vesting_account.claimed == false, VestingErr::AlreadyClaimed);
    ctx.accounts.vesting_account.claimed = true;

    let mint_key = ctx.accounts.mint.key();
    
    let seeds: &[&[u8]; 3] = &[
            b"vesting_auth",
            mint_key.as_ref(),
            &[ctx.bumps.mint_auth],
    ];
    let signer_seeds = &[&seeds[..]];

    mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(), 
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token.to_account_info(),
                    authority: ctx.accounts.mint_auth.to_account_info(),
                },
                signer_seeds
            ),
            ctx.accounts.vesting_account.amount
        )
    }       
```

<br>

---

### Instruction 3: Execute

<br>

* For the `Execute` instruction, we add `vesting_account` to the account arrays. 

* This account is incorporated as an `UncheckedAccount`, to avoid the transaction to fail if a `VestingAccount` is not deserialized from the Execute Accounts Struct.

<br>

```rust
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
        seeds = [b"vesting", mint.key().as_ref(), source_token.key().as_ref()],
        bump
    )]

    pub vesting_account: UncheckedAccount<'info>,
}
```

<br>

* The identification of this account relies on specific seeds:
    - the word 'vesting' in byte form
    - the public key of the mint (1)
    - the public key of the source token (0)
    
- The seeds are added in the `ExtraAccountMetaList` utilizing `ExtraAccountMeta`: 

<br>

```rust
        ExtraAccountMeta::new_with_seeds(
            &[
                Seed::Literal { bytes: "vesting".as_bytes().to_vec() },
                Seed::AccountKey { index: 1 },
                Seed::AccountKey { index: 0 }
            ],
            false, // is_signer
            true,  // is_writable
        )?,
```

<br>

---

### The Token Hook Logic

<br>

* We first verify the presence of a vesting schedule for the token sender by deserializing `vesting_account`:
    - if no errors, it confirms the sender’s tokens are subject to a vesting schedule, which must be enforced.
    - if an error occurs, we handle it gracefully without failing the transaction, indicating the sender doesn’t have a vesting schedule and can trade their tokens freely.

<br>

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
    let info = ctx.accounts.vesting_account.to_account_info();
    let data = info.try_borrow_mut_data()?;

    // Try and Deserialize the Account, if it deserialize then we know that the sender has a vesting account and we should check it.
    match  VestingAccount::try_deserialize(&mut &data[..]) {
        Ok(vesting_account) => {
            let mut amount_locked: u64 = 0;
            let current_time = Clock::get()?.unix_timestamp;

            // Calculate the amount allowed to be transferred
            // Once we check that the `VestingAccount exists`, we enforce the vesting 
            // schedule by calculating the total amount locked by iterating through the
            // `VestingData` vector, identifying tokens that haven’t been released yet.
            for vesting_data in vesting_account.vesting_data.iter() {
                if vesting_data.time > current_time {
                    let amount_to_add: u64 = (vesting_data.amount_basis_point as u64).checked_mul(vesting_account.amount).ok_or(VestingErr::Overflow)?.checked_div(10000).ok_or(VestingErr::Overflow)?;
                    
                    amount_locked = amount_to_add.checked_add(amount).ok_or(VestingErr::Overflow)?;
                }
            }

            // Check if the amount locked is less than what will remain after the transfer
            // Ensures the tokens remaining in the `source_token account`, minus what the 
            // owner intends to transfer, equals or exceeds the locked amount, maintaining 
            // the integrity of the vesting schedule.
            require!(amount_locked <= ctx.accounts.source_token.amount.checked_sub(amount).ok_or(VestingErr::Overflow)?, VestingErr::LockedAmount);
        },

        Err(_) => {
        }
    }
        
    Ok(())
}
```

<br>

* 

* 

<br>

----

### Running this Demo

<br>

* Build with:

```
anchor build
```


<br>

* Find the `programId`, and replace it inside `Anchor.toml`, `test/transfer_hooks.js`, and `programs/src/lib.rs`:

<br>

```
anchor keys list  
```

<br>

* Run tests with:

```
anchor test
```