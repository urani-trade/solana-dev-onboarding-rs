import { MessageHandlers, SolflareIframeMessage, SolflareIframeRequest } from '../types';
import { PublicKey, Transaction } from '@solana/web3.js';
import WalletAdapter from './base';
import { v4 as uuidv4 } from 'uuid';
import bs58 from 'bs58';

export default class IframeAdapter extends WalletAdapter {
  private _iframe: HTMLIFrameElement;
  private _publicKey: PublicKey | null = null;
  private _messageHandlers: MessageHandlers = {};

  get publicKey () {
    return this._publicKey || null;
  }

  get connected () {
    return true;
  }

  constructor (iframe: HTMLIFrameElement, publicKey: any) {
    super();
    this._iframe = iframe;
    this._publicKey = new PublicKey(publicKey?.toString?.());
  }

  async connect () {
    // nothing to do here, the iframe already told us we're connected
  }

  async disconnect () {
    await this._sendMessage({
      method: 'disconnect'
    });
  }

  async signTransaction (transaction: Transaction): Promise<Transaction> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const { publicKey, signature } = await this._sendMessage({
        method: 'signTransaction',
        params: {
          message: bs58.encode(transaction.serializeMessage())
        }
      }) as { publicKey: string, signature: string };

      transaction.addSignature(new PublicKey(publicKey), bs58.decode(signature));

      return transaction;
    } catch (e) {
      console.log(e);
      throw new Error('Failed to sign transaction');
    }
  }

  async signAllTransactions (transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const { publicKey, signatures } = await this._sendMessage({
        method: 'signAllTransactions',
        params: {
          messages: transactions.map((transaction) => bs58.encode(transaction.serializeMessage()))
        }
      }) as { publicKey: string, signatures: string[] };

      return transactions.map((tx, id) => {
        tx.addSignature(new PublicKey(publicKey), bs58.decode(signatures[id]));
        return tx;
      });
    } catch (e) {
      console.log(e);
      throw new Error('Failed to sign transactions');
    }
  }

  async signMessage (data: Uint8Array, display: 'hex' | 'utf8' = 'hex'): Promise<Uint8Array> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await this._sendMessage({
        method: 'signMessage',
        params: {
          data,
          display
        }
      });

      return Uint8Array.from(bs58.decode(result as string));
    } catch (e) {
      console.log(e);
      throw new Error('Failed to sign message');
    }
  }

  handleMessage = (data: SolflareIframeMessage) => {
    if (this._messageHandlers[data.id]) {
      const { resolve, reject } = this._messageHandlers[data.id];

      delete this._messageHandlers[data.id];

      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    }
  };

  private _sendMessage = (data: SolflareIframeRequest) => {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      const messageId = uuidv4();

      this._messageHandlers[messageId] = { resolve, reject };

      this._iframe?.contentWindow?.postMessage({
        channel: 'solflareWalletAdapterToIframe',
        data: { id: messageId, ...data }
      }, '*');
    });
  };
}
