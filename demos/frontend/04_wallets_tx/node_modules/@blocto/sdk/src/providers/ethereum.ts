import invariant from 'invariant';
import BloctoProvider from './blocto';
import Session from '../lib/session.d';
import { EthereumProviderConfig, EthereumProviderInterface } from './types/ethereum.d'; import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  getItemWithExpiry,
  setItemWithExpiry,
} from '../lib/localStorage';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  ETH_CHAIN_ID_RPC_MAPPING,
  ETH_CHAIN_ID_CHAIN_MAPPING,
  ETH_CHAIN_ID_NET_MAPPING,
  ETH_CHAIN_ID_SERVER_MAPPING,
  LOGIN_PERSISTING_TIME,
} from '../constants';

export interface EIP1193RequestPayload {
  id?: number;
  jsonrpc?: string;
  method: string;
  params?: Array<any>;
}

export default class EthereumProvider extends BloctoProvider implements EthereumProviderInterface {
  chainId: string | number;
  networkId: string | number;
  chain: string;
  net: string;
  rpc: string;
  server: string;

  accounts: Array<string> = [];

  constructor({ chainId = '0x1', rpc, server, appId }: EthereumProviderConfig) {
    super();
    invariant(chainId, "'chainId' is required");

    if (typeof chainId === 'number') {
      this.chainId = chainId;
    } else if (chainId.includes('0x')) {
      this.chainId = parseInt(chainId, 16);
    } else {
      this.chainId = parseInt(chainId, 10);
    }

    this.networkId = this.chainId;
    this.chain = ETH_CHAIN_ID_CHAIN_MAPPING[this.chainId];
    this.net = ETH_CHAIN_ID_NET_MAPPING[this.chainId];

    invariant(this.chain, `unsupported 'chainId': ${this.chainId}`);

    this.rpc = rpc || ETH_CHAIN_ID_RPC_MAPPING[this.chainId] || process.env.RPC || '';

    invariant(this.rpc, "'rpc' is required for Ethereum");

    this.server = server || ETH_CHAIN_ID_SERVER_MAPPING[this.chainId] || process.env.SERVER || '';
    this.appId = appId || process.env.APP_ID;
  }

  private tryRetrieveSessionFromStorage(): void {
    // load previous connected state
    const session: Session | null = getItemWithExpiry<Session>(this.sessionKey, {});

    const sessionCode = session && session.code;
    const sessionAccount = session && session.address && session.address[this.chain];
    this.connected = Boolean(sessionCode && sessionAccount);
    this.code = sessionCode || null;
    this.accounts = sessionAccount ? [sessionAccount] : [];
  }

