import { Connection, Transaction } from '@solana/web3.js';
import { BaseConfig } from '../../constants';
import BloctoProviderInterface from './blocto.d';

export declare interface SolanaProviderConfig extends BaseConfig {
  net: string | null;
  server?: string;
  rpc?: string;
}

export declare interface SolanaProviderInterface extends BloctoProviderInterface {
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
