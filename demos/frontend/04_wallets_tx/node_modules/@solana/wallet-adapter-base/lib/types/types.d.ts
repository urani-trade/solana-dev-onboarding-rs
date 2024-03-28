import { WalletAdapter } from './adapter';
import { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer';
export declare type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;
export declare enum WalletAdapterNetwork {
    Mainnet = "mainnet-beta",
    Testnet = "testnet",
    Devnet = "devnet"
}
