import EthereumProvider from './providers/ethereum';
import SolanaProvider from './providers/solana';
import { BloctoSDKConfig } from './index.d';

// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export default class BloctoSDK {
  ethereum?: EthereumProvider;
  solana?: SolanaProvider;

  constructor({ appId, ethereum, solana }: BloctoSDKConfig) {
    if (ethereum) {
      this.ethereum = new EthereumProvider({ ...ethereum, appId });
    }
    if (solana) {
      this.solana = new SolanaProvider({ ...solana, appId });
    }
  }
}
