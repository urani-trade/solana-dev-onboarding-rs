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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
exports.WalletMultiButton = void 0;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const react_1 = __importStar(require("react"));
const Button_1 = require("./Button");
const useWalletModal_1 = require("./useWalletModal");
const WalletConnectButton_1 = require("./WalletConnectButton");
const WalletIcon_1 = require("./WalletIcon");
const WalletModalButton_1 = require("./WalletModalButton");
const WalletMultiButton = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    const { publicKey, wallet, disconnect } = (0, wallet_adapter_react_1.useWallet)();
    const { setVisible } = (0, useWalletModal_1.useWalletModal)();
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [active, setActive] = (0, react_1.useState)(false);
    const ref = (0, react_1.useRef)(null);
    const base58 = (0, react_1.useMemo)(() => publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(), [publicKey]);
    const content = (0, react_1.useMemo)(() => {
        if (children)
            return children;
        if (!wallet || !base58)
            return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);
    const copyAddress = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (base58) {
            yield navigator.clipboard.writeText(base58);
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    }), [base58]);
    const openDropdown = (0, react_1.useCallback)(() => {
        setActive(true);
    }, []);
    const closeDropdown = (0, react_1.useCallback)(() => {
        setActive(false);
    }, []);
    const openModal = (0, react_1.useCallback)(() => {
        setVisible(true);
        closeDropdown();
    }, [closeDropdown]);
    (0, react_1.useEffect)(() => {
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
        return react_1.default.createElement(WalletModalButton_1.WalletModalButton, Object.assign({}, props), children);
    if (!base58)
        return react_1.default.createElement(WalletConnectButton_1.WalletConnectButton, Object.assign({}, props), children);
    return (react_1.default.createElement("div", { className: "wallet-adapter-dropdown" },
        react_1.default.createElement(Button_1.Button, Object.assign({ "aria-expanded": active, className: "wallet-adapter-button-trigger", style: Object.assign({ pointerEvents: active ? 'none' : 'auto' }, props.style), onClick: openDropdown, startIcon: react_1.default.createElement(WalletIcon_1.WalletIcon, { wallet: wallet }) }, props), content),
        react_1.default.createElement("ul", { "aria-label": "dropdown-list", className: `wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`, ref: ref, role: "menu" },
            react_1.default.createElement("li", { onClick: copyAddress, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, copied ? 'Copied' : 'Copy address'),
            react_1.default.createElement("li", { onClick: openModal, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, "Change wallet"),
            react_1.default.createElement("li", { onClick: disconnect, className: "wallet-adapter-dropdown-list-item", role: "menuitem" }, "Disconnect"))));
};
exports.WalletMultiButton = WalletMultiButton;
//# sourceMappingURL=WalletMultiButton.js.map