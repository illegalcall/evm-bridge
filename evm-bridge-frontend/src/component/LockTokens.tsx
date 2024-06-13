import { useState, ChangeEvent, FormEvent } from "react";
import { useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import EthBridgeAbi from "../ABI/EthBridge.json";
import TokenAbi from "../ABI/Donut.json";
import { Abi, parseUnits } from "viem";
import Navbar from "./Navbar";

const LockTokens: React.FC = () => {
  const [lockAmount, setLockAmount] = useState<string>("");
  const [unlockAmount, setUnlockAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lockedTokens, setLockedTokens] = useState<bigint>(0n);

  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { data: receipt } = useWaitForTransactionReceipt();

  const handleSwitchNetwork = async () => {
    try {
      // Sepolia chain id is 31337
      await switchChain({ chainId: 31337 });
      alert("Switched to Sepolia network");
    } catch (error) {
      console.error("Error switching network:", error);
      alert("Failed to switch network.");
    }
  };

  const handleLockTokens = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lockAmount) return;
    setLoading(true);
    try {
      console.log("inside lock tokens");
      const amountParsed = parseUnits(lockAmount, 18); // returns a bigint
      // Approve the EthBridge to spend tokens
      await writeContractAsync({
        abi: TokenAbi.abi as Abi,
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",// process.env.REACT_APP_DONUT_TOKEN_ADDRESS
        functionName: "approve",
        args: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", amountParsed], // process.env.REACT_APP_ETH_BRIDGE_ADDRESS
      });
      // Lock tokens via EthBridge
      await writeContractAsync({
        abi: EthBridgeAbi.abi as Abi,
        address:"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // process.env.REACT_APP_ETH_BRIDGE_ADDRESS
        functionName: "lock",
        args: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", amountParsed], // process.env.REACT_APP_DONUT_TOKEN_ADDRESS
      });
      setLockedTokens((prev) => prev + amountParsed);
      alert("Tokens locked! Wait for the relayer to credit your wrapped tokens on BSC Testnet.");
      setLockAmount("");
    } catch (error) {
      console.error("Lock error:", error);
      alert("Lock transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockTokens = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!unlockAmount) return;
    setLoading(true);
    try {
      const amountParsed = parseUnits(unlockAmount, 18);
      await writeContractAsync({
        abi: EthBridgeAbi.abi as Abi,
        address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // process.env.REACT_APP_ETH_BRIDGE_ADDRESS
        functionName: "unlock",
        args: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", amountParsed], // process.env.REACT_APP_DONUT_TOKEN_ADDRESS
      });
      alert("Tokens unlocked!");
      setUnlockAmount("");
    } catch (error) {
      console.error("Unlock error:", error);
      alert("Unlock transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <p className="text-2xl font-semibold mb-4 text-center text-red-900">
            Switch to Sepolia Network before proceeding
          </p>
          <button
            onClick={handleSwitchNetwork}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 w-full rounded hover:bg-yellow-600 transition duration-300 mb-4 cursor-pointer"
          >
            Switch Network
          </button>
          <form onSubmit={handleLockTokens}>
            <p className="text-2xl font-semibold mb-4 text-center">
              Lock Your Donut Tokens
            </p>
            <input
              type="text"
              placeholder="Enter amount"
              value={lockAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLockAmount(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-700 transition duration-300 cursor-pointer"
            >
              {loading ? "Processing..." : "Lock"}
            </button>
          </form>
          <form onSubmit={handleUnlockTokens} className="mt-6">
            <p className="text-2xl font-semibold mb-4 text-center">
              Unlock Your Tokens (after burning wrapped tokens on BSC)
            </p>
            <input
              type="text"
              placeholder="Enter amount"
              value={unlockAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnlockAmount(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 w-full rounded hover:bg-green-700 transition duration-300 cursor-pointer"
            >
              {loading ? "Processing..." : "Unlock"}
            </button>
          </form>
          {receipt && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700">Transaction confirmed!</p>
              {/* Optionally, display additional receipt details */}
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-lg">
              Total Locked Tokens: {lockedTokens.toString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LockTokens;
