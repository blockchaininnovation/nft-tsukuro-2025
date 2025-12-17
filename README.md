# NFT Tsukuro 2025

> Soulbound NFT (SBT) minting platform for UTokyo Blockchain Open Lecture 2025

## About

A collaborative NFT collection created to commemorate completion of the UTokyo Blockchain Open Lecture.

**Concept**: The mizuhiki (decorative cord) on an otoshidama envelope ties together bonds and blocks—expressing the co-creation born through blockchain.

Open the envelope to reveal a cat-motif coin and the 2025 graduate logo. Each coin bears a unique serial number, with special numbers (repeating digits, etc.) adding individual character.

**Nyakamoto**: The cat mascot honors Satoshi Nakamoto. Each graduate becomes a "Satoshi Nyakamoto"—a next-generation pioneer carrying forward their learning like an ever-growing chain, not ending at graduation but connecting to the future.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity, Foundry, ERC-1155 (Soulbound) |
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Web3 | wagmi v3, viem v2, RainbowKit |
| Network | Polygon (Mainnet / Amoy Testnet) |

## Features

- Wallet connection (MetaMask, etc.)
- NFT gallery with 4 artwork variants
- Two minting modes:
  - Standard mint (user pays gas)
  - Sponsored mint (organizer pays gas for venue)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Foundry (for contract development)

### Frontend

```bash
cd front
pnpm install
cp .env.local.example .env.local
pnpm dev
```

### Contract

```bash
cd contract
forge build
forge test
```

See [front/README.md](front/README.md) and [contract/README.md](contract/README.md) for details.

## Project Structure

```
├── front/      # Next.js minting site
├── contract/   # Solidity smart contracts (Foundry)
├── assets/     # NFT images and metadata
├── scripts/    # Deployment scripts
└── docs/       # Documentation
```
