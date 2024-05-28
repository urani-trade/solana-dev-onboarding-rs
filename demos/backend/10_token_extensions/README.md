# 🛹 Demo 10: Token Extensions for Membership NFT
<br>


### tl; dr

<br>

* In this demo, we explore some token extensions available at `spl_token_2022` and `spl_token_metadata_interface`.

* We organize the directories and files as recommended by [Neodyme's Secure Scaffold](https://github.com/neodyme-labs/tradeoffer-secure-coding-workshop.git):

<br>

```shell
.
├── Anchor.toml
├── Cargo.toml
├── README.md
├── package.json
├── programs
│   └── nft
│       ├── Cargo.toml
│       └── src
│           ├── errors.rs
│           ├── instructions
│           │   ├── membership.rs
│           │   ├── mod.rs
│           │   ├── rules.rs
│           │   └── time.rs
│           ├── lib.rs
│           └── state
│               ├── global.rs
│               └── mod.rs
├── tests
│   └── nft.ts
└── tsconfig.json
```

<br>

---

### States and Other Helpful Functions

<br>

* Let's start with the content of `lib.rs`, which defines our instructions:

<br>

```rust
pub use { state::*, instructions::* };
mod errors;
mod instructions;
mod state;

declare_id!("HPPjTJWwTHTGxgoaqNaWGFQTbqkg25NuSctdkpGNdUL5");

#[program]
pub mod nft {
    use super::*;

    ////////////
    // rules.rs
    ////////////
    pub fn create_rule(
        ctx: Context<ManageRule>,
        seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        ctx.accounts.create_rule(seed, creator, price, treasury)
    }

    pub fn modify_rule(
        ctx: Context<ManageRule>,
        _seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        ctx.accounts.modify_rule(_seed, creator, price, treasury)
    }

    /////////////////
    // membership.rs
    /////////////////
    pub fn create_membership(
        ctx: Context<CreateMembership>,
        time: i64,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.create(time, name, symbol, uri, ctx.bumps)
    }

    /////////////////
    // time.rs
    /////////////////
    pub fn add_time(
        ctx: Context<ManageTime>,
        time: u64,
    ) -> Result<()> {
        ctx.accounts.add(time)
    }

    pub fn remove_time(
        ctx: Context<ManageTime>,
        time: u64,
    ) -> Result<()> {
        ctx.accounts.remove(time)
    }

}
```

<br>

* Next is `errors.rs`:

<br>

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum NftError {
    #[msg("Membership is expired")]
    Expired,
    #[msg("Overflow")]
    Overflow,
    #[msg("Not Authorized")]
    NotAuthorized,
}
```

<br>

* Then, `state/global.rs`:

<br>

```rust
use anchor_lang::prelude::*;

#[account]
pub struct NftData {
    pub mint: Pubkey,
    pub rule: Pubkey,
    pub expiry: i64,
}

#[account]
pub struct NftRule {
    pub seed: u64,
    pub creator: Pubkey,
    pub price: u64,
    pub treasury: Pubkey,
}


impl Space for NftData {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8;
}

impl Space for NftRule {
    const INIT_SPACE: usize = 8 + 8 + 32 + 8 + 32;
}
```

<br>

### Instructions

<br>

* Our demo has four instructions. First, to create or and modify rules (i.e., the creator, the price, or treasury):


<br>

```rust
pub use anchor_lang::prelude::*;
use crate::{errors::*, state::*};

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct ManageRule<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = signer,
        space = NftRule::INIT_SPACE,
        seeds = [b"nft_rule", seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, NftRule>,
    pub system_program: Program<'info, System>,
}

impl<'info> ManageRule<'info> {
    pub fn create_rule(
        &mut self,    
        seed: u64,    
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        self.rule.set_inner(
            NftRule {
                seed,
                creator,
                price,
                treasury,
            }
        );

        Ok(())
    }

    pub fn modify_rule(
        &mut self,     
        _seed: u64,
        creator: Pubkey,
        price: u64,
        treasury: Pubkey,
    ) -> Result<()> {

        require!(self.rule.creator == self.signer.key(), NftError::NotAuthorized);

        self.rule.creator = creator;
        self.rule.price = price;
        self.rule.treasury = treasury;
        
        Ok(())
    }
}
```

<br>

* Then, adding or removing time to the NFT membership:

<br>

```rust
pub use anchor_lang::{
    system_program::{transfer, Transfer},
    prelude::*
};
use crate::{errors::*, state::*};

#[derive(Accounts)]
pub struct ManageTime<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    /// CHECK
    pub membership: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"nft_rule", rule.seed.to_le_bytes().as_ref()],
        bump,
        has_one = treasury
    )]
    pub rule: Account<'info, NftRule>,
    #[account(
        mut,
        seeds = [b"nft_data", membership.key().as_ref()],
        bump,
        has_one = rule
    )]
    pub data: Account<'info, NftData>,

    pub system_program: Program<'info, System>,
}

