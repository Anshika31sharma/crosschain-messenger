import { ethers, parseEther, JsonRpcProvider, Contract, Wallet } from "ethers";

type Logger = (msg: string) => void;

// Environment variables
const AMOY_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const LOCALHOST_RPC_URL = "http://localhost:8545";

// Check environment variables
if (!AMOY_RPC_URL || !PRIVATE_KEY) {
  throw new Error("❌ Missing environment variables: NEXT_PUBLIC_SEPOLIA_RPC or NEXT_PUBLIC_PRIVATE_KEY");
}

// Chain IDs
const CHAIN_ID_LOCALHOST = "1";
const CHAIN_ID_AMOY = "2";

// Providers
const PROVIDERS: Record<string, JsonRpcProvider> = {
  [CHAIN_ID_LOCALHOST]: new JsonRpcProvider(LOCALHOST_RPC_URL),
  [CHAIN_ID_AMOY]: new JsonRpcProvider(AMOY_RPC_URL),
};

// Deployed contract addresses
const CONTRACT_ADDRESSES: Record<string, string> = {
  [CHAIN_ID_LOCALHOST]: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Localhost
  [CHAIN_ID_AMOY]: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",     // Amoy
};

// ABI
const ABI = [
  "function sendMessage(uint16 dstChainId, address dst, string calldata message) public payable returns (uint256)",
  "event MessageSent(uint16 indexed srcChain, uint256 indexed msgId, address sender, string message)",
  "event MessageReceived(uint16 indexed srcChain, address receiver, string message)",
];

export async function sendCrossChainMessage(
  srcChain: string,
  dstChain: string,
  message: string,
  logger: Logger
): Promise<string> {
  const srcProvider = PROVIDERS[srcChain];
  const dstProvider = PROVIDERS[dstChain];

  if (!srcProvider || !dstProvider) {
    throw new Error("❌ Unsupported source or destination chain");
  }

  const signer = new Wallet(PRIVATE_KEY as string, srcProvider);
  const srcContract = new Contract(CONTRACT_ADDRESSES[srcChain], ABI, signer);
  const destinationAddress = ethers.getAddress(CONTRACT_ADDRESSES[dstChain]);

  logger("⏳ Sending message transaction from source chain ...");

  const tx = await srcContract.sendMessage(
    Number(dstChain),
    destinationAddress,
    message,
    {
      value: parseEther("0.001"),
    }
  );

  logger(`🧾 TX Hash (source): ${tx.hash}`);
  await tx.wait();
  logger("📡 Transaction hash from the source chain");

  const dstContract = new Contract(CONTRACT_ADDRESSES[dstChain], ABI, dstProvider);

  logger("🔁 Waiting for message to be received ..");

  return new Promise((resolve) => {
    dstContract.once("MessageReceived", (srcChainId: number, receiver: string, msg: string) => {
      logger(`✅ Message received on destination chain: "${msg}"`);
      resolve(tx.hash);
    });

    // Timeout fallback
    setTimeout(() => {
      logger("⚠️ MessageReceived not emitted in time. Check destination contract or wait longer.");
      resolve(tx.hash);
    }, 20000); // 20s timeout
  });
}
