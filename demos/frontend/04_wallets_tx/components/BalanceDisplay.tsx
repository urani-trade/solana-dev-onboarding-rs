import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react'

export const BalanceDisplay: FC = () => {
    
    const [balance, setBalance] = useState(0);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (!connection || !publicKey) { return }

        // Ensure the balance updates after the transaction completes
        connection.onAccountChange(
            publicKey, 
            (updatedAccountInfo) => {
                setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL)
            }, 
            'confirmed'
        )

        connection.getAccountInfo(publicKey).then(info => {
            setBalance(info.lamports);
        })
    }, [connection, publicKey])

    return (
        <div>
            <p>{publicKey ? `Balance: ${balance / LAMPORTS_PER_SOL}` : ''}</p>
        </div>
    )
}