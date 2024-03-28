import { useWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useMemo } from 'react';
import { Button } from './Button.mjs';
import { WalletIcon } from './WalletIcon.mjs';
export const WalletConnectButton = ({ children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected } = useWallet();
    const handleClick = useCallback((event) => {
        if (onClick)
            onClick(event);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        if (!event.defaultPrevented)
            connect().catch(() => { });
    }, [onClick, connect]);
    const content = useMemo(() => {
        if (children)
            return children;
        if (connecting)
            return 'Connecting ...';
        if (connected)
            return 'Connected';
        if (wallet)
            return 'Connect';
        return 'Connect Wallet';
    }, [children, connecting, connected, wallet]);
    return (React.createElement(Button, { className: "wallet-adapter-button-trigger", disabled: disabled || !wallet || connecting || connected, startIcon: wallet ? React.createElement(WalletIcon, { wallet: wallet }) : undefined, onClick: handleClick, ...props }, content));
};
//# sourceMappingURL=WalletConnectButton.js.map