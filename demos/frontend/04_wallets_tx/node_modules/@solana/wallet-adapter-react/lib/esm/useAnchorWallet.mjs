import { useMemo } from 'react';
import { useWallet } from './useWallet.mjs';
export function useAnchorWallet() {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    return useMemo(() => publicKey && signTransaction && signAllTransactions
        ? { publicKey, signTransaction, signAllTransactions }
        : undefined, [publicKey, signTransaction, signAllTransactions]);
}
//# sourceMappingURL=useAnchorWallet.js.map