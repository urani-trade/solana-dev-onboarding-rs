"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const Button = (props) => {
    return (react_1.default.createElement("button", { className: `wallet-adapter-button ${props.className || ''}`, disabled: props.disabled, onClick: props.onClick, tabIndex: props.tabIndex || 0, type: "button" },
        props.startIcon && react_1.default.createElement("i", { className: "wallet-adapter-button-start-icon" }, props.startIcon),
        props.children,
        props.endIcon && react_1.default.createElement("i", { className: "wallet-adapter-button-end-icon" }, props.endIcon)));
};
exports.Button = Button;
//# sourceMappingURL=Button.js.map