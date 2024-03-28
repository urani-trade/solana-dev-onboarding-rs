import { ConnectionConfig } from '@solana/web3.js';
import { FC, ReactNode } from 'react';
export interface ConnectionProviderProps {
    children: ReactNode;
    endpoint: string;
    config?: ConnectionConfig;
}
export declare const ConnectionProvider: FC<ConnectionProviderProps>;
