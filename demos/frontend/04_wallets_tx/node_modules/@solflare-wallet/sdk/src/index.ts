import { Cluster, Transaction } from '@solana/web3.js';
import {
  PromiseCallback,
  SolflareConfig,
  SolflareIframeEvent,
  SolflareIframeMessage
} from './types';
import EventEmitter from 'eventemitter3';
import WalletAdapter from './adapters/base';
import WebAdapter from './adapters/web';
import IframeAdapter from './adapters/iframe';

export default class Solflare extends EventEmitter {
  private _network: Cluster = 'mainnet-beta';
  private _adapterInstance: WalletAdapter | null = null;
  private _element: HTMLElement | null = null;
  private _iframe: HTMLIFrameElement | null = null;
  private _connectHandler: { resolve: PromiseCallback, reject: PromiseCallback } | null = null;

  private _flutterHandlerInterval: any = null;

  private static IFRAME_URL = 'https://connect.solflare.com/';
  private static DETECT_IFRAME_URL = 'https://connect.solflare.com/detect';

  constructor (config?: SolflareConfig) {
    super();

    if (config?.network) {
      this._network = config?.network;
    }
  }

  get publicKey () {
    return this._adapterInstance?.publicKey || null;
  }

  get isConnected () {
    return !!this._adapterInstance?.connected;
  }

  get connected () {
    return this.isConnected;
  }

  get autoApprove () {
    return false;
  }

  async connect () {
    if (this.connected) {
      return;
    }

    this._injectElement();

    await new Promise((resolve, reject) => {
      this._connectHandler = { resolve, reject };
    });
  }

  async disconnect () {
    if (!this._adapterInstance) {
      return;
    }

    await this._adapterInstance.disconnect();

    this._disconnected();

    this.emit('disconnect');
  }

