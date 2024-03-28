// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Counter } from '../target/types/counter';
import { IDL as CounterIDL } from '../target/types/counter';

// Re-export the generated IDL and type
export { Counter, CounterIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const COUNTER_PROGRAM_ID = new PublicKey(
  'FaC3oSqrzou2eaJft4UpCxZYtCe6hGa4WWSLTzg1yRMD'
);

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getCounterProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg');
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID;
  }
}
