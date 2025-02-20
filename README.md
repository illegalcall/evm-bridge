Below is a **README.md** with added emojis for a more vibrant, visually engaging experience. Feel free to adjust any section or emoji usage to match your style!  

---

# EVM Bridge – 🍩 Sepolia ETH <-> BSC Testnet 🍩
A cross-chain bridge that facilitates transferring **Donut** tokens between the [Sepolia Ethereum test network](https://chainlist.org/chain/11155111) and the [BSC testnet](https://chainlist.org/chain/97). This project includes both a **backend** (smart contracts, relayer, scripts) and a **frontend** (dApp interface) to demonstrate bridging functionality. When bridging **Donut** tokens, you will receive **WDonut** (wrapped Donut) tokens on the destination chain.  

---

## 🔗 Table of Contents
1. [Overview](#overview)  
2. [Project Structure](#project-structure)  
3. [Prerequisites](#prerequisites)  
4. [Installation](#installation)  
5. [Configuration](#configuration)  
6. [Deployment](#deployment)  
7. [Usage](#usage)  
8. [Testing](#testing)  
9. [Folder Details](#folder-details)  
10. [Contributing](#contributing)  
11. [License](#license)  

---

## 🍬 Overview
**EVM Bridge** is designed to allow users to **lock** **Donut** tokens on one chain and **mint** a wrapped version (**WDonut**) on the other. The project demonstrates the concept of cross-chain bridging using:  

- **Donut** – The primary ERC-20 token.  
- **WDonut** – A wrapped version of Donut that represents your locked tokens on the destination chain.  
- **ETHBridge.sol** – Manages bridging logic on the Sepolia Ethereum network.  
- **BSCBridge.sol** – Manages bridging logic on the Binance Smart Chain testnet.  

> **Goal**: Enable developers to test bridging solutions on test networks before deploying to mainnets.  

---

## 🏗 Project Structure
```
evm-bridge/
│
├── evm-bridge-backend/
│   ├── .github/
│   ├── broadcast/
│   ├── cache/
│   ├── ABI/
│   ├── db.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── relayer.ts
│   ├── tsconfig.json
│   ├── types.ts
│   ├── ...
│   └── src/
│       ├── BSCBridge.sol
│       ├── ETHBridge.sol
│       ├── Token.sol       (Donut)
│       ├── Wtoken.sol      (WDonut)
│       └── ...
│
├── evm-bridge-frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.app.json
│   ├── ...
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```
- **evm-bridge-backend** – All backend code including smart contracts, scripts, and configurations for the relayer.  
- **evm-bridge-frontend** – Frontend dApp for interacting with the bridge.  

---

## ✅ Prerequisites
1. **Node.js** (v14+ recommended)  
2. **npm** or **yarn**  
3. **Hardhat** or **Foundry** (if you are using Hardhat/Foundry to compile and deploy the contracts)  
4. **MetaMask** or a similar Web3-enabled wallet (for testing the dApp in a browser)  

---

## ⚙️ Installation
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/evm-bridge.git
   cd evm-bridge
   ```

2. **Install Dependencies**  
   - **Backend**  
     ```bash
     cd evm-bridge-backend
     npm install
     ```
   - **Frontend**  
     ```bash
     cd ../evm-bridge-frontend
     npm install
     ```

---

## 🔧 Configuration
1. **Environment Variables**  
   Create a `.env` file in the **evm-bridge-backend** folder (and/or **evm-bridge-frontend** if needed) with the following keys:
   ```
   PRIVATE_KEY=<Your private key for deployment/testing>
   SEPOLIA_RPC_URL=<Sepolia network RPC URL>
   BSC_TESTNET_RPC_URL=<BSC testnet RPC URL>
   ETHERSCAN_API_KEY=<Optional, for contract verification>
   BSCSCAN_API_KEY=<Optional, for contract verification>
   ```
   > **Note**: Make sure not to commit your private keys to version control.  

2. **Contract Addresses**  
   After deploying, update the frontend `.env` or config files with the addresses of **ETHBridge**, **BSCBridge**, **Donut**, and **WDonut** contracts.

---

## 🚀 Deployment
1. **Compile Contracts**  
   ```bash
   cd evm-bridge-backend
   npx hardhat compile
   ```
2. **Deploy to Sepolia**  
   ```bash
   npx hardhat run scripts/deployEthBridge.ts --network sepolia
   ```
3. **Deploy to BSC Testnet**  
   ```bash
   npx hardhat run scripts/deployBscBridge.ts --network bsctest
   ```
4. **Verify Contracts (Optional)**  
   ```bash
   npx hardhat verify <CONTRACT_ADDRESS> --network sepolia
   npx hardhat verify <CONTRACT_ADDRESS> --network bsctest
   ```

---

## 🏃 Usage
1. **Run the Backend (Relayer)**  
   - Make sure your `.env` file is properly configured.  
   - Start the relayer or any backend service that listens for events:
     ```bash
     cd evm-bridge-backend
     npm run start:relayer
     ```
   This will watch for lock events on Sepolia or BSC testnet and relay them to the other chain.

2. **Start the Frontend**  
   ```bash
   cd ../evm-bridge-frontend
   npm start
   ```
   - This typically opens `http://localhost:3000` (or another port) in your browser.

3. **Bridge Flow**  
   - **Lock Donut → Mint WDonut**:  
     - On the origin chain (e.g., Sepolia), select how many **Donut** tokens you want to lock.  
     - The relayer listens for the lock event and mints **WDonut** on the destination chain (e.g., BSC testnet).  
     - Switch your wallet to the destination chain to see your newly minted **WDonut** tokens.  
   - **Burn WDonut → Unlock Donut**:  
     - On the destination chain, choose how many **WDonut** tokens you want to burn.  
     - The relayer will listen for the burn event and unlock the equivalent amount of **Donut** on the origin chain.

---

## 🧪 Testing
1. **Unit Tests**  
   ```bash
   cd evm-bridge-backend
   npx hardhat test
   ```
2. **Integration Tests**  
   - Make sure both networks are set up.  
   - Ensure you have test tokens on each chain.  
   - Run the test suite that checks bridging functionality end-to-end.

---

## 📂 Folder Details
- **`evm-bridge-backend/.github`** – GitHub actions/workflows for CI/CD.  
- **`evm-bridge-backend/broadcast`** – Deployment scripts or Hardhat artifact logs.  
- **`evm-bridge-backend/cache`** – Compiler cache.  
- **`evm-bridge-backend/ABI`** – Compiled ABI files for the contracts.  
- **`evm-bridge-backend/src`** – Smart contracts and any associated libraries:  
  - **`BSCBridge.sol`** – Bridge contract for BSC testnet.  
  - **`ETHBridge.sol`** – Bridge contract for Sepolia Ethereum.  
  - **`Token.sol`** – Donut token contract.  
  - **`Wtoken.sol`** – WDonut (wrapped Donut) token contract.  
- **`evm-bridge-backend/relayer.ts`** – Script that listens for events on one chain and relays them to another.  
- **`evm-bridge-frontend`** – Contains the frontend (React/Vue/Next.js, etc.) application for interacting with the contracts.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](../../issues) if you want to contribute.

1. **Fork** the project.  
2. Create a new **branch** (`git checkout -b feature/awesome-feature`).  
3. **Commit** your changes (`git commit -m 'Add awesome feature'`).  
4. **Push** to the branch (`git push origin feature/awesome-feature`).  
5. Create a new **Pull Request**.

---

## ⚖️ License
This project is open-sourced under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as you see fit.

---

**Thank you for using our bridge!** 🍩✨ If you have any questions or feedback, feel free to reach out or open an issue. Happy bridging!  