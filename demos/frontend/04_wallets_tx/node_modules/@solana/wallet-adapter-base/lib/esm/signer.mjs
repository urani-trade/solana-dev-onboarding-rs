import { BaseWalletAdapter } from './adapter.mjs';
import { WalletError, WalletSendTransactionError } from './errors.mjs';
export class BaseSignerWalletAdapter extends BaseWalletAdapter {
    async sendTransaction(transaction, connection, options = {}) {
        let emit = true;
        try {
            try {
                transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                transaction.recentBlockhash =
                    transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash;
                const { signers, ...sendOptions } = options;
                (signers === null || signers === void 0 ? void 0 : signers.length) && transaction.partialSign(...signers);
                transaction = await this.signTransaction(transaction);
                const rawTransaction = transaction.serialize();
                return await connection.sendRawTransaction(rawTransaction, sendOptions);
            }
            catch (error) {
                // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
                if (error instanceof WalletError) {
                    emit = false;
                    throw error;
                }
                throw new WalletSendTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
        }
        catch (error) {
            if (emit) {
                this.emit('error', error);
            }
            throw error;
        }
    }
}
export class BaseMessageSignerWalletAdapter extends BaseSignerWalletAdapter {
}
//# sourceMappingURL=signer.js.map