  private checkNetworkMatched() {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto && parseInt(existedSDK.chainId, 16) !== this.chainId) {
      throw new Error('Blocto SDK network mismatched');
    }
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  async send(arg1: any, arg2: any) {
    switch (true) {
      // signature type 1: arg1 - JSON-RPC payload, arg2 - callback;
      case arg2 instanceof Function:
        return this.sendAsync(arg1, arg2);
      // signature type 2: arg1 - JSON-RPC method name, arg2 - params array;
      case typeof arg1 === 'string' && Array.isArray(arg2):
        return this.sendAsync({ method: arg1, params: arg2 });
      // signature type 3: arg1 - JSON-RPC payload(should be synchronous methods)
      default:
        return this.sendAsync(arg1);
    }
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  // web3 v1.x BatchRequest still depends on it so we need to implement anyway ¯\_(ツ)_/¯
  async sendAsync(payload: any, callback?: (argOrError: any, arg?: any) => any) {
    const handleRequest = new Promise((resolve) => {
      // web3 v1.x concat batched JSON-RPC requests to an array, handle it here
      if (Array.isArray(payload)) {
        // collect transactions and send batch with custom method
        const transactions = payload
          .filter(request => request.method === 'eth_sendTransaction')
          .map(request => request.params[0]);

        const idBase = Math.floor(Math.random() * 10000);

        const batchedRequestPayload = {
          method: 'blocto_sendBatchTransaction',
          params: transactions,
        };

        const batchResponsePromise = this.request(batchedRequestPayload);

        const requests = payload.map(({ method, params }, index) => (
          method === 'eth_sendTransaction'
            ? batchResponsePromise
            : this.request({
              id: idBase + index + 1,
              jsonrpc: '2.0',
              method,
              params,
            })));

        // resolve response when all request are executed
        Promise.allSettled(requests).then(responses =>
          resolve(
            responses.map((response, index) => ({
              id: idBase + index + 1,
              jsonrpc: '2.0',
              result: response.status === 'fulfilled' ? response.value : undefined,
              error: response.status !== 'fulfilled' ? response.reason : undefined,
            }))
          )
        );
      } else {
        this.request(payload).then(resolve);
      }
    });

    // execute callback or return promise, depdends on callback arg given or not
    if (callback) {
      handleRequest
        .then(data => callback(null, data))
        .catch(error => callback(error));
    } else {
      return handleRequest;
    }
  }

  async request(payload: EIP1193RequestPayload) {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.request(payload);
    }

    if (!this.connected) {
      await this.enable();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'eth_requestAccounts':
          this.accounts = await this.fetchAccounts();
        // eslint-disable-next-line
        case 'eth_accounts':
          result = this.accounts.length ? this.accounts : await this.fetchAccounts();
          break;
        case 'eth_coinbase': {
          // eslint-disable-next-line
          result = this.accounts[0];
          break;
        }
        case 'eth_chainId': {
          result = this.chainId;
          result = `0x${result.toString(16)}`;
          break;
        }
        case 'net_version': {
          result = this.networkId || this.chainId;
          result = `0x${result.toString(16)}`;
          break;
        }
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
        case 'personal_sign':
        case 'eth_sign': {
          result = await this.handleSign(payload);
          break;
        }
        case 'blocto_sendBatchTransaction':
        case 'eth_sendTransaction':
          result = await this.handleSendTransaction(payload);
          break;
        case 'eth_signTransaction':
        case 'eth_sendRawTransaction':
          result = null;
          break;
        default:
          response = await this.handleReadRequests(payload);
      }
      if (response) return response.result;
      return result;
    } catch (error) {
      console.error(error);
      // this.emit("error", error);
      throw error;
    }
  }

  // eip-1102 alias
  // DEPRECATED API: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md
  async enable() {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      if (parseInt(existedSDK.chainId, 16) !== this.chainId) {
        try {
          await existedSDK.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: `0x${this.chainId.toString(16)}` }],
          });
          this.accounts = [existedSDK.address];
        } catch (e) {
          console.error(e);
        }
      }
      return new Promise(((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.enable().then(resolve).catch(reject), 10))
      );
    }

    this.tryRetrieveSessionFromStorage();

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }

      if (this.connected) {
        return resolve(this.accounts);
      }

      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(`${this.server}/authn?l6n=${location}&chain=${this.chain}`);

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

            this.eventListeners.connect.forEach(listener => listener(this.chainId));
            const address = e.data.address;
            this.accounts = address ? [address[this.chain]] : [];

            setItemWithExpiry(this.sessionKey, {
              code: this.code,
              address,
            }, LOGIN_PERSISTING_TIME);

            resolve(this.accounts);
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

  async fetchAccounts() {
    this.checkNetworkMatched();
    const { accounts } = await fetch(
      `${this.server}/api/${this.chain}/accounts?code=${this.code}`
    ).then(response => responseSessionGuard<{ accounts: [] }>(response, this));
    this.accounts = accounts;
    return accounts;
  }

  async handleReadRequests(payload: EIP1193RequestPayload) {
    this.checkNetworkMatched();
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then(response => response.json());
  }

  async handleSign({ method, params }: EIP1193RequestPayload) {
    const url = `${this.server}/user-signature/${this.chain}`;
    const signFrame = createFrame(url);

    attachFrame(signFrame);

    let message = '';
    if (Array.isArray(params)) {
      if (method === 'eth_sign') {
        message = params[1].slice(2);
      } else if (method === 'personal_sign') {
        message = params[0].slice(2);
      } else if (['eth_signTypedData', 'eth_signTypedData_v3', 'eth_signTypedData_v4'].includes(method)) {
        message = params[1];
      }
    }

    addSelfRemovableHandler('message', (event: Event, removeListener: () => void) => {
      const e = event as MessageEvent;
      if (e.origin === this.server && e.data.type === 'ETH:FRAME:READY') {
        if (signFrame.contentWindow) {
          signFrame.contentWindow.postMessage({
            type: 'ETH:FRAME:READY:RESPONSE',
            method,
            message,
            chain: this.chain,
          }, url);
        }
        removeListener();
      }
    });

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'ETH:FRAME:RESPONSE') {
          if (e.data.status === 'APPROVED') {
            removeEventListener();
            detatchFrame(signFrame);
            resolve(e.data.signature);
          }

          if (e.data.status === 'DECLINED') {
            removeEventListener();
            detatchFrame(signFrame);
            reject();
          }
        }
      })
    );
  }

  async handleSendTransaction(payload: EIP1193RequestPayload) {
    this.checkNetworkMatched();
    const { authorizationId } = await fetch(`${this.server}/api/${this.chain}/authz?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload.params),
    }).then(response => responseSessionGuard<{ authorizationId: string }>(response, this));

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = createFrame(`${this.server}/authz/${this.chain}/${authorizationId}`);

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'ETH:FRAME:RESPONSE') {
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
