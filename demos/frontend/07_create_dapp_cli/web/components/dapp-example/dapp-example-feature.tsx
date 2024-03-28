'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useDappExampleProgram } from './dapp-example-data-access';
import { DappExampleCreate, DappExampleList } from './dapp-example-ui';

export default function DappExampleFeature() {
  const { publicKey } = useWallet();
  const { programId } = useDappExampleProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="DappExample"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <DappExampleCreate />
      </AppHero>
      <DappExampleList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
