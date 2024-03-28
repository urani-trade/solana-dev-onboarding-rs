import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { 07CreateDappCli } from "../target/types/07_create_dapp_cli";

describe("07-create-dapp-cli", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.07CreateDappCli as Program<07CreateDappCli>;

  const 07CreateDappCliKeypair = Keypair.generate()

  it('Initialize 07CreateDappCli', async () => {
    await program.methods
      .initialize()
      .accounts({
        07CreateDappCli: 07CreateDappCliKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([07CreateDappCliKeypair])
      .rpc()

    const currentCount = await program.account.07CreateDappCli.fetch(07CreateDappCliKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment 07CreateDappCli', async () => {
    await program.methods.increment().accounts({ 07CreateDappCli: 07CreateDappCliKeypair.publicKey }).rpc()

    const currentCount = await program.account.07CreateDappCli.fetch(07CreateDappCliKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment 07CreateDappCli Again', async () => {
    await program.methods.increment().accounts({ 07CreateDappCli: 07CreateDappCliKeypair.publicKey }).rpc()

    const currentCount = await program.account.07CreateDappCli.fetch(07CreateDappCliKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement 07CreateDappCli', async () => {
    await program.methods.decrement().accounts({ 07CreateDappCli: 07CreateDappCliKeypair.publicKey }).rpc()

    const currentCount = await program.account.07CreateDappCli.fetch(07CreateDappCliKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set 07CreateDappCli value', async () => {
    await program.methods.set(42).accounts({ 07CreateDappCli: 07CreateDappCliKeypair.publicKey }).rpc()

    const currentCount = await program.account.07CreateDappCli.fetch(07CreateDappCliKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the 07CreateDappCli account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        07CreateDappCli: 07CreateDappCliKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.07CreateDappCli.fetchNullable(07CreateDappCliKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
