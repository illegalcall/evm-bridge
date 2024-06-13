export interface ChainConfig {
  provider: string;
  contractAddress: string;
  chainId: string;
}

export interface AppConfig {
  eth: ChainConfig;
  bsc: ChainConfig;
  mongodb: {
    url: string;
  };
  privateKey: string;
  pollingInterval: number;
} 