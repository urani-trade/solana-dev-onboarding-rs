# 🛹 Master Solana Frontend

<br>


## 🛹 Introduction to [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)


### Demos

<br>


* [Demo 1: Interacting with the Blockchain](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/01_connecting_to_the_blockchain)

* [Demo 2: Non-native Programs](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/02_non_native_programs)

<br>


---


## 🛹 Interacting with Wallets 

<br>

* A wallet is a software or hardware that stores a secret key to keep it secure and handle secure transaction signing.

* Solana's [@solana/wallet-adapter-base and @solana/wallet-adapter-react.-Adapter](https://github.com/anza-xyz/wallet-adapter) are libraries used to simplify the process of supporting wallet browser extensions.

* `@solana/wallet-adapter-react` allows us to persist and access wallet connection states through hooks and context providers:
    - `useWallet`
    - `WalletProvider`
    - `useConnection`
    - `ConnectionProvider`

* Any use of `useWallet` and `useConnection` should be wrapped in `WalletProvider` and `ConnectionProvider`.

* `@solana/wallet-adapter-react-ui` allows the creation of custom components for, such as:
    - `WalletModalProvider`
    - `WalletMultiButton`
    - `WalletConnectButton`
    - `WalletModal`
    - `WalletModalButton`
    - `WalletDisconnectButton`
    - `WalletIcon`



<br>

---

### Demos

<br>



* [Demo 3: Interacting with Wallets](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/03_wallets_ping)

* [Demo 4: Sending Transactions with Wallets](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/04_wallets_tx)


<br>

---

## 🛹 Serializing Data

<br>

* Instruction data must be serialized into a byte buffer to send to clients. 

* Every transaction contains:
    - an array with every account it intends to read or write
    - one or more instructions
    - a recent blockhash
    - one or more signatures

* Every instruction contains:
    - the program ID (public key) of the intended program
    - an array listing every account that will be read from or written to during execution
    - a byte buffer of instruction data

* [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) simplifies this process, so developers can focus on adding instructions and signatures. 
    - The library builds the array of accounts based on that information and handles the logic for including a recent blockhash.


* To facilitate this process of serialization, we can use [Binary Object Representation Serializer for Hashin (Borsh)](https://borsh.io/) and the library [@coral-xyz/borsh](https://github.com/coral-xyz).
    - Borsh can be used in security-critical projects as it prioritizes consistency, safety, speed; and comes with a strict specification.


<br>


---

### Frontend demos

<br>

* [Demo 5: Serializing Custom Data with PDA](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/05_serialize_custom_data)

* [Demo 6: Serializing Custom Data with PDA II](https://github.com/urani-labs/solana-dev-onboarding-rs/tree/main/demos/frontend/06_serialize_custom_data_II)