"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModal = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const react_1 = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const Collapse_1 = require("./Collapse");
const useWalletModal_1 = require("./useWalletModal");
const WalletListItem_1 = require("./WalletListItem");
const WalletSVG_1 = require("./WalletSVG");
const WalletModal = ({ className = '', container = 'body' }) => {
    const ref = (0, react_1.useRef)(null);
    const { wallets, select } = (0, wallet_adapter_react_1.useWallet)();
    const { setVisible } = (0, useWalletModal_1.useWalletModal)();
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const [fadeIn, setFadeIn] = (0, react_1.useState)(false);
    const [portal, setPortal] = (0, react_1.useState)(null);
    const [installedWallets, otherWallets] = (0, react_1.useMemo)(() => {
        const installed = [];
        const notDetected = [];
        const loadable = [];
        for (const wallet of wallets) {
            if (wallet.readyState === wallet_adapter_base_1.WalletReadyState.NotDetected) {
                notDetected.push(wallet);
            }
            else if (wallet.readyState === wallet_adapter_base_1.WalletReadyState.Loadable) {
                loadable.push(wallet);
            }
            else if (wallet.readyState === wallet_adapter_base_1.WalletReadyState.Installed) {
                installed.push(wallet);
            }
        }
        return [installed, [...loadable, ...notDetected]];
    }, [wallets]);
    const getStartedWallet = (0, react_1.useMemo)(() => {
        return installedWallets.length
            ? installedWallets[0]
            : wallets.find((wallet) => wallet.adapter.name === 'Torus') ||
                wallets.find((wallet) => wallet.adapter.name === 'Phantom') ||
                wallets.find((wallet) => wallet.readyState === wallet_adapter_base_1.WalletReadyState.Loadable) ||
                otherWallets[0];
    }, [installedWallets, wallets, otherWallets]);
    const hideModal = (0, react_1.useCallback)(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, []);
    const handleClose = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        hideModal();
    }, [hideModal]);
    const handleWalletClick = (0, react_1.useCallback)((event, walletName) => {
        select(walletName);
        handleClose(event);
    }, [select, handleClose]);
    const handleCollapseClick = (0, react_1.useCallback)(() => setExpanded(!expanded), [expanded]);
    const handleTabKey = (0, react_1.useCallback)((event) => {
        const node = ref.current;
        if (!node)
            return;
        // here we query all focusable elements
        const focusableElements = node.querySelectorAll('button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey) {
            // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        }
        else {
            // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }, [ref]);
    (0, react_1.useLayoutEffect)(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                hideModal();
            }
            else if (event.key === 'Tab') {
                handleTabKey(event);
            }
        };
        // Get original overflow
        const { overflow } = window.getComputedStyle(document.body);
        // Hack to enable fade in animation after mount
        setTimeout(() => setFadeIn(true), 0);
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Listen for keydown events
        window.addEventListener('keydown', handleKeyDown, false);
        return () => {
            // Re-enable scrolling when component unmounts
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [hideModal, handleTabKey]);
    (0, react_1.useLayoutEffect)(() => setPortal(document.querySelector(container)), [container]);
    return (portal &&
        (0, react_dom_1.createPortal)(react_1.default.createElement("div", { "aria-labelledby": "wallet-adapter-modal-title", "aria-modal": "true", className: `wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`, ref: ref, role: "dialog" },
            react_1.default.createElement("div", { className: "wallet-adapter-modal-container" },
                react_1.default.createElement("div", { className: "wallet-adapter-modal-wrapper" },
                    react_1.default.createElement("button", { onClick: handleClose, className: "wallet-adapter-modal-button-close" },
                        react_1.default.createElement("svg", { width: "14", height: "14" },
                            react_1.default.createElement("path", { d: "M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" }))),
                    installedWallets.length ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("h1", { className: "wallet-adapter-modal-title" }, "Connect a wallet on Solana to continue"),
                        react_1.default.createElement("ul", { className: "wallet-adapter-modal-list" },
                            installedWallets.map((wallet) => (react_1.default.createElement(WalletListItem_1.WalletListItem, { key: wallet.adapter.name, handleClick: (event) => handleWalletClick(event, wallet.adapter.name), wallet: wallet }))),
                            otherWallets.length ? (react_1.default.createElement(Collapse_1.Collapse, { expanded: expanded, id: "wallet-adapter-modal-collapse" }, otherWallets.map((wallet) => (react_1.default.createElement(WalletListItem_1.WalletListItem, { key: wallet.adapter.name, handleClick: (event) => handleWalletClick(event, wallet.adapter.name), tabIndex: expanded ? 0 : -1, wallet: wallet }))))) : null),
                        otherWallets.length ? (react_1.default.createElement("button", { className: "wallet-adapter-modal-list-more", onClick: handleCollapseClick, tabIndex: 0 },
                            react_1.default.createElement("span", null,
                                expanded ? 'Less ' : 'More ',
                                "options"),
                            react_1.default.createElement("svg", { width: "13", height: "7", viewBox: "0 0 13 7", xmlns: "http://www.w3.org/2000/svg", className: `${expanded ? 'wallet-adapter-modal-list-more-icon-rotate' : ''}` },
                                react_1.default.createElement("path", { d: "M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" })))) : null)) : (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("h1", { className: "wallet-adapter-modal-title" }, "You'll need a wallet on Solana to continue"),
                        react_1.default.createElement("div", { className: "wallet-adapter-modal-middle" },
                            react_1.default.createElement(WalletSVG_1.WalletSVG, null),
                            react_1.default.createElement("button", { type: "button", className: "wallet-adapter-modal-middle-button", onClick: (event) => handleWalletClick(event, getStartedWallet.adapter.name) }, "Get started")),
                        otherWallets.length ? (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement("button", { className: "wallet-adapter-modal-list-more", onClick: handleCollapseClick, tabIndex: 0 },
                                react_1.default.createElement("span", null,
                                    expanded ? 'Hide ' : 'Already have a wallet? View ',
                                    "options"),
                                react_1.default.createElement("svg", { width: "13", height: "7", viewBox: "0 0 13 7", xmlns: "http://www.w3.org/2000/svg", className: `${expanded ? 'wallet-adapter-modal-list-more-icon-rotate' : ''}` },
                                    react_1.default.createElement("path", { d: "M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" }))),
                            react_1.default.createElement(Collapse_1.Collapse, { expanded: expanded, id: "wallet-adapter-modal-collapse" },
                                react_1.default.createElement("ul", { className: "wallet-adapter-modal-list" }, otherWallets.map((wallet) => (react_1.default.createElement(WalletListItem_1.WalletListItem, { key: wallet.adapter.name, handleClick: (event) => handleWalletClick(event, wallet.adapter.name), tabIndex: expanded ? 0 : -1, wallet: wallet }))))))) : null)))),
            react_1.default.createElement("div", { className: "wallet-adapter-modal-overlay", onMouseDown: handleClose })), portal));
};
exports.WalletModal = WalletModal;
//# sourceMappingURL=WalletModal.js.map