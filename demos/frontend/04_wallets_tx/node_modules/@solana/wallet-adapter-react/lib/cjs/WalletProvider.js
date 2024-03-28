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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletProvider = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const react_1 = __importStar(require("react"));
const errors_1 = require("./errors");
const useLocalStorage_1 = require("./useLocalStorage");
const useWallet_1 = require("./useWallet");
const initialState = {
    wallet: null,
    adapter: null,
    publicKey: null,
    connected: false,
};
const WalletProvider = ({ children, wallets: adapters, autoConnect = false, onError, localStorageKey = 'walletName', }) => {
    const [name, setName] = (0, useLocalStorage_1.useLocalStorage)(localStorageKey, null);
    const [{ wallet, adapter, publicKey, connected }, setState] = (0, react_1.useState)(initialState);
    const readyState = (adapter === null || adapter === void 0 ? void 0 : adapter.readyState) || wallet_adapter_base_1.WalletReadyState.Unsupported;
    const [connecting, setConnecting] = (0, react_1.useState)(false);
    const [disconnecting, setDisconnecting] = (0, react_1.useState)(false);
    const isConnecting = (0, react_1.useRef)(false);
    const isDisconnecting = (0, react_1.useRef)(false);
    const isUnloading = (0, react_1.useRef)(false);
    // Wrap adapters to conform to the `Wallet` interface
    const [wallets, setWallets] = (0, react_1.useState)(() => adapters.map((adapter) => ({
        adapter,
        readyState: adapter.readyState,
    })));
    // When the wallets change, start to listen for changes to their `readyState`
    (0, react_1.useEffect)(() => {
        function handleReadyStateChange(readyState) {
            setWallets((prevWallets) => {
                const walletIndex = prevWallets.findIndex(({ adapter }) => adapter.name === this.name);
                if (walletIndex === -1)
                    return prevWallets;
                return [
                    ...prevWallets.slice(0, walletIndex),
                    Object.assign(Object.assign({}, prevWallets[walletIndex]), { readyState }),
                    ...prevWallets.slice(walletIndex + 1),
                ];
            });
        }
        for (const adapter of adapters) {
            adapter.on('readyStateChange', handleReadyStateChange, adapter);
        }
        return () => {
            for (const adapter of adapters) {
                adapter.off('readyStateChange', handleReadyStateChange, adapter);
            }
        };
    }, [adapters]);
    // When the selected wallet changes, initialize the state
    (0, react_1.useEffect)(() => {
        const wallet = wallets.find(({ adapter }) => adapter.name === name);
        if (wallet) {
            setState({
                wallet,
                adapter: wallet.adapter,
                connected: wallet.adapter.connected,
                publicKey: wallet.adapter.publicKey,
            });
        }
        else {
            setState(initialState);
        }
    }, [name, wallets]);
    // If autoConnect is enabled, try to connect when the adapter changes and is ready
    (0, react_1.useEffect)(() => {
        if (isConnecting.current ||
            connecting ||
            connected ||
            !autoConnect ||
            !adapter ||
            !(readyState === wallet_adapter_base_1.WalletReadyState.Installed || readyState === wallet_adapter_base_1.WalletReadyState.Loadable))
            return;
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                isConnecting.current = true;
                setConnecting(true);
                try {
                    yield adapter.connect();
                }
                catch (error) {
                    // Clear the selected wallet
                    setName(null);
                    // Don't throw error, but handleError will still be called
                }
                finally {
                    setConnecting(false);
                    isConnecting.current = false;
                }
            });
        })();
    }, [isConnecting, connecting, connected, autoConnect, adapter, readyState]);
    // If the window is closing or reloading, ignore disconnect and error events from the adapter
    (0, react_1.useEffect)(() => {
        function listener() {
            isUnloading.current = true;
        }
        window.addEventListener('beforeunload', listener);
        return () => window.removeEventListener('beforeunload', listener);
    }, [isUnloading]);
    // Handle the adapter's connect event
    const handleConnect = (0, react_1.useCallback)(() => {
        if (!adapter)
            return;
        setState((state) => (Object.assign(Object.assign({}, state), { connected: adapter.connected, publicKey: adapter.publicKey })));
    }, [adapter]);
    // Handle the adapter's disconnect event
    const handleDisconnect = (0, react_1.useCallback)(() => {
        // Clear the selected wallet unless the window is unloading
        if (!isUnloading.current)
            setName(null);
    }, [isUnloading]);
    // Handle the adapter's error event, and local errors
    const handleError = (0, react_1.useCallback)((error) => {
        // Call onError unless the window is unloading
        if (!isUnloading.current)
            (onError || console.error)(error);
        return error;
    }, [isUnloading, onError]);
    // Setup and teardown event listeners when the adapter changes
    (0, react_1.useEffect)(() => {
        if (adapter) {
            adapter.on('connect', handleConnect);
            adapter.on('disconnect', handleDisconnect);
            adapter.on('error', handleError);
            return () => {
                adapter.off('connect', handleConnect);
                adapter.off('disconnect', handleDisconnect);
                adapter.off('error', handleError);
            };
        }
    }, [adapter, handleConnect, handleDisconnect, handleError]);
    // When the adapter changes, disconnect the old one
    (0, react_1.useEffect)(() => {
        return () => {
            adapter === null || adapter === void 0 ? void 0 : adapter.disconnect();
        };
    }, [adapter]);
    // Connect the adapter to the wallet
    const connect = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (isConnecting.current || connecting || disconnecting || connected)
            return;
        if (!adapter)
            throw handleError(new errors_1.WalletNotSelectedError());
        if (!(readyState === wallet_adapter_base_1.WalletReadyState.Installed || readyState === wallet_adapter_base_1.WalletReadyState.Loadable)) {
            // Clear the selected wallet
            setName(null);
            if (typeof window !== 'undefined') {
                window.open(adapter.url, '_blank');
            }
            throw handleError(new wallet_adapter_base_1.WalletNotReadyError());
        }
        isConnecting.current = true;
        setConnecting(true);
        try {
            yield adapter.connect();
        }
        catch (error) {
            // Clear the selected wallet
            setName(null);
            // Rethrow the error, and handleError will also be called
            throw error;
        }
        finally {
            setConnecting(false);
            isConnecting.current = false;
        }
    }), [isConnecting, connecting, disconnecting, connected, adapter, readyState, handleError]);
    // Disconnect the adapter from the wallet
    const disconnect = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (isDisconnecting.current || disconnecting)
            return;
        if (!adapter)
            return setName(null);
        isDisconnecting.current = true;
        setDisconnecting(true);
        try {
            yield adapter.disconnect();
        }
        catch (error) {
            // Clear the selected wallet
            setName(null);
            // Rethrow the error, and handleError will also be called
            throw error;
        }
        finally {
            setDisconnecting(false);
            isDisconnecting.current = false;
        }
    }), [isDisconnecting, disconnecting, adapter]);
    // Send a transaction using the provided connection
    const sendTransaction = (0, react_1.useCallback)((transaction, connection, options) => __awaiter(void 0, void 0, void 0, function* () {
        if (!adapter)
            throw handleError(new errors_1.WalletNotSelectedError());
        if (!connected)
            throw handleError(new wallet_adapter_base_1.WalletNotConnectedError());
        return yield adapter.sendTransaction(transaction, connection, options);
    }), [adapter, handleError, connected]);
    // Sign a transaction if the wallet supports it
    const signTransaction = (0, react_1.useMemo)(() => adapter && 'signTransaction' in adapter
        ? (transaction) => __awaiter(void 0, void 0, void 0, function* () {
            if (!connected)
                throw handleError(new wallet_adapter_base_1.WalletNotConnectedError());
            return yield adapter.signTransaction(transaction);
        })
        : undefined, [adapter, handleError, connected]);
    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = (0, react_1.useMemo)(() => adapter && 'signAllTransactions' in adapter
        ? (transactions) => __awaiter(void 0, void 0, void 0, function* () {
            if (!connected)
                throw handleError(new wallet_adapter_base_1.WalletNotConnectedError());
            return yield adapter.signAllTransactions(transactions);
        })
        : undefined, [adapter, handleError, connected]);
    // Sign an arbitrary message if the wallet supports it
    const signMessage = (0, react_1.useMemo)(() => adapter && 'signMessage' in adapter
        ? (message) => __awaiter(void 0, void 0, void 0, function* () {
            if (!connected)
                throw handleError(new wallet_adapter_base_1.WalletNotConnectedError());
            return yield adapter.signMessage(message);
        })
        : undefined, [adapter, handleError, connected]);
    return (react_1.default.createElement(useWallet_1.WalletContext.Provider, { value: {
            autoConnect,
            wallets,
            wallet,
            publicKey,
            connected,
            connecting,
            disconnecting,
            select: setName,
            connect,
            disconnect,
            sendTransaction,
            signTransaction,
            signAllTransactions,
            signMessage,
        } }, children));
};
exports.WalletProvider = WalletProvider;
//# sourceMappingURL=WalletProvider.js.map