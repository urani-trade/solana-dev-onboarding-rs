"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletListItem = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const react_1 = __importDefault(require("react"));
const Button_1 = require("./Button");
const WalletIcon_1 = require("./WalletIcon");
const WalletListItem = ({ handleClick, tabIndex, wallet }) => {
    return (react_1.default.createElement("li", null,
        react_1.default.createElement(Button_1.Button, { onClick: handleClick, startIcon: react_1.default.createElement(WalletIcon_1.WalletIcon, { wallet: wallet }), tabIndex: tabIndex },
            wallet.adapter.name,
            wallet.readyState === wallet_adapter_base_1.WalletReadyState.Installed && react_1.default.createElement("span", null, "Detected"))));
};
exports.WalletListItem = WalletListItem;
//# sourceMappingURL=WalletListItem.js.map