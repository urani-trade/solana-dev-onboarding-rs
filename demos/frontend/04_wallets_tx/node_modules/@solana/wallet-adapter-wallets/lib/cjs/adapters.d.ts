import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
export interface WalletsConfig {
    network?: WalletAdapterNetwork;
}
export declare function getWalletAdapters({ network }?: WalletsConfig): Adapter[];
