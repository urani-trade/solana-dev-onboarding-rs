/// <reference types="react" />
export interface WalletModalContextState {
    visible: boolean;
    setVisible: (open: boolean) => void;
}
export declare const WalletModalContext: import("react").Context<WalletModalContextState>;
export declare function useWalletModal(): WalletModalContextState;
