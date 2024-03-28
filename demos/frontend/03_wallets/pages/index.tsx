import { NextPage } from 'next'
import Head from 'next/head'
import { AppBar } from '../components/AppBar'
import { PingButton } from '../components/PingButton'
import styles from '../styles/Home.module.css'
import WalletContextProvider from '../components/WalletContextProvider'


const Home: NextPage = (props) => {

  return (
    <div className={styles.App}>
      <Head>
        <title>Demo 3: Wallet</title>
        <meta
          name="description"
          content="Demo 3: Wallets"
        />
      </Head>
      <WalletContextProvider>
        <AppBar />
        <div className={styles.AppBody}>
          <PingButton />
        </div>
      </WalletContextProvider >
    </div>
  );
}

export default Home;