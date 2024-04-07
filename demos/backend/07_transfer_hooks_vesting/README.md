# 🛹 Demo 7: Transfer Hooks for Vesting

<br>


### tl; dr

<br>

* In this demo, we use `transfer_hooks` to implement a program where users gradually gain token access (and restrict the number of tokens that can be transferred from the owner's associated token account (ATA)):


<br>

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
  
  let info = ctx.accounts.vesting_account.to_account_info();
  let data = info.try_borrow_mut_data()?;

  match VestingAccount::try_deserialize(&mut &data[..]) {

    Ok(vesting_account) => {
      let mut amount_locked: u64 = 0;
      let current_time = Clock::get()?.unix_timestamp;

        for vesting_data in vesting_account.vesting_data.iter() {
          if vesting_data.time > current_time {
            let amount_to_add: u64 = (vesting_data.amount_basis_point as u64).checked_mul(vesting_account.amount).ok_or(VestingErr::Overflow)?.checked_div(10000).ok_or(VestingErr::Overflow)?;
            amount_locked = amount_to_add.checked_add(amount).ok_or(VestingErr::Overflow)?;
          }
        }

      require!(amount_locked <= ctx.accounts.source_token.amount.checked_sub(amount).ok_or(VestingErr::Overflow)?, VestingErr::LockedAmount);
    },
    
    Err(_) => {}
  }  
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
│   └── transfer_hooks
│       ├── Cargo.toml
│       ├── Xargo.toml
│       └── src
│           ├── errors.rs
│           ├── instructions
│           │   ├── claim.rs
│           │   ├── metalist.rs
│           │   ├── mod.rs
│           │   ├── transfer_hook.rs
│           │   └── vesting.rs
│           ├── lib.rs
│           └── state
│               ├── global.rs
│               └── mod.rs
├── tests
│   └── transfer_hooks_vesting.ts
└── tsconfig.json
```


<br>


---

### Creating a Program for a Vesting Template

<br>

* We start creating our `vesting_template` program, with the common methods:
    - `initialize_extra_account_meta_list()` 
    - `transfer_hook()`
    - `fallback()`

* plus the custom methods:
    - `create_vesting_account()`
    - `claim_tokens()`

<br>

```rust
#[program]
pub mod vesting_template {
    use super::*;
        (...)
}
```

<br>

* The first instruction is used to initialize `extra_account_meta_list()`, where:
  1. index 0-3 are the accounts required for token transfer (source, mint, destination, owner)
  2. index 4 is the address of the `ExtraAccountMetaList` account
  3. index 5 is the `vesting_account`

<br>

```rust
pub fn initialize_extra_account_meta_list(
    ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        
    let account_metas = vec![
        ExtraAccountMeta::new_with_seeds(
            &[
                Seed::Literal { bytes: "vesting".as_bytes().to_vec() },
                Seed::AccountKey { index: 1 },
                Seed::AccountKey { index: 0 }
            ],
            false, // is_signer
            true,  // is_writable
            )?,
    ];
    
    let account_size = ExtraAccountMetaList::size_of(account_metas.len())? as u64;
    let lamports = Rent::get()?.minimum_balance(account_size as usize);
    let mint = ctx.accounts.mint.key();
        
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"extra-account-metas",
        &mint.as_ref(),
        &[ctx.bumps.extra_account_meta_list],
    ]];
    
    create_account(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            CreateAccount {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.extra_account_meta_list.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        lamports,
        account_size,
        ctx.program_id,
    )?;
    
    ExtraAccountMetaList::init::<ExecuteInstruction>(
        &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
        &account_metas,
    )?;
    
    Ok(())
}
```

<br>

---

### Second Instruction, Setting Up a Vesting Account

<br>


* Let's create an account that will:
    - record the amount of tokens vested
    - check whether an airdrop has been claimed
    - store vesting specifics


<br>

```rust
#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct VestingData {
    pub amount_basis_point: u16,
    pub time: i64,
}

#[account]
pub struct VestingAccount {
    pub amount: u64,
    pub claimed: bool,
    pub vesting_data: Vec<VestingData>,
}

// Iterate through vesting data, 
// calculate total_basis_points, 
// and set the vesting account state
pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>, 
        vesting_data: Vec<VestingData>, 
        amount: u64
    ) -> Result<()> {
        
    let mut total_basis_points: u16 = 0;

    for vesting_data in vesting_data.iter() {
        total_basis_points = total_basis_points.
        checked_add(vesting_data.amount_basis_point).
        ok_or(VestingErr::Overflow)?;
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

### Third Instruction, Claiming Vested Tokens


<br>

* Let's write instructions that mint tokens to the user's wallet.

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

### The Fourth Instruction, `Execute`

<br>

* This account is incorporated as an `UncheckedAccount` to avoid the transaction failing if a `VestingAccoun`t is not deserialized from the `Accounts` struct:

<br>

```rust
pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
    let instruction = TransferHookInstruction::unpack(data)?;

    match instruction {
        TransferHookInstruction::Execute { amount } => {
            let amount_bytes = amount.to_le_bytes();
                __private::__global::transfer_hook(program_id, accounts, &amount_bytes)
        }
    _ => return Err(ProgramError::InvalidInstructionData.into()),
    }
}
```

<br>

* The identification of this account relies on specific seeds:
    - the word `vesting` in byte form
    - the public key of the mint (1)
    - the public key of the source token (0)
    
* The seeds are added in the `ExtraAccountMetaList` utilizing `ExtraAccountMeta`: 


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

### The Transfer Hook Logic

<br>

* We first verify the presence of a vesting schedule for the token sender by deserializing `vesting_account`:
    - If no errors, it confirms the sender’s tokens are subject to a vesting schedule, which must be enforced.
    - If an error occurs, handle it gracefully without failing the transaction (e.g., the sender doesn't have a vesting schedule and can freely trade their tokens).

<br>

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
    let info = ctx.accounts.vesting_account.to_account_info();
    let data = info.try_borrow_mut_data()?;

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
            // owner intends to transfer, equals or exceeds the locked amount,
            // maintaining the integrity of the vesting schedule.
            require!(amount_locked <= ctx.accounts.source_token.amount.checked_sub(amount).ok_or(VestingErr::Overflow)?, VestingErr::LockedAmount);
        },

        Err(_) => {
        }
    }
        
    Ok(())
}
```

<br>

---

### All the Accounts

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
        seeds = [b"vesting", mint.key().as_ref(), source_token.key().as_ref()],
        bump
    )]
    pub vesting_account: UncheckedAccount<'info>,
}


#[derive(Accounts)]
#[instruction(vesting_data: Vec<VestingData>)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,
    #[account(token::mint = mint)]
    pub token: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        init,
        payer = admin,
        space = VestingAccount::INIT_SPACE + vesting_data.len() * 10,
        seeds = [b"vesting", mint.key().as_ref(), token.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
    )]
    pub token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        seeds = [b"vesting_auth", mint.key().as_ref()],
        bump
    )]
    pub mint_auth: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"vesting", mint.key().as_ref(), token.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
```

