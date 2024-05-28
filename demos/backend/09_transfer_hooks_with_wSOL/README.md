# 🛹 Demo 9: Transfer Hooks with wSOL Transfer fee

<br>


### tl; dr

<br>

* In this demo, we build a more advanced `transfer_hook` program that requires the sender to pay a wSOL fee for every token transfer.

* The wSOL transfers are executed using a delegate PDA from the transfer hook program (as the signature from the initial sender of the token transfer instruction is not accessible):

<br>

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
    
    msg!("Transfer WSOL using delegate PDA");
    let signer_seeds: &[&[&[u8]]] = &[&[b"delegate", &[ctx.bumps.delegate]]];

    transfer_checked(
      CpiContext::new(
          ctx.accounts.token_program.to_account_info(),
            TransferChecked {
              from: ctx.accounts.sender_wsol_token_account.to_account_info(),
              mint: ctx.accounts.wsol_mint.to_account_info(),
              to: ctx.accounts.delegate_wsol_token_account.to_account_info(),
              authority: ctx.accounts.delegate.to_account_info(),
            },
       )
      .with_signer(signer_seeds),
      amount,
      ctx.accounts.wsol_mint.decimals,
    )?;

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
│   └── transfer-hooks-with-w-soi
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
│   └── transfer-hooks-with-w-soi.ts
└── tsconfig.json
```

<br>

<br>

---

### Source Code for the Program

<br>

* We covered the basics in the previous demos, so now let's use this example to go over the flow of a transfer hook.

* First, we import the required interfaces for this program, `spl_tlv_account_resolution` and `spl_transfer_hook_interface`:

<br>

```rust
use anchor_lang::{
  prelude::*,
  system_program::{create_account, CreateAccount},
};
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use spl_tlv_account_resolution::{
  account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};


declare_id!("3VTHXbzY92FgZR7TK58pbEoFnrzrAWLdwj65JiXB2MV1");
```

<br>

* We start the `#[program]` module:

<br>

```rust
#[program]
pub mod transfer_hooks_with_w_soi {

  use super::*;
```

<br>

* We create an account that stores a list of extra accounts required by the `transfer_hook()` instruction, where:
  - indices 0-3 are the accounts required for token transfer (source, mint, destination, owner)
  - index 4 is the address of the `ExtraAccountMetaList` account
  - index 5 is the wrapped SOL mint account
  - index 6 is the token program account
  - index 7 is the associated token program
  - index 8 is the delegate PDA
  - index 9 is the delegate wrapped SOL token account
  - index 10 is the sender wrapped SOL token account

<br>

```rust
  pub fn initialize_extra_account_meta_list(
      ctx: Context<InitializeExtraAccountMetaList>,
  ) -> Result<()> {

      let account_metas = vec![
         
          ExtraAccountMeta::new_with_pubkey(
              &ctx.accounts.wsol_mint.key(), 
              false, 
              false)?,
          
          ExtraAccountMeta::new_with_pubkey(
              &ctx.accounts.token_program.key(), 
              false, 
              false)?,
          
          ExtraAccountMeta::new_with_pubkey(
              &ctx.accounts.associated_token_program.key(),
              false,
              false,
          )?,
          
          ExtraAccountMeta::new_with_seeds(
              &[Seed::Literal {
                  bytes: "delegate".as_bytes().to_vec(),
              }],
              false, 
              true,  
          )?,
          
          ExtraAccountMeta::new_external_pda_with_seeds(
              7, // associated token program index
              &[
                  Seed::AccountKey { index: 8 }, // owner index (delegate PDA)
                  Seed::AccountKey { index: 6 }, // token program index
                  Seed::AccountKey { index: 5 }, // wsol mint index
              ],
              false, 
              true,  
          )?,
          
          ExtraAccountMeta::new_external_pda_with_seeds(
              7, // associated token program index
              &[
                  Seed::AccountKey { index: 3 }, // owner index
                  Seed::AccountKey { index: 6 }, // token program index
                  Seed::AccountKey { index: 5 }, // wsol mint index
              ],
              false, // is_signer
              true,  // is_writable
          )?
      ];
```

<br>

* Let's create the PDA:

<br>

```rust
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
```

<br>

* Let's write all the signers in the meta list:

<br>

```rust
      ExtraAccountMetaList::init::<ExecuteInstruction>(
          &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
          &account_metas,
      )?;

      Ok(())
  }
```

<br>

* The `transfer_hook()` instruction is invoked via CPI on every token transfer to perform a wrapped SOL token transfer using a delegate PDA:

<br>


```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[b"delegate", &[ctx.bumps.delegate]]];
  msg!("Transfer WSOL using delegate PDA");

  transfer_checked(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      TransferChecked {
        from: ctx.accounts.sender_wsol_token_account.to_account_info(),
        mint: ctx.accounts.wsol_mint.to_account_info(),
        to: ctx.accounts.delegate_wsol_token_account.to_account_info(),
        authority: ctx.accounts.delegate.to_account_info(),
      },
    )
    .with_signer(signer_seeds),
    amount,
    ctx.accounts.wsol_mint.decimals,
  )?;
Ok(())
}
```

<br>

