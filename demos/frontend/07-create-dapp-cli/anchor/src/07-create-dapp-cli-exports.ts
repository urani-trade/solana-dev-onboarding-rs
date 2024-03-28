// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { 07CreateDappCli } from '../target/types/07_create_dapp_cli';
import { IDL as 07CreateDappCliIDL } from '../target/types/07_create_dapp_cli';

// Re-export the generated IDL and type
export { 07CreateDappCli, 07CreateDappCliIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const 07_CREATE_DAPP_CLI_PROGRAM_ID = new PublicKey('5tHQrDY8TYevNnBXW2yDS4i6YV3Brnj6BkmUGvHZEDCR')

// This is a helper function to get the program ID for the 07CreateDappCli program depending on the cluster.
export function get07CreateDappCliProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return 07_CREATE_DAPP_CLI_PROGRAM_ID
  }
}
