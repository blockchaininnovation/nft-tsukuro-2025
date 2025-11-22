# NFT Tsukuro 2025 - Minting Site

参加証NFTをミントできるWebアプリケーション。4種類のNFTアートをギャラリー形式で表示し、ユーザーが好きな作品を選んでミントできます。

## 主な機能

- **ウォレット接続**: MetamaskなどのWeb3ウォレットに対応（RainbowKit使用）
- **NFTギャラリー**: 4種類のNFTカードをグリッド表示
- **2種類のミント方法**:
  - 通常ミント: ユーザーがガス代を負担
  - スポンサードミント: 会場のPCから実行する場合、運営側がガス代を負担
- **Polygon対応**: PolygonメインネットとAmoyテストネットに対応
- **譲渡不可設計**: 参加証として、権利移転は不可（スマートコントラクト側で実装が必要）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **Web3ライブラリ**:
  - wagmi v3
  - viem v2
  - RainbowKit
  - TanStack Query
- **コード品質**: Biome
- **パッケージマネージャー**: pnpm

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、必要な値を設定します。

```bash
cp .env.local.example .env.local
```

`.env.local`を編集:

```env
# コントラクトアドレス（デプロイ後に設定）
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_TESTNET=0xYourTestnetContractAddress

# スポンサーウォレットの秘密鍵（ガス代負担用）
SPONSOR_WALLET_PRIVATE_KEY=0xYourPrivateKey

# 使用するネットワーク（testnetを使う場合はtrueに設定）
USE_TESTNET=false

# スポンサードミントを許可するIPアドレス（カンマ区切り）
ALLOWED_IPS=127.0.0.1,::1,会場のIPアドレス
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
front/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── sponsored-mint/  # スポンサードミントAPI
│   │   ├── layout.tsx           # ルートレイアウト
│   │   └── page.tsx             # メインページ
│   ├── components/
│   │   ├── header.tsx           # ヘッダー（ウォレット接続ボタン含む）
│   │   └── nft-card.tsx         # NFTカードコンポーネント
│   ├── contracts/
│   │   ├── nft-abi.ts          # コントラクトABI
│   │   └── addresses.ts        # コントラクトアドレスとNFTメタデータ
│   ├── lib/
│   │   └── wagmi-config.ts     # wagmi設定
│   └── providers/
│       └── web3-provider.tsx   # Web3プロバイダー
├── public/
│   ├── nft-1.svg               # NFT #1プレースホルダー画像
│   ├── nft-2.svg               # NFT #2プレースホルダー画像
│   ├── nft-3.svg               # NFT #3プレースホルダー画像
│   └── nft-4.svg               # NFT #4プレースホルダー画像
└── .env.local.example          # 環境変数テンプレート
```

## 使い方

### ユーザー向け

1. サイトにアクセス
2. 「Connect Wallet」ボタンをクリックしてMetamaskを接続
3. 好きなNFT作品の「Mint」ボタンをクリック
4. トランザクションを承認
   - 会場のPCの場合: ガス代無料でミント
   - それ以外: 自分でガス代を支払ってミント

### スポンサードミントの仕組み

1. ユーザーがMintボタンをクリック
2. フロントエンドがまず`/api/sponsored-mint`にリクエスト
3. APIルートでIPアドレスをチェック
4. 許可されたIPの場合: スポンサーウォレットからトランザクション実行
5. 許可されていない場合: 通常のミント（ユーザーがガス代負担）にフォールバック

## デプロイ前の準備

### 1. スマートコントラクトのデプロイ

`contract/`ディレクトリでNFTコントラクトをデプロイし、コントラクトアドレスを取得します。

### 2. ABIの更新

`contract`ディレクトリで`forge build`を実行してABIを生成します。
生成された`contract/out/<ContractName>.sol/<ContractName>.json`を`src/contracts/abi`ディレクトリにコピーし、
[src/contracts/nft-abi.ts](src/contracts/nft-abi.ts)の`NFT_ABI`定数に反映します。

```typescript
import { abi } from "./abi/<ContractName>.json"

// NFT Contract ABI
// TODO: Replace this with actual ABI after contract deployment
export const NFT_ABI = abi
```

### 3. コントラクトアドレスの設定

`.env.local`に実際のコントラクトアドレスを設定します。

### 4. スポンサーウォレットの準備

ガス代を負担するウォレットを作成し、十分なMATICを入金します。

### 5. 画像の差し替え

`public/nft-1.svg`〜`nft-4.svg`を実際のNFT画像（1024×1024px推奨）に差し替えます。

## 本番デプロイ
**重要**: `SPONSOR_WALLET_PRIVATE_KEY`は必ず環境変数で設定し、コードにハードコードしないでください。

## セキュリティ上の注意

1. **秘密鍵の管理**: スポンサーウォレットの秘密鍵は環境変数で管理し、Gitにコミットしない
2. **IP制限**: `ALLOWED_IPS`を適切に設定し、会場のIPアドレスのみ許可する
3. **レート制限**: 本番環境では、APIルートにレート制限を実装することを推奨
4. **監視**: スポンサーウォレットの残高を監視し、十分なMATICを保持する

## トラブルシューティング

### ウォレット接続できない

- Metamaskが正しくインストールされているか確認

### ミントに失敗する

- コントラクトアドレスが正しいか確認
- ネットワーク（Polygon/Amoy）が正しく選択されているか確認
- ガス代用のMATICが十分にあるか確認

### スポンサードミントが動作しない

- `SPONSOR_WALLET_PRIVATE_KEY`が正しく設定されているか確認
- IPアドレスが`ALLOWED_IPS`に含まれているか確認
- スポンサーウォレットにMATICが十分にあるか確認