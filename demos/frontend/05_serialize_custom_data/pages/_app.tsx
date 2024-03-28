import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import WalletContextProvider from '../components/WalletContextProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>  
      <WalletContextProvider>
        <Component {...pageProps} />
      </WalletContextProvider>
    </ChakraProvider>
  )
}

export default MyApp
