var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(provider, _network) {
        var _this = _super.call(this) || this;
        _this._network = _network;
        _this._publicKey = null;
        _this._popup = null;
        _this._handlerAdded = false;
        _this._nextRequestId = 1;
        _this._autoApprove = false;
        _this._responsePromises = new Map();
        _this.handleMessage = function (e) {
            var _a;
            if ((_this._injectedProvider && e.source === window) ||
                (e.origin === ((_a = _this._providerUrl) === null || _a === void 0 ? void 0 : _a.origin) && e.source === _this._popup)) {
                if (e.data.method === 'connected') {
                    var newPublicKey = new PublicKey(e.data.params.publicKey);
                    if (!_this._publicKey || !_this._publicKey.equals(newPublicKey)) {
                        if (_this._publicKey && !_this._publicKey.equals(newPublicKey)) {
                            _this.handleDisconnect();
                        }
                        _this._publicKey = newPublicKey;
                        _this._autoApprove = !!e.data.params.autoApprove;
                        _this.emit('connect', _this._publicKey);
                    }
                }
                else if (e.data.method === 'disconnected') {
                    _this.handleDisconnect();
                }
                else if (e.data.result || e.data.error) {
                    var promises = _this._responsePromises.get(e.data.id);
                    if (promises) {
                        var _b = __read(promises, 2), resolve = _b[0], reject = _b[1];
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
        _this._beforeUnload = function () {
            void _this.disconnect();
        };
        if (isInjectedProvider(provider)) {
            _this._injectedProvider = provider;
        }
        else if (isString(provider)) {
            _this._providerUrl = new URL(provider);
            _this._providerUrl.hash = new URLSearchParams({
                origin: window.location.origin,
                network: _this._network,
            }).toString();
        }
        else {
            throw new Error('provider parameter must be an injected provider or a URL string.');
        }
        return _this;
    }
    Wallet.prototype.handleConnect = function () {
        var _this = this;
        var _a;
        if (!this._handlerAdded) {
            this._handlerAdded = true;
            window.addEventListener('message', this.handleMessage);
            window.addEventListener('beforeunload', this._beforeUnload);
        }
        if (this._injectedProvider) {
            return new Promise(function (resolve) {
                void _this.sendRequest('connect', {});
                resolve();
            });
        }
        else {
            window.name = 'parent';
            this._popup = window.open((_a = this._providerUrl) === null || _a === void 0 ? void 0 : _a.toString(), '_blank', 'location,resizable,width=460,height=675');
            return new Promise(function (resolve) {
                _this.once('connect', resolve);
            });
        }
    };
    Wallet.prototype.handleDisconnect = function () {
        var _this = this;
        if (this._handlerAdded) {
            this._handlerAdded = false;
            window.removeEventListener('message', this.handleMessage);
            window.removeEventListener('beforeunload', this._beforeUnload);
        }
        if (this._publicKey) {
            this._publicKey = null;
            this.emit('disconnect');
        }
        this._responsePromises.forEach(function (_a, id) {
            var _b = __read(_a, 2), reject = _b[1];
            _this._responsePromises.delete(id);
            reject(new Error('Wallet disconnected'));
        });
    };
    Wallet.prototype.sendRequest = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId;
            var _this = this;
            return __generator(this, function (_a) {
                if (method !== 'connect' && !this.connected) {
                    throw new Error('Wallet not connected');
                }
                requestId = this._nextRequestId;
                ++this._nextRequestId;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c, _d;
                        _this._responsePromises.set(requestId, [resolve, reject]);
                        if (_this._injectedProvider) {
                            _this._injectedProvider.postMessage({
                                jsonrpc: '2.0',
                                id: requestId,
                                method: method,
                                params: __assign({ network: _this._network }, params),
                            });
                        }
                        else {
                            (_a = _this._popup) === null || _a === void 0 ? void 0 : _a.postMessage({
                                jsonrpc: '2.0',
                                id: requestId,
                                method: method,
                                params: params,
                            }, (_c = (_b = _this._providerUrl) === null || _b === void 0 ? void 0 : _b.origin) !== null && _c !== void 0 ? _c : '');
                            if (!_this.autoApprove) {
                                (_d = _this._popup) === null || _d === void 0 ? void 0 : _d.focus();
                            }
                        }
                    })];
            });
        });
    };
    Object.defineProperty(Wallet.prototype, "publicKey", {
        get: function () {
            return this._publicKey;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "connected", {
        get: function () {
            return this._publicKey !== null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "autoApprove", {
        get: function () {
            return this._autoApprove;
        },
        enumerable: false,
        configurable: true
    });
    Wallet.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._popup) {
                            this._popup.close();
                        }
                        return [4 /*yield*/, this.handleConnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Wallet.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._injectedProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendRequest('disconnect', {})];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this._popup) {
                            this._popup.close();
                        }
                        this.handleDisconnect();
                        return [2 /*return*/];
                }
            });
        });
    };
    Wallet.prototype.sign = function (data, display) {
        return __awaiter(this, void 0, void 0, function () {
            var response, signature, publicKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(data instanceof Uint8Array)) {
                            throw new Error('Data must be an instance of Uint8Array');
                        }
                        return [4 /*yield*/, this.sendRequest('sign', {
                                data: data,
                                display: display,
                            })];
                    case 1:
                        response = (_a.sent());
                        signature = bs58.decode(response.signature);
                        publicKey = new PublicKey(response.publicKey);
                        return [2 /*return*/, {
                                signature: signature,
                                publicKey: publicKey,
                            }];
                }
            });
        });
    };
    Wallet.prototype.signTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var response, signature, publicKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendRequest('signTransaction', {
                            message: bs58.encode(transaction.serializeMessage()),
                        })];
                    case 1:
                        response = (_a.sent());
                        signature = bs58.decode(response.signature);
                        publicKey = new PublicKey(response.publicKey);
                        transaction.addSignature(publicKey, signature);
                        return [2 /*return*/, transaction];
                }
            });
        });
    };
    Wallet.prototype.signAllTransactions = function (transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var response, signatures, publicKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendRequest('signAllTransactions', {
                            messages: transactions.map(function (tx) { return bs58.encode(tx.serializeMessage()); }),
                        })];
                    case 1:
                        response = (_a.sent());
                        signatures = response.signatures.map(function (s) { return bs58.decode(s); });
                        publicKey = new PublicKey(response.publicKey);
                        transactions = transactions.map(function (tx, idx) {
                            tx.addSignature(publicKey, signatures[idx]);
                            return tx;
                        });
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    Wallet.prototype.diffieHellman = function (publicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(publicKey instanceof Uint8Array)) {
                            throw new Error('Data must be an instance of Uint8Array');
                        }
                        return [4 /*yield*/, this.sendRequest('diffieHellman', {
                                publicKey: publicKey,
                            })];
                    case 1:
                        response = (_a.sent());
                        return [2 /*return*/, response];
                }
            });
        });
    };
    return Wallet;
}(EventEmitter));
export default Wallet;
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