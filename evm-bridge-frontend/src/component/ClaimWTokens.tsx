import { useState, ChangeEvent, FormEvent } from "react";
import { useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { Abi } from 'viem';
import BSCBridgeAbi from "../ABI/BSCBridge.json";
import WDonutAbi from "../ABI/WDonut.json";
import { parseUnits } from "viem";
import Navbar from "./Navbar";

// Cast the imported ABIs as Abi type
const bscBridgeAbi = BSCBridgeAbi.abi as Abi;
const wDonutAbi = WDonutAbi.abi as Abi;

const ClaimWTokens: React.FC = () => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [burnAmount, setBurnAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { data: receipt } = useWaitForTransactionReceipt();

  const handleSwitchNetwork = async () => {
    try {
      // BSC Testnet chain id is 97
      await switchChain({ chainId: 97 });
      alert("Switched to BSC Testnet");
    } catch (error) {
      console.error("Error switching network:", error);
      alert("Failed to switch network.");
    }
  };

  const handleWithdraw = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    setLoading(true);
    try {
      const amountParsed = parseUnits(withdrawAmount, 18);
      await writeContractAsync({
        abi: bscBridgeAbi,
        address: (process.env.REACT_APP_BSC_BRIDGE_ADDRESS ?? "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as `0x${string}`, // Replace with your BSCBridge address on BSC Testnet
        functionName: "withdraw",
        args: [amountParsed],
      });
      alert("Wrapped tokens withdrawn to your account");
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Withdraw transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!burnAmount) return;
    setLoading(true);
    try {
      const amountParsed = parseUnits(burnAmount, 18);
      // Approve the bridge to burn tokens
      await writeContractAsync({
        abi: wDonutAbi,
        address: (process.env.REACT_APP_W_DONUT_TOKEN_ADDRESS ?? "0xyz") as `0x${string}`, // Replace with your WDonut token address on BSC Testnet
        functionName: "approve",
        args: [(process.env.REACT_APP_BSC_BRIDGE_ADDRESS ?? "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as `0x${string}`, amountParsed],
      });
      // Burn tokens after approval
      await writeContractAsync({
        abi: bscBridgeAbi,
        address: (process.env.REACT_APP_BSC_BRIDGE_ADDRESS ?? "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as `0x${string}`, // Replace with your BSCBridge address on BSC Testnet
        functionName: "burned",
        args: [amountParsed],
      });
      alert("Wrapped tokens burned. Now you can unlock original tokens on Sepolia.");
      setBurnAmount("");
    } catch (error) {
      console.error("Burn error:", error);
      alert("Burn transaction failed.");
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
            Switch to BSC Testnet before proceeding
          </p>
          <button
            onClick={handleSwitchNetwork}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 w-full rounded hover:bg-yellow-600 transition duration-300 mb-4 cursor-pointer"
          >
            Switch Network
          </button>
          <form onSubmit={handleWithdraw}>
            <p className="text-2xl font-semibold mb-4 text-center">
              Withdraw Your Wrapped Donut Tokens
            </p>
            <input
              type="text"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-700 transition duration-300 cursor-pointer"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </form>
          <form onSubmit={handleBurn} className="mt-6">
            <p className="text-2xl font-semibold mb-4 text-center">
              Burn Your Wrapped Tokens (to bridge back to Sepolia)
            </p>
            <input
              type="text"
              placeholder="Enter amount"
              value={burnAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBurnAmount(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 w-full rounded hover:bg-red-700 transition duration-300 cursor-pointer"
            >
              {loading ? "Processing..." : "Burn"}
            </button>
          </form>
          {receipt && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700">Transaction confirmed!</p>
              {/* Optionally, display additional receipt details here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClaimWTokens;
