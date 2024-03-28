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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletDisconnectButton = void 0;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const react_1 = __importStar(require("react"));
const Button_1 = require("./Button");
const WalletIcon_1 = require("./WalletIcon");
const WalletDisconnectButton = (_a) => {
    var { children, disabled, onClick } = _a, props = __rest(_a, ["children", "disabled", "onClick"]);
    const { wallet, disconnect, disconnecting } = (0, wallet_adapter_react_1.useWallet)();
    const handleClick = (0, react_1.useCallback)((event) => {
        if (onClick)
            onClick(event);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        if (!event.defaultPrevented)
            disconnect().catch(() => { });
    }, [onClick, disconnect]);
    const content = (0, react_1.useMemo)(() => {
        if (children)
            return children;
        if (disconnecting)
            return 'Disconnecting ...';
        if (wallet)
            return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);
    return (react_1.default.createElement(Button_1.Button, Object.assign({ className: "wallet-adapter-button-trigger", disabled: disabled || !wallet, startIcon: wallet ? react_1.default.createElement(WalletIcon_1.WalletIcon, { wallet: wallet }) : undefined, onClick: handleClick }, props), content));
};
exports.WalletDisconnectButton = WalletDisconnectButton;
//# sourceMappingURL=WalletDisconnectButton.js.map