impl<'info> ManageTime<'info> {
    pub fn add(
        &mut self,
        time: u64, 
    ) -> Result<()> {

        let mut cost = time * self.rule.price;
        let time: u64 = time.checked_mul(3600).ok_or(NftError::Overflow)?;

        if self.data.expiry < Clock::get()?.unix_timestamp {
            let flat_fee: u64 = 20;
            cost = cost.checked_add(flat_fee.checked_mul(self.rule.price).ok_or(NftError::Overflow)?).ok_or(NftError::Overflow)?;
        } else if self.payer.key() == self.rule.creator {
            cost = 0;
        }

        self.data.expiry = self.data.expiry.checked_add(time as i64).ok_or(NftError::Overflow)?;

        transfer(
            CpiContext::new(
                self.system_program.to_account_info(), 
                Transfer {
                    from: self.payer.to_account_info(),
                    to: self.treasury.to_account_info(),
                }),
            cost
        )?;

        Ok(())
    }

    pub fn remove(
        &mut self,
        time: u64, 
    ) -> Result<()> {

        require!(self.data.expiry > Clock::get()?.unix_timestamp, NftError::Expired);
        require!(self.payer.key() == self.rule.creator, NftError::NotAuthorized);

        let time: u64 = time.checked_mul(3600).ok_or(NftError::Overflow)?;
        self.data.expiry = self.data.expiry.checked_sub(time as i64).ok_or(NftError::Overflow)?;

        Ok(())
    }
}
```

<br>

* Finally, creating the membership, where we can add the token extensions:
    -  `MintCloseAuthority`
    - `PermanentDelegate`
    - `MetadataPointer`
    - `TransferHook`

<br>

```rust
pub use anchor_lang::{
    solana_program::{
        sysvar::rent::ID as RENT_ID,
        program::{invoke, invoke_signed}
    },
    prelude::*
};
pub use anchor_spl::{
    token_2022::{Token2022, spl_token_2022::instruction::AuthorityType},
    associated_token::{Create, create, AssociatedToken},
    token_interface::{MintTo, mint_to, set_authority},
};
pub use spl_token_2022::{
    extension::ExtensionType,
    instruction::{initialize_mint_close_authority, initialize_permanent_delegate, initialize_mint2},
    extension::{
        transfer_hook::instruction::initialize as intialize_transfer_hook,
        metadata_pointer::instruction::initialize as initialize_metadata_pointer,
    },
};
pub use spl_token_metadata_interface::{
    state::{TokenMetadata},
    instruction::{initialize as initialize_metadata_account},
};

use crate::state::*;


