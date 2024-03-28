import { BaseWalletAdapter, WalletAccountError, WalletAdapterNetwork, WalletConfigError, WalletConnectionError, WalletDisconnectionError, WalletLoadError, WalletNotConnectedError, WalletNotReadyError, WalletPublicKeyError, WalletReadyState, WalletSendTransactionError, } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
export const BloctoWalletName = 'Blocto';
export class BloctoWalletAdapter extends BaseWalletAdapter {
    constructor(config = {}) {
        super();
        this.name = BloctoWalletName;
        this.url = 'https://blocto.app';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTE5LjQ4MzggMTUuMjQ5Yy4yNzY5IDAgLjUwNDguMjA5OS41MzI1LjQ3ODhsLjAwMjIuMDQyOS0uMDA0My4xMTQyYy0uMzM1IDMuOTgzMy0zLjc5MDQgNy4xMTUxLTguMDAzNyA3LjExNTEtNC4xNzA2IDAtNy41OTg2My0zLjA2ODctNy45OTI2OS02Ljk5NDZsLS4wMTYzOC0uMTgxMS0uMDAxMDYtLjA1MzIuMDAxNzgtLjAzOThjLjAyNTk4LS4yNzA2LjI1NDg3LS40ODIzLjUzMjg5LS40ODIzeiIgZmlsbD0iI2FmZDhmNyIvPjxwYXRoIGQ9Im00LjMwMDA5IDFjMy43ODc1NSAwIDYuODI1ODEgMi45MDkxMSA2LjgyNTgxIDYuNTAyNzd2Ni4zNTM0M2MtLjAwMDQuMjkxNy0uMjM5Mi41Mjg0LS41MzQuNTI4OGwtNi4wNTc1OC4wMDMyYy0uMjk1MTEuMDAwNy0uNTM0MzItLjIzNjEtLjUzNDMyLS41Mjc4bC4wMDAzNi0xMi41NjM3NWMwLS4xNTE0OS4xMTQyNi0uMjc2MjIuMjYxOTktLjI5NDE4eiIgZmlsbD0iIzE4MmE3MSIvPjxwYXRoIGQ9Im0xOS42OTIxIDEyLjIzODMuMDM4OC4xMjgzLS4wMjg4LS4wODQ2Yy4xNjE2LjQ1MzQuMjY2Ni43NzY5LjMxNTMgMS4zNDEzLjAzMzUuMzg3OS0uMjU3LjcyODktLjY0ODUuNzYybC0uMDMwMy4wMDIyLTMuMDgwOS4wMDA3Yy0yLjEwNjMgMC0zLjgyMDQtMS40NzQxLTMuODc1Mi0zLjU0MjNsLS4wMDE0LS4xMDIxdi0zLjQ2NThjMC0uMjAxNTMuMTY5NC0uMzY5NTkuMzc0MS0uMzYwMDcgMy4zMDAzLjE1NDY2IDUuOTk3OCAyLjM0MTUxIDYuOTM2OSA1LjMyMDM3eiIgZmlsbD0iIzM0ODVjNCIvPjwvZz48L3N2Zz4=';
        this._readyState = typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._network = config.network || WalletAdapterNetwork.Mainnet;
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
            if (this._readyState !== WalletReadyState.Loadable)
                throw new WalletNotReadyError();
            this._connecting = true;
            let BloctoClass;
            try {
                ({ default: BloctoClass } = await import('@blocto/sdk'));
            }
            catch (error) {
                throw new WalletLoadError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            let wallet;
            try {
                wallet = new BloctoClass({ solana: { net: this._network } }).solana;
            }
            catch (error) {
                throw new WalletConfigError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            if (!wallet)
                throw new WalletConfigError();
            if (!wallet.connected) {
                try {
                    await wallet.connect();
                }
                catch (error) {
                    throw new WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            const account = wallet.accounts[0];
            if (!account)
                throw new WalletAccountError();
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
        const wallet = this._wallet;
        if (wallet) {
            this._wallet = null;
            this._publicKey = null;
            try {
                await wallet.disconnect();
            }
            catch (error) {
                this.emit('error', new WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
            }
        }
        this.emit('disconnect');
    }
    async sendTransaction(transaction, connection, options = {}) {
        try {
            const wallet = this._wallet;
            if (!wallet)
                throw new WalletNotConnectedError();
            try {
                transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                transaction.recentBlockhash =
                    transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash;
                const { signers } = options;
                if (signers === null || signers === void 0 ? void 0 : signers.length) {
                    transaction = await wallet.convertToProgramWalletTransaction(transaction);
                    transaction.partialSign(...signers);
                }
                return await wallet.signAndSendTransaction(transaction, connection);
            }
            catch (error) {
                throw new WalletSendTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
//# sourceMappingURL=adapter.js.map