var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
export default class Wallet extends EventEmitter {
    constructor(provider, _network) {
        super();
        this._network = _network;
        this._publicKey = null;
        this._popup = null;
        this._handlerAdded = false;
        this._nextRequestId = 1;
        this._autoApprove = false;
        this._responsePromises = new Map();
        this.handleMessage = (e) => {
            var _a;
            if ((this._injectedProvider && e.source === window) ||
                (e.origin === ((_a = this._providerUrl) === null || _a === void 0 ? void 0 : _a.origin) && e.source === this._popup)) {
                if (e.data.method === 'connected') {
                    const newPublicKey = new PublicKey(e.data.params.publicKey);
                    if (!this._publicKey || !this._publicKey.equals(newPublicKey)) {
                        if (this._publicKey && !this._publicKey.equals(newPublicKey)) {
                            this.handleDisconnect();
                        }
                        this._publicKey = newPublicKey;
                        this._autoApprove = !!e.data.params.autoApprove;
                        this.emit('connect', this._publicKey);
                    }
                }
                else if (e.data.method === 'disconnected') {
                    this.handleDisconnect();
                }
                else if (e.data.result || e.data.error) {
                    const promises = this._responsePromises.get(e.data.id);
                    if (promises) {
                        const [resolve, reject] = promises;
                        if (e.data.result) {
                            resolve(e.data.result);
                        }
                        else {
                            reject(new Error(e.data.error));
                        }
                    }
                }
            }
        };
        this._beforeUnload = () => {
            void this.disconnect();
        };
        if (isInjectedProvider(provider)) {
            this._injectedProvider = provider;
        }
        else if (isString(provider)) {
            this._providerUrl = new URL(provider);
            this._providerUrl.hash = new URLSearchParams({
                origin: window.location.origin,
                network: this._network,
            }).toString();
        }
        else {
            throw new Error('provider parameter must be an injected provider or a URL string.');
        }
    }
    handleConnect() {
        var _a;
        if (!this._handlerAdded) {
            this._handlerAdded = true;
            window.addEventListener('message', this.handleMessage);
            window.addEventListener('beforeunload', this._beforeUnload);
        }
        if (this._injectedProvider) {
            return new Promise((resolve) => {
                void this.sendRequest('connect', {});
                resolve();
            });
        }
        else {
            window.name = 'parent';
            this._popup = window.open((_a = this._providerUrl) === null || _a === void 0 ? void 0 : _a.toString(), '_blank', 'location,resizable,width=460,height=675');
            return new Promise((resolve) => {
                this.once('connect', resolve);
            });
        }
    }
    handleDisconnect() {
        if (this._handlerAdded) {
            this._handlerAdded = false;
            window.removeEventListener('message', this.handleMessage);
            window.removeEventListener('beforeunload', this._beforeUnload);
        }
        if (this._publicKey) {
            this._publicKey = null;
            this.emit('disconnect');
        }
        this._responsePromises.forEach(([, reject], id) => {
            this._responsePromises.delete(id);
            reject(new Error('Wallet disconnected'));
        });
    }
    sendRequest(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (method !== 'connect' && !this.connected) {
                throw new Error('Wallet not connected');
            }
            const requestId = this._nextRequestId;
            ++this._nextRequestId;
            return new Promise((resolve, reject) => {
                var _a, _b, _c, _d;
                this._responsePromises.set(requestId, [resolve, reject]);
                if (this._injectedProvider) {
                    this._injectedProvider.postMessage({
                        jsonrpc: '2.0',
                        id: requestId,
                        method,
                        params: Object.assign({ network: this._network }, params),
                    });
                }
                else {
                    (_a = this._popup) === null || _a === void 0 ? void 0 : _a.postMessage({
                        jsonrpc: '2.0',
                        id: requestId,
                        method,
                        params,
                    }, (_c = (_b = this._providerUrl) === null || _b === void 0 ? void 0 : _b.origin) !== null && _c !== void 0 ? _c : '');
                    if (!this.autoApprove) {
                        (_d = this._popup) === null || _d === void 0 ? void 0 : _d.focus();
                    }
                }
            });
        });
    }
    get publicKey() {
        return this._publicKey;
    }
    get connected() {
        return this._publicKey !== null;
    }
    get autoApprove() {
        return this._autoApprove;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._popup) {
                this._popup.close();
            }
            yield this.handleConnect();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._injectedProvider) {
                yield this.sendRequest('disconnect', {});
            }
            if (this._popup) {
                this._popup.close();
            }
            this.handleDisconnect();
        });
    }
    sign(data, display) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(data instanceof Uint8Array)) {
                throw new Error('Data must be an instance of Uint8Array');
            }
            const response = (yield this.sendRequest('sign', {
                data,
                display,
            }));
            const signature = bs58.decode(response.signature);
            const publicKey = new PublicKey(response.publicKey);
            return {
                signature,
                publicKey,
            };
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.sendRequest('signTransaction', {
                message: bs58.encode(transaction.serializeMessage()),
            }));
            const signature = bs58.decode(response.signature);
            const publicKey = new PublicKey(response.publicKey);
            transaction.addSignature(publicKey, signature);
            return transaction;
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.sendRequest('signAllTransactions', {
                messages: transactions.map((tx) => bs58.encode(tx.serializeMessage())),
            }));
            const signatures = response.signatures.map((s) => bs58.decode(s));
            const publicKey = new PublicKey(response.publicKey);
            transactions = transactions.map((tx, idx) => {
                tx.addSignature(publicKey, signatures[idx]);
                return tx;
            });
            return transactions;
        });
    }
    diffieHellman(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(publicKey instanceof Uint8Array)) {
                throw new Error('Data must be an instance of Uint8Array');
            }
            const response = (yield this.sendRequest('diffieHellman', {
                publicKey,
            }));
            return response;
        });
    }
}
function isString(a) {
    return typeof a === 'string';
}
function isInjectedProvider(a) {
    return (isObject(a) && 'postMessage' in a && typeof a.postMessage === 'function');
}
function isObject(a) {
    return typeof a === 'object' && a !== null;
}
//# sourceMappingURL=index.js.map