#[derive(Accounts)]
pub struct CreateMembership<'info> {
    #[account(
        mut,
        constraint = creator.key() == rule.creator,
    )]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub membership: Signer<'info>,
    #[account(
        mut,
        seeds = [
            payer.key().as_ref(),
            token_2022_program.key().as_ref(),
            membership.key().as_ref()
        ],
        seeds::program = associated_token_program.key(),
        bump
    )]
    /// CHECK
    pub membership_ata: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"nft_rule", rule.seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub rule: Account<'info, NftRule>,
    #[account(
        init,
        payer = payer,
        space = NftData::INIT_SPACE,
        seeds = [b"nft_data", membership.key().as_ref()],
        bump,
    )]
    pub data: Account<'info, NftData>,

    /// CHECK:
    #[account(
        mut,
        seeds = [b"nft_auth"],
        bump
    )]
    pub auth: UncheckedAccount<'info>,

    #[account(address = RENT_ID)]
    /// CHECK
    pub rent: UncheckedAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateMembership<'info> {
    pub fn create(
        &mut self,
        time: i64,
        name: String,
        symbol: String,
        uri: String,    
        bumps: CreateMembershipBumps,    
    ) -> Result<()> {

        // Populate the Data account
        self.data.set_inner(
            NftData {
                mint: self.membership.key(),
                rule: self.rule.key(),
                expiry: Clock::get()?.unix_timestamp + time,
            }
        );

        // Initialize the Account
        let size = ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(
            &[
                ExtensionType::MintCloseAuthority,
                ExtensionType::PermanentDelegate,
                ExtensionType::MetadataPointer,
                ExtensionType::TransferHook,
            ],
        ).unwrap();

        let metadata = TokenMetadata {
            update_authority: spl_pod::optional_keys::OptionalNonZeroPubkey::try_from(Some(self.auth.key())).unwrap(),
            mint: self.membership.key(),
            name,
            symbol,
            uri,
            additional_metadata: vec![]
        };

        let extension_extra_space = metadata.tlv_size_of().unwrap();
        let rent = &Rent::from_account_info(&self.rent.to_account_info())?;
        let lamports = rent.minimum_balance(size + extension_extra_space);

        invoke(
            &solana_program::system_instruction::create_account(
                &self.payer.key(),
                &self.membership.key(),
                lamports,
                (size).try_into().unwrap(),
                &spl_token_2022::id(),
            ),
            &vec![
                self.payer.to_account_info(),
                self.membership.to_account_info(),
            ],
        )?;

        // Initialize Extensions 

        invoke(
            &initialize_permanent_delegate(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.auth.key(),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;

        invoke(
            &intialize_transfer_hook(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(self.auth.key()),
                None,  // to add
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;
        
        invoke(
            &initialize_mint_close_authority(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(&self.auth.key()),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;
        
        invoke(
            &initialize_metadata_pointer(
                &self.token_2022_program.key(),
                &self.membership.key(),
                Some(self.auth.key()),
                Some(self.membership.key()),
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;

        invoke(
            &initialize_mint2(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.payer.key(),
                None,
                0,
            )?,
            &vec![
                self.membership.to_account_info(),
            ],
        )?;

        // Metadata Account
        let seeds: &[&[u8]; 2] = &[
            b"nft_auth",
            &[bumps.auth],
        ];
        let signer_seeds = &[&seeds[..]];

        invoke_signed(
            &initialize_metadata_account(
                &self.token_2022_program.key(),
                &self.membership.key(),
                &self.auth.key(),
                &self.membership.key(),
                &self.payer.key(),
                metadata.name,
                metadata.symbol,
                metadata.uri,
            ),
            &vec![
                self.membership.to_account_info(),
                self.auth.to_account_info(),
                self.payer.to_account_info(),
            ],
            signer_seeds
        )?;

        // Initialize the ATA & Mint to ATA 

        create(
            CpiContext::new(
                self.associated_token_program.to_account_info(),
                Create {
                    payer: self.payer.to_account_info(), 
                    associated_token: self.membership_ata.to_account_info(),
                    authority: self.payer.to_account_info(), 
                    mint: self.membership.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    token_program: self.token_2022_program.to_account_info(),
                }
            ),
        )?;

        mint_to(
            CpiContext::new(
                self.token_2022_program.to_account_info(),
                MintTo {
                    mint: self.membership.to_account_info(),
                    to: self.membership_ata.to_account_info(),
                    authority: self.payer.to_account_info(),
                }
            ),
            1
        )?;

        set_authority(
            CpiContext::new(
                self.token_2022_program.to_account_info(),
                anchor_spl::token_interface::SetAuthority {
                    current_authority: self.payer.to_account_info().clone(),
                    account_or_mint: self.membership.to_account_info().clone(),
                },
                // &[deployment_seeds]
            ),
            AuthorityType::MintTokens,
            None, // Set mint authority, nobody can mint any tokens
        )?;

        Ok(())
    }
}
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

* Logs can be seen in [Solana Explorer](https://explorer.solana.com/?cluster=devnet) (`localhost`).


<br>

----

### References

<br>

* [epplex-xyz](https://github.com/epplex-xyz/epPlex-program/tree/main)
