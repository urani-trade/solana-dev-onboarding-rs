import invariant from 'invariant';
import { Buffer } from 'buffer';
// @todo: in the long run we want to remove the dependency of solana web3
import { Transaction, Message, TransactionSignature, TransactionInstruction, PublicKey, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import BloctoProvider from './blocto';
import { SolanaProviderConfig, SolanaProviderInterface } from './types/solana.d';
import Session from '../lib/session.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  getItemWithExpiry,
  setItemWithExpiry,
} from '../lib/localStorage';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  SOL_NET_SERVER_MAPPING,
  SOL_NET,
  LOGIN_PERSISTING_TIME,
} from '../constants';

export interface SolanaRequest {
  method: string;
  params?: any;
}
export default class SolanaProvider extends BloctoProvider implements SolanaProviderInterface {
  net: string;
  rpc: string;
  server: string;
  accounts: Array<string> = [];

  constructor({ net = 'mainnet-beta', server, appId, rpc }: SolanaProviderConfig) {
    super();

    invariant(net, "'net' is required");
    invariant(SOL_NET.includes(net), 'unsupported net');
    this.net = net;

    this.rpc = rpc ||
      (net === 'mainnet-beta' ? 'https://free.rpcpool.com' : `https://api.${net}.solana.com`);

    this.server = server || SOL_NET_SERVER_MAPPING[this.net] || process.env.SERVER || '';
    this.appId = appId || process.env.APP_ID;
  }

  private tryRetrieveSessionFromStorage() {
    const session: Session | null = getItemWithExpiry<Session>(this.sessionKey, {});
    const sessionCode = session && session.code;
    const sessionAccount = session && session.address && session.address.solana;
    this.connected = Boolean(sessionCode && sessionAccount);
    this.code = sessionCode || null;
    this.accounts = sessionAccount ? [sessionAccount] : [];
  }

