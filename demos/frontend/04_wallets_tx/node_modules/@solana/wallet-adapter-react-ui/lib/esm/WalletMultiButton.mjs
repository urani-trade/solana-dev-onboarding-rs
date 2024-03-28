import { useWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button.mjs';
import { useWalletModal } from './useWalletModal.mjs';
import { WalletConnectButton } from './WalletConnectButton.mjs';
import { WalletIcon } from './WalletIcon.mjs';
import { WalletModalButton } from './WalletModalButton.mjs';
export const WalletMultiButton = ({ children, ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [active, setActive] = useState(false);
    const ref = useRef(null);
    const base58 = useMemo(() => publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children)
            return children;
        if (!wallet || !base58)
            return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);
    const copyAddress = useCallback(async () => {
        if (base58) {
            await navigator.clipboard.writeText(base58);
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    }, [base58]);
    const openDropdown = useCallback(() => {
        setActive(true);
    }, []);
    const closeDropdown = useCallback(() => {
        setActive(false);
    }, []);
    const openModal = useCallback(() => {
        setVisible(true);
        closeDropdown();
    }, [closeDropdown]);
    useEffect(() => {
        const listener = (event) => {
            const node = ref.current;
            // Do nothing if clicking dropdown or its descendants
            if (!node || node.contains(event.target))
                return;
            closeDropdown();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, closeDropdown]);
    if (!wallet)
        return React.createElement(WalletModalButton, { ...props }, children);
    if (!base58)
        return React.createElement(WalletConnectButton, { ...props }, children);
    return (React.createElement("div", { className: "wallet-adapter-dropdown" },
        React.createElement(Button, { "aria-expanded": active, className: "wallet-adapter-button-trigger", style: { pointerEvents: active ? 'none' : 'auto', ...props.style }, onClick: openDropdown, startIcon: React.createElement(WalletIcon, { wallet: wallet }), ...props }, content),
        React.createElement("ul", { "aria-label": "dropdown-list", className: `wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`, ref: ref, role: "menu" },
            React.createElement("li", { onClick: copyAddress, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, copied ? 'Copied' : 'Copy address'),
            React.createElement("li", { onClick: openModal, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, "Change wallet"),
            React.createElement("li", { onClick: disconnect, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, "Disconnect"))));
};
//# sourceMappingURL=WalletMultiButton.js.map