* Whenever the token is transferred, the `TransferHookInstruction::Execute` from `fallback()` is executed, which takes the bytes out of the data with `to_le_bytes()` to call `transfer_hook()` above:

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
}
```

<br>

* Let's look at the accounts:

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
  pub wsol_mint: InterfaceAccount<'info, Mint>,
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
  pub wsol_mint: InterfaceAccount<'info, Mint>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  #[account(
      mut,
      seeds = [b"delegate"], 
      bump
  )]
  pub delegate: SystemAccount<'info>,
  #[account(
      mut,
      token::mint = wsol_mint, 
      token::authority = delegate,
  )]
  pub delegate_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
  #[account(
      mut,
      token::mint = wsol_mint, 
      token::authority = owner,
  )]
  pub sender_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
}
```


<br>


---

### Source Code for the Client

<br>

* Now let's look at `test/transfer-hooks-with-w-soi.ts`. We start by importing dependencies and retrieving the IDL file:

<br>

```javascript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHooksWithWSoi } from "../target/types/transfer_hooks_with_w_soi";
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
  getAssociatedTokenAddressSync,
  createApproveInstruction,
  createSyncNativeInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedWithTransferHookInstruction,
} from "@solana/spl-token";
import assert from "assert";
```

<br>


* We create Anchor's `Provider`, get the program from the IDL, the wallet provider, and the connection:

<br>

```javascript
describe("transfer_hooks_with_w_soi", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TransferHooksWithWSoi as Program<TransferHooksWithWSoi>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
```

<br>

*  We generate keypair to use as an address for the `transfer-hook()` enabled mint:


<br>

```javascript 
  const mint = new Keypair();
  const decimals = 9;
```

<br>

* Create the source token account (from the sender):

<br>

```javascript 
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
```


<br>

* Create the recipient (random keypair) and the recipient's token account:

<br>

```javascript 
  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
```

<br>

* Get the meta accounts need for the Transfer Hook:

<br>

```javascript
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
    program.programId
  );

  // PDA delegate to transfer wSOL tokens from sender
  const [delegatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate")],
    program.programId
  );

  // Sender wSOL token account address
  const senderWSolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT, // mint
    wallet.publicKey // owner
  );

  // Delegate PDA wSOL token account address, to receive wSOL tokens from sender
  const delegateWSolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT, // mint
    delegatePDA, // owner
    true // allowOwnerOffCurve
  );

  // Create the two wSOL token accounts as part of setup
  before(async () => {
    // wSOL Token Account for sender
    await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      NATIVE_MINT,
      wallet.publicKey
    );

    // wSOL Token Account for delegate PDA
    await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      NATIVE_MINT,
      delegatePDA,
      true
    );
  });
```

<br>

* Create the mint account, adding some extra space through `extensions`:

<br>

```javascript
  it("Create Mint Account with Transfer Hook Extension", async () => {
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports =
      await provider.connection.getMinimumBalanceForRentExemption(mintLen);
```

<br>

* Create an account, initialize the Transfer Hook instruction, initialize the Mint, and send the transaction:

<br>

```javascript
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
```
<br>

* Create two associated token accounts (one for the wallet and one for the destination) for the transfer-hook enabled mint, and send the tranasction:

<br>

```javascript
  // Fund the sender token account with 100 tokens
  it("Create Token Accounts and Mint Tokens", async () => {
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
```
<br>

* The third account creates an extra account meta to store extra accounts required by the transfer hook instruction. Note that this is a PDA derived from our program:

<br>

```javascript
  it("Create ExtraAccountMetaList Account", async () => {
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        payer: wallet.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
        mint: mint.publicKey,
        wsolMint: NATIVE_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment : "confirmed"}
    );
    console.log("Transaction Signature:", txSig);
  });
```
<br>

* Finally, we now transfer the first time the token, where the most important part is `createTransferCheckedWithTransferHookInstruction`, a helper account that gets all these accounts:


<br>

```javascript
  it("Transfer Hook with Extra Account Meta", async () => {
    const amount = 1 * 10 ** decimals;
    const bigIntAmount = BigInt(amount);

    // Instruction for sender to fund their WSol token account
    const solTransferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: senderWSolTokenAccount,
      lamports: amount,
    });

    // Approve delegate PDA to transfer WSol tokens from sender wSOL token account
    const approveInstruction = createApproveInstruction(
      senderWSolTokenAccount,
      delegatePDA,
      wallet.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Sync sender wSOL token account
    const syncWrappedSolInstruction = createSyncNativeInstruction(
      senderWSolTokenAccount
    );

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

    console.log("Pushed keys:", JSON.stringify(transferInstruction.keys));

    const transaction = new Transaction().add(
      solTransferInstruction,
      syncWrappedSolInstruction,
      approveInstruction,
      transferInstruction
    );
    
    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true }
    );
    console.log("Transfer Signature:", txSig);

    const tokenAccount = await getAccount(connection, delegateWSolTokenAccount);
    
    assert.equal(Number(tokenAccount.amount), amount);
  });
});
```

<br>

---

### Running the Tests

<br>

* Build and run the tests:

<br>

```
anchor build
anchor test --detach
```

<br>

* Find the `programId`: this should be inside of `Anchor.toml`, `test/transfer-hooks-with-w-soi.ts`, and `programs/src/lib.rs` (updating the `programId` after initialization of new Anchor projects is no longer necessary with new Anchor versions).

<br>

```
anchor keys list  
```


<br>

* This test results in three transactions. The last one is the extra transfer, which you can see at the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) (`localhost`).


<br>

---

### References

<br>

* [Transfers Hook with wSOL example, by Solana Labs](https://solana.com/developers/guides/token-extensions/transfer-hook#transfer-hook-with-wsol-transfer-fee-advanced-example)
