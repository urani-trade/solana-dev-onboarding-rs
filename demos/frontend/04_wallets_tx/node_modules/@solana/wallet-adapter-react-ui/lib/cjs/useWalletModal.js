"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWalletModal = exports.WalletModalContext = void 0;
const react_1 = require("react");
const DEFAULT_CONTEXT = {
    setVisible(_open) {
        console.error(constructMissingProviderErrorMessage('call', 'setVisible'));
    },
    visible: false,
};
Object.defineProperty(DEFAULT_CONTEXT, 'visible', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'visible'));
        return false;
    },
});
function constructMissingProviderErrorMessage(action, valueName) {
    return ('You have tried to ' +
        ` ${action} "${valueName}"` +
        ' on a WalletModalContext without providing one.' +
        ' Make sure to render a WalletModalProvider' +
        ' as an ancestor of the component that uses ' +
        'WalletModalContext');
}
exports.WalletModalContext = (0, react_1.createContext)(DEFAULT_CONTEXT);
function useWalletModal() {
    return (0, react_1.useContext)(exports.WalletModalContext);
}
exports.useWalletModal = useWalletModal;
//# sourceMappingURL=useWalletModal.js.map