# @solflare-wallet/sdk

## Example

```javascript
import Solflare from '@solflare-wallet/sdk';
import { Transaction } from '@solana/web3.js';

const wallet = new Solflare();

wallet.on('connect', () => console.log('connected', wallet.publicKey.toString()));
wallet.on('disconnect', () => console.log('disconnected'));

try {
  await wallet.connect();

  const transaction = await wallet.signTransaction(new Transaction());

  const transactions = await wallet.signAllTransactions([ new Transaction(), new Transaction() ]);

  const encoder = new TextEncoder();
  const messageBytes = encoder.encode('Test message');
  const messageSignature = await wallet.signMessage(messageBytes, 'utf8');

  await wallet.disconnect();
} catch (err) {
  console.log(err);
}
```

## API

```javascript
class Solflare extends EventEmitter {
  publicKey: PublicKey | null;
  isConnected: boolean;
  connected: boolean; // for SOL Wallet Adapter compatibility
  autoApprove: boolean; // for SOL Wallet Adapter compatibility

  constructor(config: { network?: string });

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(data: Uint8Array, display: 'hex' | 'utf8' = 'utf8'): Promise<Uint8Array>;
  sign(data: Uint8Array, display: 'hex' | 'utf8' = 'utf8'): Promise<Uint8Array>; // for SOL Wallet Adapter compatibility
}
```
