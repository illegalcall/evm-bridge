import {
    formatUnits,
    JsonRpcProvider,
    Wallet,
    Contract,
    Interface,
    id
  } from "ethers";
  
  import mongoose from "mongoose";
  import "dotenv/config";
  
  import { BlockModel, LogModel } from "./db"; // Adjust path to your db file
  import { AppConfig, ChainConfig } from "./types";
  
  // ----------------------------------------------------------------
  // Constants & Event Names
  // ----------------------------------------------------------------
  const EVENTS = {
    LOCK: "Lock(address,uint256)",
    BURN: "Burned(address,uint256)"
  } as const;
  
  // ----------------------------------------------------------------
  // Configuration
  // ----------------------------------------------------------------
  const CONFIG: AppConfig = {
    eth: {
      provider: process.env.ETH_PROVIDER || "http://127.0.0.1:8545",
      contractAddress: process.env.ETH_CONTRACT_ADDRESS || "",
      chainId: process.env.ETH_CHAIN_ID || "ethereum"
    },
    bsc: {
      provider: process.env.BSC_PROVIDER || "http://127.0.0.1:8546",
      contractAddress: process.env.BSC_CONTRACT_ADDRESS || "",
      chainId: process.env.BSC_CHAIN_ID || "bsc"
    },
    mongodb: {
      url: process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/bridgeDb"
    },
    privateKey: process.env.PRIVATE_KEY || "",
    pollingInterval: Number(process.env.POLLING_INTERVAL) || 5000
  };
  
  // Validate required environment variables
  function validateConfig() {
    const requiredEnvVars = [
      'ETH_CONTRACT_ADDRESS',
      'BSC_CONTRACT_ADDRESS',
      'PRIVATE_KEY'
    ];
  
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // Load contract ABIs
  const contractAbis = {
    eth: require("./ABI/ETHBridge.json"),
    bsc: require("./ABI/BSCBridge.json")
  } as const;
  
  // ----------------------------------------------------------------
  // Provider & Contract Setup
  // ----------------------------------------------------------------
  class ChainSetup {
    provider: JsonRpcProvider;
    contractInterface: Interface;
    wallet: Wallet;
    contract: Contract;
  
    constructor(
      config: ChainConfig, 
      abi: any, 
      privateKey: string
    ) {
      if (!config.contractAddress) {
        throw new Error(`Contract address not configured for chain ${config.chainId}`);
      }
  
      this.provider = new JsonRpcProvider(config.provider);
      this.contractInterface = new Interface(abi.abi);
      this.wallet = new Wallet(privateKey, this.provider);
      this.contract = new Contract(config.contractAddress, abi.abi, this.wallet);
    }
  }
  
  validateConfig();
  
  const ethSetup = new ChainSetup(
    CONFIG.eth,
    contractAbis.eth,
    CONFIG.privateKey
  );
  
  const bscSetup = new ChainSetup(
    CONFIG.bsc,
    contractAbis.bsc,
    CONFIG.privateKey
  );
  
  // ----------------------------------------------------------------
  // Database Helpers
  // ----------------------------------------------------------------
  async function getLastProcessedBlock(chain: string): Promise<number> {
    const record = await BlockModel.findOne({ chain });
    return record?.lastBlock || 0;
  }
  
  async function updateLastProcessedBlock(chain: string, blockNumber: number): Promise<void> {
    await BlockModel.findOneAndUpdate(
      { chain },
      { lastBlock: blockNumber },
      { upsert: true, new: true }
    );
  }
  
  async function storeLog(
    chain: string,
    txnHash: string,
    blockNumber: number,
    from: string,
    amount: string
  ): Promise<void> {
    await LogModel.findOneAndUpdate(
      { transactionHash: txnHash },
      {
        chain,
        transactionHash: txnHash,
        blockNumber,
        from,
        amount,
        processed: false
      },
      { upsert: true }
    );
  }
  
  // ----------------------------------------------------------------
  // Event Listeners
  // ----------------------------------------------------------------
  async function listenToChainEvents(
    setup: ChainSetup,
    chainId: string,
    eventName: string
  ): Promise<void> {
    try {
      const latestBlock = await setup.provider.getBlockNumber();
      const lastProcessed = await getLastProcessedBlock(chainId);
      
      const fromBlock = lastProcessed + 1;
      const toBlock = latestBlock;
  
      if (fromBlock > toBlock) return;
  
      const eventTopic = id(eventName);
      const logs = await setup.provider.getLogs({
        address: setup.contract.target,
        fromBlock,
        toBlock,
        topics: [eventTopic]
      });
  
      console.log(
        `[${chainId.toUpperCase()}] Found ${logs.length} ${eventName} logs ` +
        `(blocks ${fromBlock}-${toBlock})`
      );
  
      if (logs.length > 0) {
        await updateLastProcessedBlock(chainId, toBlock);
  
        for (const log of logs) {
          const parsedLog = setup.contractInterface.parseLog(log);
          if (!parsedLog) continue;
  
          const { txnHash, from, amount } = {
            txnHash: log.transactionHash,
            from: parsedLog.args[0].toString(),
            amount: parsedLog.args[1].toString()
          };
  
          console.log(
            `[${chainId.toUpperCase()}] Event: ` +
            `txnHash=${txnHash}, from=${from}, amount=${amount}`
          );
  
          await storeLog(chainId, txnHash, log.blockNumber, from, amount);
        }
      }
    } catch (err) {
      console.error(`Error in ${chainId} listener:`, err);
    }
  }
  
  // ----------------------------------------------------------------
  // Transaction Processing
  // ----------------------------------------------------------------
  async function processPendingTransactions(): Promise<void> {
    try {
      const pendingLogs = await LogModel.find({ processed: false });
      
      for (const log of pendingLogs) {
        try {
          const setup = log.chain === CONFIG.eth.chainId ? bscSetup : ethSetup;
          const method = log.chain === CONFIG.eth.chainId ? 
            'lockOnOppositeChain' : 'burnedOnOtherSide';
  
          console.log(
            `[RELAY] Processing transaction on ${log.chain === CONFIG.eth.chainId ? 'BSC' : 'ETH'}:`+
            `from=${log.from}, amount=${log.amount}`
          );
  
          const tx = await setup.contract[method](log.from, log.amount);
          await tx.wait();
  
          await LogModel.findByIdAndUpdate(log._id, { processed: true });
          
          console.log(`[RELAY] Successfully processed transaction: ${tx.hash}`);
        } catch (err) {
          console.error(`Failed to process transaction ${log.transactionHash}:`, err);
        }
      }
    } catch (err) {
      console.error("Error in transaction processing:", err);
    }
  }
  
  // ----------------------------------------------------------------
  // Main Loop
  // ----------------------------------------------------------------
  async function main(): Promise<void> {
    try {
      // Connect to MongoDB
      await mongoose.connect(CONFIG.mongodb.url);
      console.log("Connected to MongoDB at", CONFIG.mongodb.url);
  
      // Log initial state
      const [ethBlock, bscBlock] = await Promise.all([
        ethSetup.provider.getBlockNumber(),
        bscSetup.provider.getBlockNumber()
      ]);
  
      console.log("Initial state:");
      console.log(`ETH Contract: ${CONFIG.eth.contractAddress}`);
      console.log(`BSC Contract: ${CONFIG.bsc.contractAddress}`);
      console.log(`ETH Block: ${ethBlock}`);
      console.log(`BSC Block: ${bscBlock}`);
  
      // Main loop
      while (true) {
        await Promise.all([
          listenToChainEvents(ethSetup, CONFIG.eth.chainId, EVENTS.LOCK),
          listenToChainEvents(bscSetup, CONFIG.bsc.chainId, EVENTS.BURN),
          processPendingTransactions()
        ]);
  
        await new Promise(resolve => setTimeout(resolve, CONFIG.pollingInterval));
      }
    } catch (err) {
      console.error("Fatal error in main loop:", err);
      process.exit(1);
    }
  }
  
  // Start the relayer
  main().catch(err => {
    console.error("Relayer script failed:", err);
    process.exit(1);
  });
  