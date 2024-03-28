import { BaseWalletAdapter, SendTransactionOptions, WalletAdapterNetwork, WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
export interface BloctoWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}
export declare const BloctoWalletName: WalletName;
export declare class BloctoWalletAdapter extends BaseWalletAdapter {
    name: WalletName;
    url: string;
    icon: string;
    private _connecting;
    private _wallet;
    private _publicKey;
    private _network;
    private _readyState;
    constructor(config?: BloctoWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
}
