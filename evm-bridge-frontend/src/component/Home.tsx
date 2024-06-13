import Background from "./Background";
import Navbar from "./Navbar";

const Home = () => {
  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="relative z-20 min-h-screen flex flex-col items-start justify-center text-left px-12 py-8">
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-12 max-w-3xl">
          Bridge your ERC20 Tokens <br /> from <span className="text-blue-600">Sepolia</span> <br /> to <span className="text-yellow-500">BSC Testnet!</span>
        </h1>

        <div className="text-white max-w-3xl space-y-8">
          <h2 className="text-4xl font-extrabold underline text-gray-700 ">How It Works</h2>
          <p className="text-xl leading-relaxed mb-6 font-extrabold">
            Lock your original tokens on Sepolia to receive equivalent wrapped tokens on BSC Testnet.
          </p>
          <p className="text-xl leading-relaxed mb-6 font-extrabold">
            When you want to get your original tokens back, burn your wrapped tokens on BSC Testnet and then unlock on Sepolia.
          </p>
          <h3 className="text-2xl font-extrabold text-gray-700 underline mb-4">Steps:</h3>
          <ol className="list-decimal list-inside space-y-4 text-xl font-extrabold">
            <li>Lock your tokens on Sepolia.</li>
            <li>Receive equivalent wrapped tokens on BSC Testnet.</li>
            <li>Use wrapped tokens on BSC Testnet as needed.</li>
            <li>Burn wrapped tokens on BSC Testnet to bridge back.</li>
            <li>Unlock your original tokens on Sepolia.</li>
          </ol>
          <p className="font-extrabold text-lg text-purple-500 mt-7">
            This process ensures secure cross-chain transfers between Sepolia and BSC Testnet.
          </p>
        </div>
      </div>
      <Background />
    </>
  );
};

export default Home;
