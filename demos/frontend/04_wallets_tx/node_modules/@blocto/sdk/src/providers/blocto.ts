// The root class for all providers

import { EIP1193Provider } from 'eip1193-provider';

import { EIP1193_EVENTS } from '../constants';
import { KEY_SESSION } from '../lib/localStorage/constants';

class BloctoProvider implements EIP1193Provider {
  isBlocto = true;

  isConnecting = false;
  connected = false;
  appId?: string;

  eventListeners: { [key: string]: Array<(arg?: any) => void> } = {};

  code: string | null = null;
  sessionKey = KEY_SESSION;

  constructor() {
    // init event listeners
    EIP1193_EVENTS.forEach((event) => {
      this.eventListeners[event] = [];
    });
  }

  // implement by children
  // eslint-disable-next-line
  async request(payload: any) {}

  on(event: string, listener: (arg: any) => void): void {
    if (!EIP1193_EVENTS.includes(event)) return;

    this.eventListeners[event].push(listener);
  }

  // @todo: implement it
  // eslint-disable-next-line
  once() {}

  removeListener(event: string, listener: (arg: any) => void): void {
    const listeners = this.eventListeners[event];
    const index = listeners.findIndex(item => item === listener);
    if (index !== -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  // alias removeListener
  off = removeEventListener;
}

export default BloctoProvider;
