type Mapping = Record<number | string, string>

export interface BaseConfig {
  appId?: string;
}

/* eth series constants begin */

export const ETH_CHAIN_ID_RPC_MAPPING: Mapping = {
  // BSC mainnet
  56: 'https://bsc-dataseed1.binance.org',
  // BSC testnet
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',

  // Polygon Mainnet
  137: 'https://rpc-mainnet.maticvigil.com/',
  // Polygon Testnet
  80001: 'https://rpc-mumbai.matic.today/',

  // Avalanche Mainnet
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  // Avalanche Fuji Testnet
  43113: 'https://api.avax-test.network/ext/bc/C/rpc',
};

export const ETH_CHAIN_ID_CHAIN_MAPPING: Mapping = {
  // Ethereum
  1: 'ethereum',
  4: 'ethereum',

  // BSC
  56: 'bsc',
  97: 'bsc',

  // Polygon
  137: 'polygon',
  80001: 'polygon',

  // Avalanche
  43114: 'avalanche',
  43113: 'avalanche',
};

export const ETH_CHAIN_ID_NET_MAPPING: Mapping = {
  // Ethereum
  1: 'mainnet',
  4: 'rinkeby',

  // BSC
  56: 'mainnet',
  97: 'testnet',

  // Polygon
  137: 'mainnet',
  80001: 'testnet',

  // Avalanche
  43114: 'mainnet',
  43113: 'testnet',
};

export const ETH_CHAIN_ID_SERVER_MAPPING: Mapping = {
  1: 'https://wallet.blocto.app',
  4: 'https://wallet-testnet.blocto.app',
  56: 'https://wallet.blocto.app',
  97: 'https://wallet-testnet.blocto.app',
  137: 'https://wallet.blocto.app',
  80001: 'https://wallet-testnet.blocto.app',
  43114: 'https://wallet.blocto.app',
  43113: 'https://wallet-testnet.blocto.app',
};

/* eth series constants end */

/* sol constants begin */

export const SOL_NET_SERVER_MAPPING: Mapping = {
  devnet: 'https://wallet-testnet.blocto.app',
  testnet: 'https://wallet-testnet.blocto.app',
  'mainnet-beta': 'https://wallet.blocto.app',
};

export const SOL_NET = ['devnet', 'testnet', 'mainnet-beta'];

/* sol constants end */

export const EIP1193_EVENTS: Array<string> = ['connect', 'disconnect', 'message', 'chainChanged', 'accountsChanged'];

// Preserve login for 1 day
export const LOGIN_PERSISTING_TIME = 86400 * 1000;