<br>

---

### Testing

<br>

```javascript
import * as anchor from "@coral-xyz/anchor";
import { IDL, VestingTemplate } from "../target/types/vesting_template";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";


describe("vesting_template", () => {
  
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  const programId = new PublicKey("6HDohFvWAiJ78K8x7qki3aZ3MvMD1nSJr1g2hYvfRxhe");
  const program = new anchor.Program<VestingTemplate>(IDL, programId, provider);

  // Generate keypair to use as address for the transfer-hook enabled mint
  const mint = new Keypair();
  const decimals = 0;

  // Sender token account address
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Recipient token account address
  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
    program.programId
  );

  const vestingAccount = PublicKey.findProgramAddressSync([Buffer.from("vesting"), mint.publicKey.toBuffer(), sourceTokenAccount.toBuffer()], program.programId)[0];
  const mintAuth = PublicKey.findProgramAddressSync([Buffer.from("vesting_auth"), mint.publicKey.toBuffer()], program.programId)[0];

  it("Create Mint Account with Transfer Hook Extension", async () => {
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports =
      await provider.connection.getMinimumBalanceForRentExemption(mintLen);
  
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports: lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferHookInstruction(
        mint.publicKey,
        wallet.publicKey,
        program.programId, // Transfer Hook Program ID
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        mintAuth,
        null,
        TOKEN_2022_PROGRAM_ID,
      ),
    );
  
    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer, mint],
    );
    console.log(`Transaction Signature: ${txSig}`);
  });

  it("Create Token Accounts", async () => {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        sourceTokenAccount,
        wallet.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );

    console.log(`Transaction Signature: ${txSig}`);
  });

  // Account to store extra accounts required by the transfer hook instruction
  it("Create ExtraAccountMetaList Account", async () => {
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        payer: wallet.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
        mint: mint.publicKey,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction,
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );
    console.log("Transaction Signature:", txSig);
  });

  interface VestingData {
    amountBasisPoint: number;
    time: anchor.BN;
  }

  const vestingData: VestingData[] = [
    {
      amountBasisPoint: 10000,
      time: new anchor.BN(Math.floor(Date.now() + 3600 / 1000)),
    },
  ];

  it("Create Vesting Account", async () => {
    const tx = await program.methods
    .createVestingAccount(
      vestingData,
      new anchor.BN(1000 * 10 ** decimals),
    )
    .accounts({
      mint: mint.publicKey,
      token: sourceTokenAccount,
      vestingAccount,
    })
    .signers([wallet.payer]).rpc({ skipPreflight: true });

    console.log("Signature:", tx);
  });

  it("Claim Tokens", async () => {
    const tx = await program.methods
    .claimTokens()
    .accounts({
      mint: mint.publicKey,
      token: sourceTokenAccount,
      mintAuth,
      vestingAccount,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .signers([wallet.payer]).rpc({ skipPreflight: true });

    console.log("Signature:", tx);
  });

  it("Transfer Hook with Extra Account Meta", async () => {
    const amount = 1 * 10 ** decimals;

    // Standard token transfer instruction
    const transferInstruction = createTransferCheckedInstruction(
      sourceTokenAccount,
      mint.publicKey,
      destinationTokenAccount,
      wallet.publicKey,
      amount,
      decimals,
      [],
      TOKEN_2022_PROGRAM_ID,
    );
  
    // Manually add all the extra accounts required by the transfer hook instruction
    // Also include the address of the ExtraAccountMetaList account and Transfer Hook Program
    transferInstruction.keys.push(
      {
        pubkey: extraAccountMetaListPDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: vestingAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: programId,
        isSigner: false,
        isWritable: false,
      },
    );
  
    const transaction = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        destinationTokenAccount,
        recipient.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
      transferInstruction,
    );
    console.log("Transaction:", transaction);
    
    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );
    console.log("Transfer Signature:", txSig);
  });
});
```

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

<br>

---

### References

<br>

* [Leveraging Transfer Hooks on Solana, by Leo](https://medium.com/@LeoOnSol/hooked-the-power-of-leveraging-transfer-hooks-on-solana-2b0f15770e64)