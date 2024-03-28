# 🛹 Demo 4: Send Transactions with a Wallet


<br>

### tl; dr

<br>

* In this demo, we will use [@solana/wallet-adapter-base and @solana/wallet-adapter-react.-Adapter](https://github.com/anza-xyz/wallet-adapter) to send transactions to another account.


<br>

---

### Setup

<br>

* Run `npm install` from the root of the project.
* Install [Phantom Wallet](https://phantom.app/).
* Create two test accounts, and airdrop some SOL to the first account.


<br>

---

### Pages: `index.tsx`

<br>

* Create the index page:

<br>

```typescript
import { NextPage } from 'next'
import { AppBar } from '../components/AppBar'
import { BalanceDisplay } from '../components/BalanceDisplay'
import { SendSolForm } from '../components/SendSolForm'
import styles from '../styles/Home.module.css'
import WalletContextProvider from '../components/WalletContextProvider'
import Head from 'next/head'

const Home: NextPage = (props) => {

  return (
    <div className={styles.App}>
      <Head>
        <title>Demo 4: Send Tx with Wallet</title>
        <meta
          name="description"
          content="Demo 4: Send Tx with Wallet"
        />
      </Head>
      <WalletContextProvider>
        <AppBar />
        <div className={styles.AppBody}>
          <BalanceDisplay />
          <SendSolForm />
        </div>
      </WalletContextProvider >
    </div>
  );
}

export default Home;
```

<br>


---

### Components: `AppBar.tsx`

<br>

* Create a bar in the top, with a button to connect to a wallet:

<br>

```typescript
import { FC } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <Image src="/solanaLogo.png" height={30} width={200} />
            <span>Demo 4: Send Transactions</span>
            <WalletMultiButton />
        </div>
    )
}
```

<br>

---

### Components: `WalletContextProvider.tsx`

<br>

* This creates the wallet modal:

<br>

```typescript
import { FC, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl} from '@solana/web3.js'
require('@solana/wallet-adapter-react-ui/styles.css')

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const wallets = [new PhantomWalletAdapter()]
    const endpoint = clusterApiUrl('devnet')

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    { children }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider
```

<br>

---

### Components: `SendSolForm.tsx`

<br>

* This creates the form to send SOL:

<br>

```typescript
import { FC, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL 
} from '@solana/web3.js'
import styles from '../styles/Home.module.css'


export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const link = () => {
        return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : ''
    }

    const sendSol = event => {
        event.preventDefault()
        if (!connection || !publicKey) { return }
        
        const transaction = new Transaction()
        const recipientPubKey = new PublicKey(event.target.recipient.value)

        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: LAMPORTS_PER_SOL * event.target.amount.value
        })

        transaction.add(sendSolInstruction)
        sendTransaction(transaction, connection).then(sig => {
            setTxSig(sig)
        })
    }

    return (
        <div>
            {
                publicKey ?
                    <form onSubmit={sendSol} className={styles.form}>
                        <label htmlFor="amount">Amount (SOL) to send:</label>
                        <input id="amount" type="text" className={styles.formField} placeholder="e.g. 0.1" required />
                        <br />
                        <label htmlFor="recipient">Send SOL to:</label>
                        <input id="recipient" type="text" className={styles.formField} placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA" required />
                        <button type="submit" className={styles.formButton}>Send</button>
                    </form> :
                    <span>Connect Your Wallet</span>
            }
            {
                txSig ?
                    <div>
                        <p>View your transaction on </p>
                        <a href={link()}>Solana Explorer</a>
                    </div> :
                    null
            }
        </div>
    )
}
```

<br>

---


---

### Components: `BalanceDisplay.tsx`

<br>

* Shows the balance for the account:

<br>

```typescript
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
```

<br>

---


### Running

<br>

* Change the settings of your Phantom wallet to "devnet" and then run:

<br>

```
npm install
npm run dev
```

<br>

* Open your browser at `localhost:3000` and send SOL between the accounts.

* Check the transaction at the [Solana Explorer](https://explorer.solana.com/?cluster=devnet).