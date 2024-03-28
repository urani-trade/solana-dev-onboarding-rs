# 🛹 Master Solana Frontend

<br>

### tl; dr

<br>


<br>

----


### Interacting with Wallets 

<br>

* A wallet refers to software or hardware that stores a secret key in order to keep it secure and handle secure transaction signing.

* Solana's [@solana/wallet-adapter-base and @solana/wallet-adapter-react.-Adapter](https://github.com/anza-xyz/wallet-adapter) are libraries used to simplify the process of supporting wallet browser extensions.

* `@solana/wallet-adapter-react` allows us to persist and access wallet connection states through hooks and context providers:
    - `useWallet`
    - `WalletProvider`
    - `useConnection`
    - `ConnectionProvider`

* Any use of `useWallet` and `useConnection` should be wrapped in `WalletProvider` and `ConnectionProvider`.

* `@solana/wallet-adapter-react-ui` allow the creation of custom components for, such as:
    - `WalletModalProvider`
    - `WalletMultiButton`
    - `WalletConnectButton`
    - `WalletModal`
    - `WalletModalButton`
    - `WalletDisconnectButton`
    - `WalletIcon`



<br>

----

### Demos

<br>


#### Introduction to [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)


* [Demo 1: Interacting with the Blockchain](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/01_connecting_to_the_blockchain)

* [Demo 2: Non-native Programs](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/02_non_native_programs)


<br>

#### Introduction to [@solana/wallet-adapter](https://github.com/anza-xyz/wallet-adapter)


* [Demo 3: Interacting with Wallets](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/03_wallets_ping)

* [Demo 4: Sending Transactions with Wallets](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/04_wallets_tx)

<br>

