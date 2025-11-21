## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Setup

.env を作っておく

```shell
$ cp .env.example .env
```

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
# forge create を直接使う場合（constructor(address initialOwner) を渡す）
OWNER=0xYourOwnerAddress

forge create src/TsukuroSBT.sol:TsukuroSBT \
  --constructor-args "$OWNER" \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key>
```

ローカルの場合

```shell
source .env 
# msg.sender を initialOwner としてデプロイします。
forge script script/TsukuroSBTDeploy.s.sol:TsukuroSBTDeploy \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

### Mint

オーナー(スポンサー想定)は任意の宛先へミント可能。非オーナーは自分宛のみミント可能です。

前提:
- CONTRACT_ADDRESS: デプロイ済みコントラクトアドレス
- RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS: .env に設定済み

```shell
source .env

# [オーナー] 任意のアドレス(ALICE)へミント
ALICE=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
ID=1

cast send "$CONTRACT_ADDRESS" "mintLocked(address,uint256,uint256,bytes)" \
  "$ALICE" "$ID" 1 0x \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY"

# [非オーナー] 自分自身へミント（anvilの別の鍵を使用）
NON_OWNER_PK=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
NON_OWNER_ADDR=$(cast wallet address --private-key "$NON_OWNER_PK")
ID=2
cast send "$CONTRACT_ADDRESS" "mintLocked(address,uint256,uint256,bytes)" \
  "$NON_OWNER_ADDR" "$ID" 1 0x \
  --rpc-url "$RPC_URL" \
  --private-key "$NON_OWNER_PK"

# 確認: 残高とロック状態
cast call "$CONTRACT_ADDRESS" "balanceOf(address,uint256)(uint256)" "$ALICE" 1 --rpc-url "$RPC_URL"
cast call "$CONTRACT_ADDRESS" "locked(uint256)(bool)" 1 --rpc-url "$RPC_URL"
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
