
    'use client';


import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { use07CreateDappCliProgram } from './07-create-dapp-cli-data-access';
import { 07CreateDappCliCreate, 07CreateDappCliList } from './07-create-dapp-cli-ui';

export default function 07CreateDappCliFeature() {
  const { publicKey } = useWallet()
  const { programId } = use07CreateDappCliProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="07CreateDappCli"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <07CreateDappCliCreate />
      </AppHero>
      <07CreateDappCliList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center"><WalletButton /></div>
      </div>
    </div>
  )
}