  async request(payload: SolanaRequest) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'connect':
          result = await this.fetchAccounts();
          break;
        case 'disconnect':
          this.disconnect();
          break;
        case 'getAccounts':
          result = this.accounts.length ? this.accounts : await this.fetchAccounts();
          break;
        // custom JSON-RPC method
        case 'convertToProgramWalletTransaction':
          result = await this.handleConvertTransaction(payload);
          break;
        // custom JSON-RPC method
        case 'signAndSendTransaction':
          result = await this.handleSignAndSendTransaction(payload);
          break;
        // block user from using traditional methods
        case 'signTransaction':
        case 'signAllTransactions':
          throw new Error(`Blocto is program wallet, which doesn't support ${payload.method}. Use signAndSendTransaction instead.`);
        default:
          response = await this.handleReadRequests(payload);
      }
      if (response) return response.result;
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      return new Promise((resolve) => {
        existedSDK.once('connect', (pubkey: PublicKey) => {
          this.accounts = [pubkey.toBase58()];
          resolve();
        });
        existedSDK.connect();
      });
    }

    this.tryRetrieveSessionFromStorage();

    return new Promise((resolve: () => void, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }

      if (this.connected) {
        return resolve();
      }

      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(`${this.server}/authn?l6n=${location}&chain=solana`);

      attachFrame(loginFrame);

      addSelfRemovableHandler('message', (event: Event, removeListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server) {
          // @todo: try with another more general event types
          if (e.data.type === 'FCL::CHALLENGE::RESPONSE') {
            removeListener();
            detatchFrame(loginFrame);

            this.code = e.data.code;
            this.connected = true;

            this.eventListeners.connect.forEach(listener => listener(this.net));
            const address = e.data.address;
            this.accounts = address ? [address.solana] : [];

            setItemWithExpiry(this.sessionKey, {
              code: this.code,
              address,
            }, LOGIN_PERSISTING_TIME);

            resolve();
          }

          if (e.data.type === 'FCL::CHALLENGE::CANCEL') {
            removeListener();
            detatchFrame(loginFrame);
            reject();
          }
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      await existedSDK.dicconnect();
      return;
    }
    this.code = null;
    this.accounts = [];
    this.eventListeners.disconnect.forEach(listener => listener());
  }

  async fetchAccounts(): Promise<string[]> {
    const { accounts } = await fetch(
      `${this.server}/api/solana/accounts?code=${this.code}`
    ).then(response => response.json());
    this.accounts = accounts;
    return accounts;
  }

  async handleReadRequests(payload: SolanaRequest): Promise<any> {
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then(response => response.json());
  }

  // solana web3 utility
  async convertToProgramWalletTransaction(transaction: Transaction): Promise<Transaction> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.convertToProgramWalletTransaction(transaction);
    }
    const message = await this.request({
      method: 'convertToProgramWalletTransaction',
      params: {
        message: transaction.serializeMessage().toString('hex'),
      },
    });
    return this.toTransaction(message, []);
  }

  // solana web3 utility
  async signAndSendTransaction(transaction: Transaction, connection?: Connection): Promise<string> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.signAndSendTransaction(transaction);
    }
    const extra: any = {};
    if (connection) {
      if (connection.commitment) extra.commitment = connection.commitment;
      // if the connection object passed-in has different rpc endpoint, reconnect to it
      // eslint-disable-next-line
      const rpc = connection ? (connection as any)._rpcEndpoint : null;
      if (rpc && rpc !== this.rpc) {
        this.rpc = rpc;
        this.disconnect();
        await this.connect();
      }
    }

    return this.request({
      method: 'signAndSendTransaction',
      params: {
        signatures: await this.collectSignatures(transaction),
        message: transaction.serializeMessage().toString('hex'),
        ...extra,
      },
    });
  }

  // solana web3 utility
  // eslint-disable-next-line
  toTransaction(raw: string, signatures: TransactionSignature[]) {
    const message = Message.from(Buffer.from(raw, 'hex'));
    const transaction = new Transaction();
    transaction.recentBlockhash = message.recentBlockhash;
    if (message.header.numRequiredSignatures > 0) {
      transaction.feePayer = message.accountKeys[0];
    }
    signatures.forEach((signature, index) => {
      const sigPubkeyPair = {
        signature:
          signature === PublicKey.default.toBase58()
            ? null
            : bs58.decode(signature),
        publicKey: message.accountKeys[index],
      };
      transaction.signatures.push(sigPubkeyPair);
    });
    message.instructions.forEach((instruction) => {
      const keys = instruction.accounts.map((account) => {
        const pubkey = message.accountKeys[account];
        return {
          pubkey,
          isSigner: account < message.header.numRequiredSignatures,
          isWritable: message.isAccountWritable(account),
        };
      });
      transaction.instructions.push(
        new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: bs58.decode(instruction.data),
        }),
      );
    });
    return transaction;
  }

  // solana web3 utility
  // eslint-disable-next-line
  async collectSignatures(transaction: Transaction) {
    return transaction.signatures.reduce((acc, cur) => {
      if (cur.signature) {
        acc[cur.publicKey.toBase58()] = cur.signature.toString('hex');
      }
      return acc;
    }, {} as { [key: string]: string });
  }

  async handleConvertTransaction(payload: SolanaRequest) {
    return fetch(`${this.server}/api/solana/convertToWalletTx?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.code,
        ...payload.params,
      }),
    }).then(response => responseSessionGuard(response, this));
  }

  async handleSignAndSendTransaction(payload: SolanaRequest): Promise<string> {
    const { authorizationId } = await fetch(`${this.server}/api/solana/authz?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.code,
        ...payload.params,
      }),
    }).then(response => responseSessionGuard<{ authorizationId: string }>(response, this));

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = createFrame(`${this.server}/authz/solana/${authorizationId}`);

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'SOL:FRAME:RESPONSE') {
          if (e.data.status === 'APPROVED') {
            removeEventListener();
            detatchFrame(authzFrame);
            resolve(e.data.txHash);
          }

          if (e.data.status === 'DECLINED') {
            removeEventListener();
            detatchFrame(authzFrame);
            reject();
          }
        }
      })
    );
  }
}
