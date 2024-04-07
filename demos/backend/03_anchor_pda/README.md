# 🛹 Demo 3: A Simple PDA Example on Anchor

<br>


* In this demo, we introduce a very simple example to:
    1. create a PDA to hold some user's data (state)
    2. run the program with Anchor framework

<br>



----

### The Source Code

<br>

* The source code is structured as the following:

<br>

```shell
.
├── Anchor.toml
├── Cargo.toml
├── README.md
├── package.json
├── programs
│   └── anchor_pda_example
│       ├── Cargo.toml
│       ├── Xargo.toml
│       └── src
│           ├── instructions
│           │   ├── mod.rs
│           │   ├── change_user.rs
│           │   └── create_user.rs
│           ├── lib.rs
│           └── state
│               ├── global.rs
│               └── mod.rs
├── tests
│   └── anchor_pda_example.ts
└── tsconfig.json
```

<br>

* First, `lib.rs` define both functions for `create_user_stats()` and `change_user_name()`:

<br>

```rust
use anchor_lang::{prelude::*};
pub use { state::*, instructions::* };
mod instructions;
mod state;

declare_id!("DiUrXVjpm8stNeqnzHcssBLTW3uQBC426Bc2j4QoazDT");

#[program]
pub mod anchor_pda_example {
    use super::*;

    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.level = 0;
        if name.as_bytes().len() > 200 {
            panic!();
        }
        user_stats.name = name;
        user_stats.bump = ctx.bumps.user_stats;
        Ok(())
    }

    pub fn change_user_name(ctx: Context<ChangeUserName>, new_name: String) -> Result<()> {
        if new_name.as_bytes().len() > 200 {
            panic!();
        }
        ctx.accounts.user_stats.name = new_name;
        Ok(())
    }
}
```

<br>

* We define the global state `struct` `UserStats`:

<br>

```rust
use anchor_lang::prelude::*;

#[account]
pub struct UserStats {
    pub level: u16,
    pub name: String,
    pub bump: u8,
}
```

<br>


<br>

* Then `instructions/create_user.rs`:

<br>

```rust
#[derive(Accounts)]
pub struct CreateUserStats<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 2 + 4 + 200 + 1, seeds = [b"user-stats", user.key().as_ref()], bump
    )]
    pub user_stats: Account<'info, UserStats>,
    pub system_program: Program<'info, System>,
}
```

<br>

* And `instructions/change_user.rs`:

<br>

```rust
#[derive(Accounts)]
pub struct ChangeUserName<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)]
    pub user_stats: Account<'info, UserStats>,
}
```

<br>

* Finally, we test with `tests/anchor_pda_example.ts`:

```javascript
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { AnchorPdaExample } from '../target/types/anchor_pda_example'
import { expect } from 'chai'


describe('anchor_pda_example', async () => {

  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.anchor_pda_example as Program<AnchorPdaExample>

  it('Setting and changing a name', async () => {
    const [userStatsPDA, _] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('user-stats'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    await program.methods
      .createUserStats('Toly')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc()

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal(
      'Toly'
    )


    await program.methods
      .changeUserName('Austin')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc()

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal(
      'Austin'
    )
  })
})
```


<br>

----

### Running the Demo

<br>

* Build with:

```
anchor build
```

<br>

* And then run tests with:

```
anchor test
```