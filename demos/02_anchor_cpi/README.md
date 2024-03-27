# 🛹 Demo 2: Anchor and Cross-Program Invocations

<br>


### Program 1: "Puppet"

<br> 

* To show how CPI works, let's create a simple program called puppet. You can use this demo or run `anchor init puppet`.

* Inside `src/lib.rs`, we write the following:

<br>


```rust
use anchor_lang::prelude::*;

declare_id!("<some string>");

#[program]
pub mod puppet {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        let puppet = &mut ctx.accounts.puppet;
        puppet.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub puppet: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
}

#[account]
pub struct Data {
    pub data: u64,
}
```

<br>

* Build the program with:

<br>

```
anchor build
```

<br>

---

### Program 2: "Puppet-Master"

<br>

* Let's create a second program called puppet-master, and write the following inside `src/lib.rs`:

<br>

```rust
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("<another string>");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        let cpi_program = ctx.accounts.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: ctx.accounts.puppet.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        puppet::cpi::set_data(cpi_ctx, data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}
```

<br>

* To make it work,  add the following inside the program's `Cargo.toml`:


<br>

```yaml
[package]
name = "puppet-master"
version = "0.1.0"
description = "Created with Anchor"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "puppet_master"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
puppet = { path = "../../../puppet/programs/puppet", features = ["cpi"]}

```

<br>

* Build the program with:

```
anchor build
```

<br>


---

### Explanation

<br>

* Inside the puppet program, puppet-master uses the `SetData` instruction builder `struct` provided by the `puppet::cpi::accounts` module to submit the accounts the `SetData` instruction of the puppet program expects. 

* This means that puppet-master creates a new cpi context and passes it to the `puppet::cpi::set_data` cpi function. 

* This function has the exact same function as the `set_data` function in the puppet program with the exception that it expects a `CpiContext` instead of a `Context`.

<br>


---

### Testing

<br>

* Test the program with the following file inside `puppet/test/puppet.ts`:

<br>

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { Puppet } from "../target/types/puppet";
import { PuppetMaster } from "../target/types/puppet_master";

describe("puppet", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>;
  const puppetMasterProgram = anchor.workspace
    .PuppetMaster as Program<PuppetMaster>;

  const puppetKeypair = Keypair.generate();

  it("Does CPI!", async () => {
    await puppetProgram.methods
      .initialize()
      .accounts({
        puppet: puppetKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([puppetKeypair])
      .rpc();

    await puppetMasterProgram.methods
      .pullStrings(new anchor.BN(42))
      .accounts({
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
      })
      .rpc();

    expect(
      (
        await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
      ).data.toNumber()
    ).to.equal(42);
  });
});
```

<br>

* Copy `puppet-master/target/idl/puppet_master.json` to `puppet/target/idl` and run:

<br>

```shell
anchor test
```

<br>

----

### Improvements

<br>

* It's recommended to move the CPI setup into the `impl` block of the instruction. The puppet-master program then looks like this:

<br>

```rust
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}


impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: self.puppet.to_account_info()
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
```

<br>

---

### References

<br>

* [Cross-program instructions, by Anchor](https://www.anchor-lang.com/docs/cross-program-invocations)