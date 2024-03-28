import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { BaseWalletAdapter, SendTransactionOptions, WalletAdapter } from './adapter';
export interface SignerWalletAdapterProps {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}
export declare type SignerWalletAdapter = WalletAdapter & SignerWalletAdapterProps;
export declare abstract class BaseSignerWalletAdapter extends BaseWalletAdapter implements SignerWalletAdapter {
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    abstract signTransaction(transaction: Transaction): Promise<Transaction>;
    abstract signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}
export interface MessageSignerWalletAdapterProps {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}
export declare type MessageSignerWalletAdapter = WalletAdapter & MessageSignerWalletAdapterProps;
export declare abstract class BaseMessageSignerWalletAdapter extends BaseSignerWalletAdapter implements MessageSignerWalletAdapter {
    abstract signMessage(message: Uint8Array): Promise<Uint8Array>;
}
