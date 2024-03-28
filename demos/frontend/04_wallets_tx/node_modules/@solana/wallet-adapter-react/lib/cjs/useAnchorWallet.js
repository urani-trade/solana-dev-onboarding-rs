"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnchorWallet = void 0;
const react_1 = require("react");
const useWallet_1 = require("./useWallet");
function useAnchorWallet() {
    const { publicKey, signTransaction, signAllTransactions } = (0, useWallet_1.useWallet)();
    return (0, react_1.useMemo)(() => publicKey && signTransaction && signAllTransactions
        ? { publicKey, signTransaction, signAllTransactions }
        : undefined, [publicKey, signTransaction, signAllTransactions]);
}
exports.useAnchorWallet = useAnchorWallet;
//# sourceMappingURL=useAnchorWallet.js.map