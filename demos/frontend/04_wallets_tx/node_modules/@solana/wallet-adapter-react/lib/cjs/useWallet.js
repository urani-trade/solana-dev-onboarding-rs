"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWallet = exports.WalletContext = void 0;
const react_1 = require("react");
const EMPTY_ARRAY = [];
const DEFAULT_CONTEXT = {
    autoConnect: false,
    connecting: false,
    connected: false,
    disconnecting: false,
    select(_name) {
        console.error(constructMissingProviderErrorMessage('get', 'select'));
    },
    connect() {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'connect')));
    },
    disconnect() {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'disconnect')));
    },
    sendTransaction(_transaction, _connection, _options) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'sendTransaction')));
    },
    signTransaction(_transaction) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signTransaction')));
    },
    signAllTransactions(_transaction) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signAllTransactions')));
    },
    signMessage(_message) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signMessage')));
    },
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'wallets'));
        return EMPTY_ARRAY;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'wallet'));
        return null;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'publicKey'));
        return null;
    },
});
function constructMissingProviderErrorMessage(action, valueName) {
    return ('You have tried to ' +
        ` ${action} "${valueName}"` +
        ' on a WalletContext without providing one.' +
        ' Make sure to render a WalletProvider' +
        ' as an ancestor of the component that uses ' +
        'WalletContext');
}
exports.WalletContext = (0, react_1.createContext)(DEFAULT_CONTEXT);
function useWallet() {
    return (0, react_1.useContext)(exports.WalletContext);
}
exports.useWallet = useWallet;
//# sourceMappingURL=useWallet.js.map