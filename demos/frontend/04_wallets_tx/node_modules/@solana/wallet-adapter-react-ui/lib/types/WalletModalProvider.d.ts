import { FC, ReactNode } from 'react';
import { WalletModalProps } from './WalletModal';
export interface WalletModalProviderProps extends WalletModalProps {
    children: ReactNode;
}
export declare const WalletModalProvider: FC<WalletModalProviderProps>;
