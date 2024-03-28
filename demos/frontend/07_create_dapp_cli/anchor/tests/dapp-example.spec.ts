import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { DappExample } from '../target/types/dapp_example';

describe('dapp-example', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.DappExample as Program<DappExample>;

  const dappExampleKeypair = Keypair.generate();

  it('Initialize DappExample', async () => {
    await program.methods
      .initialize()
      .accounts({
        dappExample: dappExampleKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([dappExampleKeypair])
      .rpc();

    const currentCount = await program.account.dappExample.fetch(
      dappExampleKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment DappExample', async () => {
    await program.methods
      .increment()
      .accounts({ dappExample: dappExampleKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.dappExample.fetch(
      dappExampleKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment DappExample Again', async () => {
    await program.methods
      .increment()
      .accounts({ dappExample: dappExampleKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.dappExample.fetch(
      dappExampleKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement DappExample', async () => {
    await program.methods
      .decrement()
      .accounts({ dappExample: dappExampleKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.dappExample.fetch(
      dappExampleKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set dappExample value', async () => {
    await program.methods
      .set(42)
      .accounts({ dappExample: dappExampleKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.dappExample.fetch(
      dappExampleKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the dappExample account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        dappExample: dappExampleKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.dappExample.fetchNullable(
      dappExampleKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