  async signTransaction (transaction: Transaction): Promise<Transaction> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this._adapterInstance!.signTransaction(transaction);
  }

  async signAllTransactions (transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this._adapterInstance!.signAllTransactions(transactions);
  }

  async signMessage (data: Uint8Array, display: 'hex' | 'utf8' = 'utf8'): Promise<Uint8Array> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this._adapterInstance!.signMessage(data, display);
  }

  async sign (data: Uint8Array, display: 'hex' | 'utf8' = 'utf8'): Promise<Uint8Array> {
    return await this.signMessage(data, display);
  }

  async detectWallet (timeout = 10): Promise<boolean> {
    return new Promise((resolve) => {
      let element: HTMLElement | null = null;

      function handleDetected (detected) {
        cleanUp();

        resolve(detected);
      }

      let timeoutHandler: NodeJS.Timeout | null = setTimeout(() => {
        handleDetected(false);
      }, timeout * 1000);

      function cleanUp () {
        window.removeEventListener('message', handleMessage, false);

        if (element) {
          document.body.removeChild(element);
          element = null;
        }

        if (timeoutHandler) {
          clearTimeout(timeoutHandler);
          timeoutHandler = null;
        }
      }

      function handleMessage (event: MessageEvent) {
        if (event.data?.channel !== 'solflareDetectorToAdapter') {
          return;
        }

        handleDetected(!!event.data?.data?.detected);
      }

      window.addEventListener('message', handleMessage, false);

      element = document.createElement('div');
      element.className = 'solflare-wallet-detect-iframe';
      element.innerHTML = `
        <iframe src='${Solflare.DETECT_IFRAME_URL}?timeout=${timeout}' style='position: fixed; top: -9999px; left: -9999px; width: 0; height: 0; pointer-events: none; border: none;'></iframe>
      `;
      document.body.appendChild(element);
    });
  }

  private _handleEvent = (event: SolflareIframeEvent) => {
    switch (event.type) {
      case 'connect_native_web': {
        this._collapseIframe();

        this._adapterInstance = new WebAdapter(this._iframe!, this._network, event.data?.provider || 'https://solflare.com/provider');

        this._adapterInstance.on('connect', this._webConnected);
        this._adapterInstance.on('disconnect', this._webDisconnected);

        this._adapterInstance.connect();

        this._setPreferredAdapter('native_web');

        return;
      }
      case 'connect': {
        this._collapseIframe();

        this._adapterInstance = new IframeAdapter(this._iframe!, event.data?.publicKey || '');
        this._adapterInstance.connect();

        this._setPreferredAdapter(event.data?.adapter);

        if (this._connectHandler) {
          this._connectHandler.resolve();
          this._connectHandler = null;
        }

        this.emit('connect', this.publicKey);

        return;
      }
      case 'disconnect': {
        if (this._connectHandler) {
          this._connectHandler.reject();
          this._connectHandler = null;
        }

        this._disconnected();

        this.emit('disconnect');

        return;
      }
      case 'collapse': {
        this._collapseIframe();
        return;
      }
      default: {
        return;
      }
    }
  }

  private _handleMessage = (event: MessageEvent) => {
    if (event.data?.channel !== 'solflareIframeToWalletAdapter') {
      return;
    }

    const data: SolflareIframeMessage = event.data.data || {};

    if (data.type === 'event') {
      this._handleEvent(data.event!);
    } else if (this._adapterInstance) {
      this._adapterInstance.handleMessage(data);
    }
  }

  private _removeElement = () => {
    if (this._flutterHandlerInterval !== null) {
      clearInterval(this._flutterHandlerInterval);
      this._flutterHandlerInterval = null;
    }


    if (this._element) {
      this._element.remove();
      this._element = null;
    }
  }

  private _removeDanglingElements = () => {
    const elements = document.getElementsByClassName('solflare-wallet-adapter-iframe');
    for (const element of elements) {
      if (element.parentElement) {
        element.remove();
      }
    }
  }

  private _injectElement = () => {
    this._removeElement();
    this._removeDanglingElements();

    let iframeUrl = `${Solflare.IFRAME_URL}?cluster=${encodeURIComponent(this._network)}&origin=${encodeURIComponent(window.location.origin)}`;
    const preferredAdapter = this._getPreferredAdapter();
    if (preferredAdapter) {
      iframeUrl += `&adapter=${encodeURIComponent(preferredAdapter)}`;
    }

    this._element = document.createElement('div');
    this._element.className = 'solflare-wallet-adapter-iframe';
    this._element.innerHTML = `
      <iframe src='${iframeUrl}' style='position: fixed; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; border: none; border-radius: 0; z-index: 99999; color-scheme: auto;' allowtransparency='true'></iframe>
    `;
    document.body.appendChild(this._element);
    this._iframe = this._element.querySelector('iframe');

    // @ts-ignore
    window.fromFlutter = this._handleMobileMessage;
    this._flutterHandlerInterval = setInterval(() => {
      // @ts-ignore
      window.fromFlutter = this._handleMobileMessage;
    }, 100);

    window.addEventListener('message', this._handleMessage, false);
  }

  private _collapseIframe = () => {
    if (this._iframe) {
      this._iframe.style.top = '';
      this._iframe.style.right = '';
      this._iframe.style.height = '2px';
      this._iframe.style.width = '2px';
    }
  }

  private _getPreferredAdapter = () => {
    if (localStorage) {
      return localStorage.getItem('solflarePreferredWalletAdapter') || null;
    }
    return null;
  };

  private _setPreferredAdapter = (adapter: string) => {
    if (localStorage && adapter) {
      localStorage.setItem('solflarePreferredWalletAdapter', adapter);
    }
  };

  private _clearPreferredAdapter = () => {
    if (localStorage) {
      localStorage.removeItem('solflarePreferredWalletAdapter');
    }
  };

  private _webConnected = () => {
    if (this._connectHandler) {
      this._connectHandler.resolve();
      this._connectHandler = null;
    }

    this.emit('connect', this.publicKey);
  };

  private _webDisconnected = () => {
    if (this._connectHandler) {
      this._connectHandler.reject();
      this._connectHandler = null;
    }

    this._disconnected();

    this.emit('disconnect');
  };

  private _disconnected = () => {
    window.removeEventListener('message', this._handleMessage, false);
    this._removeElement();

    this._clearPreferredAdapter();

    this._adapterInstance = null;
  }

  private _handleMobileMessage = (data) => {
    this._iframe?.contentWindow?.postMessage({
      channel: 'solflareMobileToIframe',
      data
    }, '*');
  };
}
