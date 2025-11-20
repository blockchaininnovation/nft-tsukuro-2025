import { createConfig, http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(), // Metamask browser extension
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
  ssr: true,
});
