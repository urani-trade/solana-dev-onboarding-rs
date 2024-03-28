"use strict";
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
exports.signTransaction = exports.getPublicKey = exports.getDerivationPath = void 0;
const hw_transport_1 = require("@ledgerhq/hw-transport");
const web3_js_1 = require("@solana/web3.js");
require("./polyfills/index");
function getDerivationPath(account, change) {
    const length = account !== undefined ? (change === undefined ? 3 : 4) : 2;
    const derivationPath = Buffer.alloc(1 + length * 4);
    let offset = derivationPath.writeUInt8(length, 0);
    offset = derivationPath.writeUInt32BE(harden(44), offset); // Using BIP44
    offset = derivationPath.writeUInt32BE(harden(501), offset); // Solana's BIP44 path
    if (account !== undefined) {
        offset = derivationPath.writeUInt32BE(harden(account), offset);
        if (change !== undefined) {
            derivationPath.writeUInt32BE(harden(change), offset);
        }
    }
    return derivationPath;
}
exports.getDerivationPath = getDerivationPath;
const BIP32_HARDENED_BIT = (1 << 31) >>> 0;
function harden(n) {
    return (n | BIP32_HARDENED_BIT) >>> 0;
}
const INS_GET_PUBKEY = 0x05;
const INS_SIGN_MESSAGE = 0x06;
const P1_NON_CONFIRM = 0x00;
const P1_CONFIRM = 0x01;
const P2_EXTEND = 0x01;
const P2_MORE = 0x02;
const MAX_PAYLOAD = 255;
const LEDGER_CLA = 0xe0;
/** @internal */
function getPublicKey(transport, derivationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const bytes = yield send(transport, INS_GET_PUBKEY, P1_NON_CONFIRM, derivationPath);
        return new web3_js_1.PublicKey(bytes);
    });
}
exports.getPublicKey = getPublicKey;
/** @internal */
function signTransaction(transport, transaction, derivationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = Buffer.alloc(1);
        paths.writeUInt8(1, 0);
        const message = transaction.serializeMessage();
        const data = Buffer.concat([paths, derivationPath, message]);
        return yield send(transport, INS_SIGN_MESSAGE, P1_CONFIRM, data);
    });
}
exports.signTransaction = signTransaction;
function send(transport, instruction, p1, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let p2 = 0;
        let offset = 0;
        if (data.length > MAX_PAYLOAD) {
            while (data.length - offset > MAX_PAYLOAD) {
                const buffer = data.slice(offset, offset + MAX_PAYLOAD);
                const response = yield transport.send(LEDGER_CLA, instruction, p1, p2 | P2_MORE, buffer);
                // @ts-ignore
                if (response.length !== 2)
                    throw new hw_transport_1.TransportStatusError(hw_transport_1.StatusCodes.INCORRECT_DATA);
                p2 |= P2_EXTEND;
                offset += MAX_PAYLOAD;
            }
        }
        const buffer = data.slice(offset);
        const response = yield transport.send(LEDGER_CLA, instruction, p1, p2, buffer);
        return response.slice(0, response.length - 2);
    });
}
//# sourceMappingURL=util.js.map