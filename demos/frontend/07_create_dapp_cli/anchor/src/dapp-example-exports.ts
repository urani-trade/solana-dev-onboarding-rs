// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { DappExample } from '../target/types/dapp_example';
import { IDL as DappExampleIDL } from '../target/types/dapp_example';

// Re-export the generated IDL and type
export { DappExample, DappExampleIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const DAPP_EXAMPLE_PROGRAM_ID = new PublicKey(
  '5ASqQu2RHgcxLfvMhnpVpECWswBm8QHLz37duPosGh7'
);

// This is a helper function to get the program ID for the DappExample program depending on the cluster.
export function getDappExampleProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return DAPP_EXAMPLE_PROGRAM_ID;
  }
}
