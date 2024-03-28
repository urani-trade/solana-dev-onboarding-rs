import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { Game } from '../target/types/game'
import { expect } from 'chai'


describe('game', async () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)


  const program = anchor.workspace.Game as Program<Game>


  it('Sets and changes name!', async () => {
    const [userStatsPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user-stats'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )


    await program.methods
      .createUserStats('tela')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc()


    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal(
      'tela'
    )


    await program.methods
      .changeUserName('giu')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc()


    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal(
      'giu'
    )
  })
})