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