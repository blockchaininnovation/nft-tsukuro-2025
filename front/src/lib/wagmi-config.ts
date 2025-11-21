import { createConfig, http } from "wagmi";
import { polygon, polygonAmoy, anvil } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Network configuration with Anvil as default for local development
// Switch networks via environment variables or wallet
export const config = createConfig({
  chains: [anvil, polygonAmoy, polygon],
  connectors: [
    injected(), // Metamask browser extension
  ],
  transports: {
    [anvil.id]: http(process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://localhost:8545"),
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com"),
  },
  ssr: true,
});
