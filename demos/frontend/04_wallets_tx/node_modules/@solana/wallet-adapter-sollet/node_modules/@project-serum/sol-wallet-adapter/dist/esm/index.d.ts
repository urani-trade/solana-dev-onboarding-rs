/// <reference types="node" />
import EventEmitter from 'eventemitter3';
import { PublicKey, Transaction } from '@solana/web3.js';
export default class Wallet extends EventEmitter {
    private _network;
    private _providerUrl;
    private _injectedProvider?;
    private _publicKey;
    private _popup;
    private _handlerAdded;
    private _nextRequestId;
    private _autoApprove;
    private _responsePromises;
    constructor(provider: unknown, _network: string);
    handleMessage: (e: MessageEvent<{
        id: number;
        method: string;
        params: {
            autoApprove: boolean;
            publicKey: string;
        };
        result?: string;
        error?: string;
    }>) => void;
    private handleConnect;
    private handleDisconnect;
    private sendRequest;
    get publicKey(): PublicKey | null;
    get connected(): boolean;
    get autoApprove(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private _beforeUnload;
    sign(data: Uint8Array, display: unknown): Promise<{
        signature: Buffer;
        publicKey: PublicKey;
    }>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    diffieHellman(publicKey: Uint8Array): Promise<{
        publicKey: Uint8Array;
        secretKey: Uint8Array;
    }>;
}
//# sourceMappingURL=index.d.ts.map