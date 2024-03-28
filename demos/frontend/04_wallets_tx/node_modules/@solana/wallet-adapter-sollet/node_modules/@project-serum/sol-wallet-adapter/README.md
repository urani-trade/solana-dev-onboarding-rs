[![npm (scoped)](https://img.shields.io/npm/v/@project-serum/sol-wallet-adapter)](https://www.npmjs.com/package/@project-serum/sol-wallet-adapter)
[![Build Status](https://travis-ci.com/project-serum/sol-wallet-adapter.svg?branch=master)](https://travis-ci.com/project-serum/sol-wallet-adapter)

# sol-wallet-adapter

Library to allow Solana dApps to use third-party wallets to sign transactions.

## Install

```bash
npm install --save @project-serum/sol-wallet-adapter
```

## Usage

### Sign a transaction

```js
import { Connection, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';

let connection = new Connection(clusterApiUrl('devnet'));
let providerUrl = 'https://www.sollet.io';
let wallet = new Wallet(providerUrl);
wallet.on('connect', publicKey => console.log('Connected to ' + publicKey.toBase58()));
wallet.on('disconnect', () => console.log('Disconnected'));
await wallet.connect();

let transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: wallet.publicKey,
    lamports: 100,
  })
);
let { blockhash } = await connection.getRecentBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = wallet.publicKey;
let signed = await wallet.signTransaction(transaction);
let txid = await connection.sendRawTransaction(signed.serialize());
await connection.confirmTransaction(txid);
```

See [example/src/App.js](https://github.com/serum-foundation/sol-wallet-adapter/blob/master/example/src/App.js) for a full example.

### Sign a message

```js
const providerUrl = 'https://www.sollet.io';
const wallet = new Wallet(providerUrl);
wallet.on('connect', publicKey => console.log('Connected to ' + publicKey.toBase58()));
wallet.on('disconnect', () => console.log('Disconnected'));
await wallet.connect();

const message = "Please sign this message for proof of address ownership.";
const data = new TextEncoder().encode(message);
let { signature } = await wallet.sign(data, 'utf8');
```

## Development

Run `yarn start` in the root directory, then run `yarn start` in the example directory.

See [create-react-library](https://github.com/transitive-bullshit/create-react-library#development) for details.

## Wallet Providers

Wallet providers are third-party webapps that provide an API to retrieve the user's accounts and sign transactions with it. `sol-wallet-adapter` opens wallet providers in a popup and communicates with it using [JSON-RPC](https://www.jsonrpc.org/specification) over [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

See [`spl-token-wallet`](https://github.com/serum-foundation/spl-token-wallet/blob/master/src/pages/PopupPage.js) for an example wallet provider implementation.

The general flow is as follows:

1. User selects a wallet provider to connect to, e.g. `https://www.sollet.io`
2. dApp opens the wallet provider in a popup, passing it the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the dApp and the desired network in the URL hash.
    - e.g. `https://www.sollet.io/#origin=https://www.example.com&network=mainnet-beta`
3. Wallet provider detects that `window.opener` is set and asks the user if they want to connect the wallet to the dApp.
    - The wallet UI should show the origin of the requesting dApp.
    - The origin can be retrieved from the URL hash using `new URLSearchParams(window.location.hash.slice(1)).get('origin')`.
    - If the wallet provider supports multiple accounts, it should allow the user to select which account to use.
4. If the user accepts, the wallet provider sends a [`connected`](#connected) message to the dApp via `postMessage`.
    - e.g. ```window.opener.postMessage({jsonrpc: '2.0', method: 'connected', params: {publicKey: 'EdWqEgu54Zezi4E6L72RxAMPr5SWAyt2vpZWgvPYQTLh'}}, 'https://www.example.com')'```
    - To prevent origin spoofing, the `postMessage` call must set `targetOrigin` to the dApp origin that was shown to the user in step 3.
5. When the dApp needs to send a transaction on behalf of the user, the dApp generates a transaction and sends it to the wallet provider as a [`signTransaction`](#signtransaction) request using `postMessage`.
    - The wallet provider should listen for `window.onmessage` events.
    - Before processing a [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent), the wallet provider should verify that `event.origin` matches the dApp `origin` and `event.source === window.opener`.
6. The wallet provider decodes the transaction, presents it to the user, and asks the user if they would like to sign the transaction.
    - The wallet should inform the user about any potential effects of the transaction
    - For instructions that the wallet recognizes, the wallet can decode the instruction and show it to the user.
    - For instructions that the wallet does not recognize, the wallet can e.g. show the set of writable addresses included in the instruction and the programs to which those addresses belong.
    - The wallet should use the transaction blockhash to verify that the transaction will be broadcasted on the correct network.
7. The wallet sends a JSON-RPC reply back to the dApp, either with a signature if the user accepted the request or an error if the user rejected the request.
8. The dApp receives the signature, adds it to the transaction, and broadcasts it.

Wallet provider developers can use the [example webapp](https://github.com/serum-foundation/sol-wallet-adapter/tree/master/example) to test their implementation.

### URL hash parameters

- `origin` - origin of the dApp. Should be included in all `postMessage` calls and should be checked against all received `MessageEvent`s.
- `network` - The network on which transactions will be sent. Can be any of `mainnet-beta`, `devnet`, `testnet`, or a custom URL, though wallets are free to reject any unsupported networks. Wallet providers should check that transaction blockhashes matches the network before signing the transaction.

The parameters can be parsed using

```js
let params = new URLSearchParams(window.location.hash.slice(1));
let origin = params.get('origin');
let network = params.get('network');
```

### Requests from the wallet provider to the dApp (`sol-wallet-adapter`)

#### connected

Sent by the wallet provider when the user selects an account to connect to the dApp.

##### Parameters

- `publicKey` - Base-58 encoded public key of the selected account.

##### Example

```js
window.opener.postMessage({
  jsonrpc: '2.0',
  method: 'connected',
  params: {
    publicKey: 'HsQhg1k93vEA326SXxnGj1sZrdupG7rj5T6g5cMgk1ed',
  },
}, origin);
```

#### disconnected

Sent by the wallet provider when the user no longer wishes to connect to the dApp, or if the user closes the popup (`onbeforeunload`).


##### Parameters

None.

##### Example

```js
window.opener.postMessage({
  jsonrpc: '2.0',
  method: 'disconnected',
}, origin);
```

### Requests from the dApp (`sol-wallet-adapter`) to the wallet provider

#### signTransaction

Sent by the dApp when it needs to send a transaction on behalf of the user.

##### Parameters

- `message` - Base-58 encoded transaction message for the wallet to sign. Generated by [`transaction.serializeMessage()`](https://solana-labs.github.io/solana-web3.js/class/src/transaction.js~Transaction.html#instance-method-serializeMessage).

##### Results

- `signature` - Base-58 encoded transaction signature, i.e. `bs58.encode(nacl.sign.detached(message, account.secretKey))`.
- `publicKey` - Base-58 encoded public key of the account that provided the signature.

##### Example

```js
let request = {
  jsonrpc: '2.0',
  method: 'signTransaction',
  params: {
    message: "QwE1mEmQpjGKTQz9U3N8xTJCqCry9kgvJff51kVv8h5AyVGh3L…NfV68ERMb2WsVAstN',
  },
  id: 1,
};

let response = {
  jsonrpc: '2.0',
  result: {
    signature: "2HT61qv1xxWUpx7DXZM3K878wU1JJx5eKNWw64cgeauwx6sZNKtDkSRrGvqZmsRwz6c1RwkUFnPj1LXkjNtsCd9o",
    publicKey: 'HsQhg1k93vEA326SXxnGj1sZrdupG7rj5T6g5cMgk1ed'
  },
  id: 1,
};
```
