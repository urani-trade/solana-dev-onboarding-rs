import { BaseSignerWalletAdapter, scopePollingDetectionStrategy, WalletAccountError, WalletNotConnectedError, WalletNotReadyError, WalletPublicKeyError, WalletReadyState, WalletSignTransactionError, } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
export const SafePalWalletName = 'SafePal';
export class SafePalWalletAdapter extends BaseSignerWalletAdapter {
    constructor(config = {}) {
        super();
        this.name = SafePalWalletName;
        this.url = 'https://safepal.io';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJtMjU2IDEyOGMwIDcwLjY5Mzg3My01Ny4zMDc5MzMgMTI4LTEyOCAxMjgtNzAuNjkyMDY2NyAwLTEyOC01Ny4zMDYxMjctMTI4LTEyOCAwLTcwLjY5MjA2NjcgNTcuMzA3OTMzMy0xMjggMTI4LTEyOCA3MC42OTIwNjcgMCAxMjggNTcuMzA3OTMzMyAxMjggMTI4IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0ibTIwMC45OTE0OTkgMTQxLjM4NDM3OXYxMS45MzQ0MDRjMCAzMi40OTcwNzgtNDYuMjA1ODI2IDUxLjQ3NTM0Ni02MS45MzUzOTggNTYuOTg2NTMybC02LjI4OTM3MSAyLjE3NDY4NXYtMjAuNjI5NDAxbDIuNjIxOTE2LS45ODkyOGMyMi43MTQ3NDUtOC41NDg4MzYgNDUuNjMyMjgyLTIzLjI5NTQ2NSA0Ni4wODgzNjEtMzcuMTIzNzg0bC4wMDY5MjItLjQxODc1MnYtMTEuOTM0NDA0em0tNzIuODY1MTcyLTk3Ljg2NDM3OSAxOS42NjExMzUgNi4wNjMzODIydjIxLjA0ODA2N2wtMTkuNjYxMTM1LTYuMDg0Mzk2My0xLjI4NjcxMS4zOTkyNjgzdjQ3LjM1NDUxMzhoMjAuOTQ3ODQ2djE5LjUxMDgwM2gtMjAuOTQ3ODQ2djgwLjM4MDYzbC02LjM2Mjg5Mi0yLjM3NTQ2N2MtMi40NDg2MzUtLjkyODUwMi01Ljk3MzE2Ny0yLjMzOTg4Ni0xMC4yMTU4NzUtNC4yNDkxNDJsLS41NTc0NC0uMjUxODU4LTIuMzc0NTk2LTEuMDg0NjUydi0xNTQuMjkzNzU5N3ptLTI2Ljk2OTIgOC40MDA0NzU4djIwLjk1MTA3ODhsLTI2LjY0MTA1NTggOC4yNjk4NjQ5djMxLjE1OTA5MjVoMjYuNjQxMDU1OHY5MC4yNDI3MThsLTUuOTAwMTE4Mi0zLjAzNDExNWMtMTguMTc2Mjc3My05LjM1NTM5LTM5LjgxMTA4ODItMjUuMDcwMTczLTQwLjI0MTk2NjgtNDYuOTcwMjQ4bC0uMDA2NTQxMS0uNjY1NTMydi0xMC40ODkyOGgxOS41MDc1NzAzdjEwLjQ4OTI4YzAgNC40NjY3MzcgMi4yNTgyODY3IDkuMTU1OCA2LjcxODY5NjMgMTMuOTgyOTQ0bC40MTE1NTY2LjQzOTIwOXYtMzQuNDg0MTczaC0yNi42Mzc4MjMydi02NS42NDY0OTh6bTUyLjU1MjYtLjQ5OTE2NjIgNDcuMjgxNzcyIDE0LjYzMzkxMDZ2NjUuNzU2NDE3OGgtMjcuNzU4MDM3djI4LjQ3NTc1MWwtLjI4NTQ4OS4zNTQyMDZjLTEuMzU1MjUgMS42MzQ0NTUtNy41NjM1NzUgOC42MjI2NTUtMTkuMjIwNDY1IDE0LjU5NDkxNnptMTkuNTIzNzM1IDI3LjA3NzUwMzN2MzMuODAyMDIyMWg4LjI1MDQ2N3YtMzEuMjU0NDY0eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=';
        this._readyState = typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                var _a;
                if ((_a = window.safepal) === null || _a === void 0 ? void 0 : _a.isSafePalWallet) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
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
    async connect() {
        try {
            if (this.connected || this.connecting)
                return;
            if (this._readyState !== WalletReadyState.Installed)
                throw new WalletNotReadyError();
            this._connecting = true;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.safepal;
            let account;
            try {
                account = await wallet.getAccount();
            }
            catch (error) {
                throw new WalletAccountError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            let publicKey;
            try {
                publicKey = new PublicKey(account);
            }
            catch (error) {
                throw new WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
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
    }
    async disconnect() {
        if (this._wallet) {
            this._wallet = null;
            this._publicKey = null;
        }
        this.emit('disconnect');
    }
    async signTransaction(transaction) {
        try {
            const wallet = this._wallet;
            if (!wallet)
                throw new WalletNotConnectedError();
            try {
                return wallet.signTransaction(transaction);
            }
            catch (error) {
                throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    async signAllTransactions(transactions) {
        try {
            const wallet = this._wallet;
            if (!wallet)
                throw new WalletNotConnectedError();
            try {
                return wallet.signAllTransactions(transactions);
            }
            catch (error) {
                throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
//# sourceMappingURL=adapter.js.map