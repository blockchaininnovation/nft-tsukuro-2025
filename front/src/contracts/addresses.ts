// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  polygon: (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  polygonAmoy: (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_TESTNET ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  anvil: (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
} as const;

// NFT Types
export const NFT_TYPES = {
  TYPE_1: 0,
  TYPE_2: 1,
  TYPE_3: 2,
  TYPE_4: 3,
} as const;

export const NFT_METADATA = [
  {
    id: NFT_TYPES.TYPE_1,
    title: "NFT作品 #1",
    description: "最初の作品",
    image: "/nft-1.svg",
  },
  {
    id: NFT_TYPES.TYPE_2,
    title: "NFT作品 #2",
    description: "2番目の作品",
    image: "/nft-2.svg",
  },
  {
    id: NFT_TYPES.TYPE_3,
    title: "NFT作品 #3",
    description: "3番目の作品",
    image: "/nft-3.svg",
  },
  {
    id: NFT_TYPES.TYPE_4,
    title: "NFT作品 #4",
    description: "4番目の作品",
    image: "/nft-4.svg",
  },
] as const;
