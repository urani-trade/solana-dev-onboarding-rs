# 🛹 Demo 6: Transfer Hook Hello World

<br>


### tl; dr

<br>

* In this demo, we run a simple transfer hook (`transfer_hook()`) that prints a message on every token transfer. 

<br>

```rust
pub fn transfer_hook(_ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
  
  msg!("Hello Transfer Hook!");

  Ok(())
}
```

<br>

* We recommend you look at the code and absorb the structure and the main concepts. We will leave deeper explanations for the following demos.

* This program will only include 3 instructions:
  - `initialize_extra_account_meta_list()`: creates an account that stores a list of extra accounts required by the `transfer_hook instruction`. 
  - `transfer_hook()`: invoked via CPI on every token transfer to perform a wrapped SOL token transfer.
  - `fallback()`: necessary to manually match the instruction discriminator and invoke our custom `transfer_hook()` instruction. 


* Finally, note that we organize the directories and files according to [Neodyme's Secure Scaffold](https://github.com/neodyme-labs/tradeoffer-secure-coding-workshop.git):

<br>

```shell
.
├── Anchor.toml
├── Cargo.toml
├── README.md
├── package.json
├── programs
│   └── transfer_hook_extension
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
│   └── transfer_hook_extension.ts
└── tsconfig.json
```



<br>



---

### Source Code

<br>

* Rust file:

<br>

```rust
use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use spl_tlv_account_resolution::{
    state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("7v76bq4YNRgFoQzkWZ8vf1DSJnSYPX4tDCs38rjjd6Qi");


#[program]
pub mod transfer_hook {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {

        let account_metas = vec![  
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

    
    pub fn transfer_hook(_ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
        msg!("Hello Transfer Hook!");
        Ok(())
    }

    
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
}


#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
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
    /// CHECK
    pub owner: UncheckedAccount<'info>,
    /// CHECK
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
}
```

<br>

* Test file:

<br>

```javascript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHook } from "../target/types/transfer_hook";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createTransferCheckedWithTransferHookInstruction,
} from "@solana/spl-token";


describe("transfer-hook", () => {
 
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TransferHook as Program<TransferHook>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Generate keypair to use as address for the transfer-hook enabled mint
  const mint = new Keypair();
  const decimals = 9;

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
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer, mint]
    );
    console.log(`Transaction Signature: ${txSig}`);
  });

  // Create the two token accounts for the transfer-hook enabled mint
  // Fund the sender token account with 100 tokens
  it("Create Token Accounts and Mint Tokens", async () => {
    // 100 tokens
    const amount = 100 * 10 ** decimals;

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        sourceTokenAccount,
        wallet.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        destinationTokenAccount,
        recipient.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      createMintToInstruction(
        mint.publicKey,
        sourceTokenAccount,
        wallet.publicKey,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true }
    );

    console.log(`Transaction Signature: ${txSig}`);
  });

  // Account to store extra accounts required by the transfer hook instruction
  it("Create ExtraAccountMetaList Account", async () => {
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        mint: mint.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment: "confirmed" }
    );
    console.log("Transaction Signature:", txSig);
  });

  it("Transfer Hook with Extra Account Meta", async () => {
    // 1 tokens
    const amount = 1 * 10 ** decimals;
    const bigIntAmount = BigInt(amount);

    // Standard token transfer instruction
    const transferInstruction = await createTransferCheckedWithTransferHookInstruction(
      connection,
      sourceTokenAccount,
      mint.publicKey,
      destinationTokenAccount,
      wallet.publicKey,
      bigIntAmount,
      decimals,
      [],
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(
      transferInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true }
    );
    console.log("Transfer Signature:", txSig);
  });
});
```

<br>


---

### Running this Demo

<br>

* Build with:

```
anchor build
```

<br>

* Find the `programId`: this should be inside of `Anchor.toml`, `test/transfer-hooks-with-w-soi.ts`, and `programs/src/lib.rs` (updating the `programId` after initialization of new Anchor projects is no longer necessary with new Anchor versions).


<br>

```
anchor keys list  
```

<br>

* Run tests using `--detach` so the validator continues running after the test:

```
anchor test --detach

  transfer-hook
Transaction Signature: 3bovnhEP85A21dhNKhHPHeQwa2GPbtYzdhnnQFTdNCYqRb7paG6XhX3nnzPivfyb4BddopbJdyTTKeZymmxt2evQ
    ✔ Create Mint Account with Transfer Hook Extension (329ms)
Transaction Signature: 2VYWgfWRaxks9oZRDR6omLFm1usD1rnzkaQqMUATMYjGed1zsAjN2m7aHQe7RjhZgucRsSgDsaZTChgaTK92KsRj
    ✔ Create Token Accounts and Mint Tokens (469ms)
Transaction Signature: 322a28G4bPdioJERbcjsvZoZxu2CH3zicXmN9zzw52wwgRykRZ1puZyyLGBEXcvikgTh25f7K67Dkf8he6vATAQG
    ✔ Create ExtraAccountMetaList Account (474ms)
Transfer Signature: 2rbr8SbH6UXEaVWtpZovfTLRXMN18M8DCJydMiB56Wa825zzAb97m2haUJLesFJa26hVGy2q3eNCT4HRyJ6QryCj
    ✔ Transfer Hook with Extra Account Meta (461ms)


  4 passing (2s)

✨  Done in 2.79s.
```

<br>

* Go to the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) (set it to `localhost`) and search for the transactions above. You should see the message "Hello Transfer Hook!".

<br>

---

### References

<br>

* [How to use the Transfer Hook extension, by Solana Labs](https://solana.com/developers/guides/token-extensions/transfer-hook)
