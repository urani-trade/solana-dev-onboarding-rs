import { Connection } from '@solana/web3.js';
import React from 'react';
export interface ConnectionContextState {
    connection: Connection;
}
export declare const ConnectionContext: React.Context<ConnectionContextState>;
export declare function useConnection(): ConnectionContextState;
