"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.BloctoWalletAdapter = exports.BloctoWalletName = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const web3_js_1 = require("@solana/web3.js");
exports.BloctoWalletName = 'Blocto';
class BloctoWalletAdapter extends wallet_adapter_base_1.BaseWalletAdapter {
    constructor(config = {}) {
        super();
        this.name = exports.BloctoWalletName;
        this.url = 'https://blocto.app';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTE5LjQ4MzggMTUuMjQ5Yy4yNzY5IDAgLjUwNDguMjA5OS41MzI1LjQ3ODhsLjAwMjIuMDQyOS0uMDA0My4xMTQyYy0uMzM1IDMuOTgzMy0zLjc5MDQgNy4xMTUxLTguMDAzNyA3LjExNTEtNC4xNzA2IDAtNy41OTg2My0zLjA2ODctNy45OTI2OS02Ljk5NDZsLS4wMTYzOC0uMTgxMS0uMDAxMDYtLjA1MzIuMDAxNzgtLjAzOThjLjAyNTk4LS4yNzA2LjI1NDg3LS40ODIzLjUzMjg5LS40ODIzeiIgZmlsbD0iI2FmZDhmNyIvPjxwYXRoIGQ9Im00LjMwMDA5IDFjMy43ODc1NSAwIDYuODI1ODEgMi45MDkxMSA2LjgyNTgxIDYuNTAyNzd2Ni4zNTM0M2MtLjAwMDQuMjkxNy0uMjM5Mi41Mjg0LS41MzQuNTI4OGwtNi4wNTc1OC4wMDMyYy0uMjk1MTEuMDAwNy0uNTM0MzItLjIzNjEtLjUzNDMyLS41Mjc4bC4wMDAzNi0xMi41NjM3NWMwLS4xNTE0OS4xMTQyNi0uMjc2MjIuMjYxOTktLjI5NDE4eiIgZmlsbD0iIzE4MmE3MSIvPjxwYXRoIGQ9Im0xOS42OTIxIDEyLjIzODMuMDM4OC4xMjgzLS4wMjg4LS4wODQ2Yy4xNjE2LjQ1MzQuMjY2Ni43NzY5LjMxNTMgMS4zNDEzLjAzMzUuMzg3OS0uMjU3LjcyODktLjY0ODUuNzYybC0uMDMwMy4wMDIyLTMuMDgwOS4wMDA3Yy0yLjEwNjMgMC0zLjgyMDQtMS40NzQxLTMuODc1Mi0zLjU0MjNsLS4wMDE0LS4xMDIxdi0zLjQ2NThjMC0uMjAxNTMuMTY5NC0uMzY5NTkuMzc0MS0uMzYwMDcgMy4zMDAzLjE1NDY2IDUuOTk3OCAyLjM0MTUxIDYuOTM2OSA1LjMyMDM3eiIgZmlsbD0iIzM0ODVjNCIvPjwvZz48L3N2Zz4=';
        this._readyState = typeof window === 'undefined' ? wallet_adapter_base_1.WalletReadyState.Unsupported : wallet_adapter_base_1.WalletReadyState.Loadable;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._network = config.network || wallet_adapter_base_1.WalletAdapterNetwork.Mainnet;
    }
    get publicKey() {
        return this._publicKey;
    }
    get connecting() {
        return this._connecting;
    }
    get readyState() {
        return this._readyState;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected || this.connecting)
                    return;
                if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Loadable)
                    throw new wallet_adapter_base_1.WalletNotReadyError();
                this._connecting = true;
                let BloctoClass;
                try {
                    ({ default: BloctoClass } = yield Promise.resolve().then(() => __importStar(require('@blocto/sdk'))));
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletLoadError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                let wallet;
                try {
                    wallet = new BloctoClass({ solana: { net: this._network } }).solana;
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletConfigError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletConfigError();
                if (!wallet.connected) {
                    try {
                        yield wallet.connect();
                    }
                    catch (error) {
                        throw new wallet_adapter_base_1.WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                    }
                }
                const account = wallet.accounts[0];
                if (!account)
                    throw new wallet_adapter_base_1.WalletAccountError();
                let publicKey;
                try {
                    publicKey = new web3_js_1.PublicKey(account);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('connect', publicKey);
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            finally {
                this._connecting = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = this._wallet;
            if (wallet) {
                this._wallet = null;
                this._publicKey = null;
                try {
                    yield wallet.disconnect();
                }
                catch (error) {
                    this.emit('error', new wallet_adapter_base_1.WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
                }
            }
            this.emit('disconnect');
        });
    }
    sendTransaction(transaction, connection, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                    transaction.recentBlockhash =
                        transaction.recentBlockhash || (yield connection.getRecentBlockhash('finalized')).blockhash;
                    const { signers } = options;
                    if (signers === null || signers === void 0 ? void 0 : signers.length) {
                        transaction = yield wallet.convertToProgramWalletTransaction(transaction);
                        transaction.partialSign(...signers);
                    }
                    return yield wallet.signAndSendTransaction(transaction, connection);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSendTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
}
exports.BloctoWalletAdapter = BloctoWalletAdapter;
//# sourceMappingURL=adapter.js.map