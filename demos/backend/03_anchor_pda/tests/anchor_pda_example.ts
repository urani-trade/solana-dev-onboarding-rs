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