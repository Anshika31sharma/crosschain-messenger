import {
  ethers,
  JsonRpcProvider,
  parseEther,
  Contract,
  Wallet,
  AbiCoder,
} from "ethers";

type Logger = (msg: string) => void;

// ✅ Instantiate AbiCoder for encoding
const abiCoder = new AbiCoder();

// ✅ Environment Variables
const AMOY_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC!;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const LOCALHOST_RPC_URL = "http://localhost:8545";

// ❌ Check for missing env vars
if (!AMOY_RPC_URL || !PRIVATE_KEY) {
  throw new Error("❌ Missing NEXT_PUBLIC_SEPOLIA_RPC or NEXT_PUBLIC_PRIVATE_KEY");
}

// ✅ Chain IDs (custom)
const CHAIN_ID_LOCALHOST = "1";
const CHAIN_ID_AMOY = "2";

// ✅ LayerZero's destination chain ID (for Polygon Amoy)
const LZ_POLYGON_AMOY_ID = 10109;

// ✅ Providers
const PROVIDERS: Record<string, JsonRpcProvider> = {
  [CHAIN_ID_LOCALHOST]: new JsonRpcProvider(LOCALHOST_RPC_URL),
  [CHAIN_ID_AMOY]: new JsonRpcProvider(AMOY_RPC_URL),
};

// ✅ Smart contract addresses per chain
const CONTRACT_ADDRESSES: Record<string, string> = {
  [CHAIN_ID_LOCALHOST]: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // MessageSender on localhost
  [CHAIN_ID_AMOY]: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",     // MessageReceiver on Amoy
};

// ✅ Contract ABI
const ABI = [
  "function sendMessage(uint16 dstChainId, bytes calldata destination, string calldata message) external payable",
  "event MessageSent(uint16 indexed srcChain, uint256 indexed msgId, address sender, string message)",
  "event MessageReceived(uint16 indexed srcChain, address receiver, string message)",
];

// ✅ Main function
export async function sendCrossChainMessage(
  src: string,
  dst: string,
  message: string,
  log: Logger
): Promise<string> {
  const srcProvider = PROVIDERS[src];
  const dstProvider = PROVIDERS[dst];

  if (!srcProvider || !dstProvider) {
    throw new Error("❌ Unsupported source or destination chain");
  }

  const signer = new Wallet(PRIVATE_KEY, srcProvider);
  const srcContract = new Contract(CONTRACT_ADDRESSES[src], ABI, signer);

  // Destination address encoded in bytes
  const encodedDstAddress = abiCoder.encode(["address"], [CONTRACT_ADDRESSES[dst]]);

  log("⏳ Sending message transaction from source (localhost)...");
  const tx = await srcContract.sendMessage(
    LZ_POLYGON_AMOY_ID, // dstChainId for Polygon Amoy
    encodedDstAddress,
    message,
    {
      value: parseEther("0.01"),
    }
  );

  log(`🧾 TX Hash (source): ${tx.hash}`);
  await tx.wait();
  log("📡 Transaction confirmed on localhost");

  // ✅ Listen on the destination chain
  const dstContract = new Contract(CONTRACT_ADDRESSES[dst], ABI, dstProvider);

  log("🔁 Waiting for message to be received on Amoy...");

  return new Promise((resolve) => {
    dstContract.once(
      "MessageReceived",
      (srcChainId: number, receiver: string, msg: string) => {
        log(`✅ Message received on destination chain: "${msg}"`);
        resolve(tx.hash);
      }
    );

    setTimeout(() => {
      log("⚠️ MessageReceived not emitted in time. Check destination contract or wait longer.");
      resolve(tx.hash);
    }, 20000); // 20 seconds timeout
  });
}
