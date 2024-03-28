/// <reference types="typescript" />
import { EIP1193Provider } from 'eip1193-provider';
import { Transaction, Connection } from '@solana/web3.js';

interface BaseConfig {
  appId?: string;
}

declare interface BloctoProviderInterface extends EIP1193Provider {
  isBlocto: boolean;
  isConnecting: boolean;
  connected: boolean;
  appId?: string;
  eventListeners: {
    [key: string]: Array<(arg?: any) => void>
  };
  code: string | null;
  sessionKey: string;
}

declare interface EthereumProviderConfig extends BaseConfig {
  chainId: string | number | null;
  rpc?: string;
  server?: string;
}

declare interface EthereumProviderInterface extends BloctoProviderInterface {
  chainId: string | number;
  networkId: string | number;
  chain: string;
  net: string;
  rpc: string;
  server: string;
  accounts: Array<string>;
}

declare interface SolanaProviderConfig extends BaseConfig {
  net: string | null;
  server?: string;
  rpc?: string;
}

declare interface SolanaProviderInterface extends BloctoProviderInterface {
  net: string;
  rpc: string;
  server: string;
  accounts: Array<string>;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request(params: { method: string }): Promise<any>;

  signAndSendTransaction(transaction: Transaction, connection?: Connection): Promise<string>;
  convertToProgramWalletTransaction(transaction: Transaction): Promise<Transaction>;
}

// eslint-disable-next-line spaced-comment

declare interface BloctoSDKConfig extends BaseConfig {
  ethereum?: Omit<EthereumProviderConfig, 'appId'>;
  solana?: Omit<SolanaProviderConfig, 'appId'>;
}
declare class BloctoSDK {
  ethereum?: EthereumProviderInterface;
  solana?: SolanaProviderInterface;
  constructor(config: BloctoSDKConfig);
}

export default BloctoSDK;
export { BaseConfig, BloctoSDKConfig, EthereumProviderConfig, EthereumProviderInterface, SolanaProviderConfig, SolanaProviderInterface };
