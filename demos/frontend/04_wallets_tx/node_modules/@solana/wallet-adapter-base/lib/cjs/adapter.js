"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopePollingDetectionStrategy = exports.BaseWalletAdapter = exports.WalletReadyState = exports.EventEmitter = void 0;
const eventemitter3_1 = __importDefault(require("eventemitter3"));
exports.EventEmitter = eventemitter3_1.default;
/**
 * A wallet's readiness describes a series of states that the wallet can be in,
 * depending on what kind of wallet it is. An installable wallet (eg. a browser
 * extension like Phantom) might be `Installed` if we've found the Phantom API
 * in the global scope, or `NotDetected` otherwise. A loadable, zero-install
 * runtime (eg. Torus Wallet) might simply signal that it's `Loadable`. Use this
 * metadata to personalize the wallet list for each user (eg. to show their
 * installed wallets first).
 */
var WalletReadyState;
(function (WalletReadyState) {
    /**
     * User-installable wallets can typically be detected by scanning for an API
     * that they've injected into the global context. If such an API is present,
     * we consider the wallet to have been installed.
     */
    WalletReadyState["Installed"] = "Installed";
    WalletReadyState["NotDetected"] = "NotDetected";
    /**
     * Loadable wallets are always available to you. Since you can load them at
     * any time, it's meaningless to say that they have been detected.
     */
    WalletReadyState["Loadable"] = "Loadable";
    /**
     * If a wallet is not supported on a given platform (eg. server-rendering, or
     * mobile) then it will stay in the `Unsupported` state.
     */
    WalletReadyState["Unsupported"] = "Unsupported";
})(WalletReadyState = exports.WalletReadyState || (exports.WalletReadyState = {}));
class BaseWalletAdapter extends eventemitter3_1.default {
    get connected() {
        return !!this.publicKey;
    }
}
exports.BaseWalletAdapter = BaseWalletAdapter;
function scopePollingDetectionStrategy(detect) {
    // Early return when server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined')
        return;
    const disposers = [];
    function detectAndDispose() {
        const detected = detect();
        if (detected) {
            for (const dispose of disposers) {
                dispose();
            }
        }
    }
    // Strategy #1: Try detecting every second.
    const interval = 
    // TODO: #334 Replace with idle callback strategy.
    setInterval(detectAndDispose, 1000);
    disposers.push(() => clearInterval(interval));
    // Strategy #2: Detect as soon as the DOM becomes 'ready'/'interactive'.
    if (
    // Implies that `DOMContentLoaded` has not yet fired.
    document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
        disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
    }
    // Strategy #3: Detect after the `window` has fully loaded.
    if (
    // If the `complete` state has been reached, we're too late.
    document.readyState !== 'complete') {
        window.addEventListener('load', detectAndDispose, { once: true });
        disposers.push(() => window.removeEventListener('load', detectAndDispose));
    }
    // Strategy #4: Detect synchronously, now.
    detectAndDispose();
}
exports.scopePollingDetectionStrategy = scopePollingDetectionStrategy;
//# sourceMappingURL=adapter.js.map