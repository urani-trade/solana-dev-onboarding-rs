import { Adapter, WalletError } from '@solana/wallet-adapter-base';
import { FC, ReactNode } from 'react';
export interface WalletProviderProps {
    children: ReactNode;
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}
export declare const WalletProvider: FC<WalletProviderProps>;
