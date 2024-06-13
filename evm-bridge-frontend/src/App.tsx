import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './component/Home';
import LockTokens from './component/LockTokens';
import ClaimWTokens from './component/ClaimWTokens';
import type { Chain } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Custom BSC Testnet configuration (since we're bridging between local networks)
const localBscTestnet: Chain = {
  id: 97,
  name: "Local BSC Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Binance Coin",
    symbol: "BNB",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8546"] },
    public: { http: ["http://127.0.0.1:8546"] },
  },
  blockExplorers: {
    default: { name: "LocalBscScan", url: "http://127.0.0.1:8546" },
  },
  testnet: true,
};

// configuration for local sepolia
const localSepolia: Chain = {
  id: 31337,
  name: "Local Sepolia",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "LocalSepoliaScan", url: "http://127.0.0.1:8545" },
  },
};

// Configuration for the bridge
const config = getDefaultConfig({
  appName: 'Donut Bridge',
  projectId: '8d7f9531a034158033ef78417f6d60af', // Make sure this is your actual WalletConnect Project ID
  chains: [localBscTestnet, localSepolia], // Using official Sepolia instead of local
  ssr: false, // Set to true if you're using server-side rendering
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Add some reasonable defaults for blockchain queries
      staleTime: 60_000, // 1 minute
      refetchInterval: 60_000, // Refetch every minute
    },
  },
});

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          coolMode // Optional: adds a fun effect
          modalSize="compact" // Makes the wallet connection modal more compact
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lock-tokens" element={<LockTokens />} /> {/* More readable URL */}
              <Route path="/claim-wtokens" element={<ClaimWTokens />} /> {/* More readable URL */}
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;