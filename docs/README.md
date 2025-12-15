# NFT Tsukuro Viewer

React + Vite で実装された NFT 画像ビューアー。GitHub Pages で動的なシリアル番号表示を実現します。

## 概要

このビューアーは、Tsukuro 2025 NFT の `animation_url` として使用され、OpenSea などの NFT マーケットプレイスでシリアル番号を動的に表示します。

## 技術スタック

- **React 18**: UI フレームワーク
- **TypeScript**: 型安全性
- **Vite**: 高速ビルドツール
- **Canvas API**: 画像合成

## 開発

### セットアップ

```bash
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

### ビルド

```bash
pnpm build
```

ビルド出力は `../docs/viewer/` に生成されます。

## URL パラメータ

- `team`: **必須** (0-3) - チーム ID
  - `0`: Team A (静的画像)
  - `1`: Team B (静的画像)
  - `2`: Team C (数字オーバーレイ)
  - `3`: Team D (テキストオーバーレイ)
- `variant`: **オプション** (0-3) - バリアント (Team 2 で使用)
- `serial`: **Team 2, 3 で必須** (6 桁) - シリアル番号 (例: `000042`)

### URL 例

```
# Team 0 (静的画像)
https://blockchaininnovation.github.io/nft-tsukuro-2025/viewer/?team=0

# Team 2 (数字オーバーレイ)
https://blockchaininnovation.github.io/nft-tsukuro-2025/viewer/?team=2&variant=0&serial=000042

# Team 3 (テキストオーバーレイ)
https://blockchaininnovation.github.io/nft-tsukuro-2025/viewer/?team=3&serial=000123
```

## アーキテクチャ

### レンダラーパターン

各チームに対応する専用のレンダラークラスを実装:

- **Team0Renderer**: 静的画像のみ
- **Team1Renderer**: 静的画像のみ
- **Team2Renderer**: ベース画像 + 数字画像オーバーレイ (百の位、十の位、一の位)
- **Team3Renderer**: ベース画像 + Canvas テキスト描画

### ディレクトリ構造

```
src/
├── components/       # React コンポーネント
│   ├── ErrorDisplay.tsx
│   ├── LoadingSpinner.tsx
│   └── NFTCanvas.tsx
├── renderers/        # チーム別レンダラー
│   ├── BaseRenderer.ts
│   ├── Team0Renderer.ts
│   ├── Team1Renderer.ts
│   ├── Team2Renderer.ts
│   └── Team3Renderer.ts
├── hooks/            # カスタムフック
│   └── useURLParams.ts
├── utils/            # ユーティリティ
│   ├── constants.ts
│   ├── imageUtils.ts
│   └── validation.ts
├── App.tsx
├── main.tsx
└── styles.css
```

## デプロイ

GitHub Actions により自動デプロイされます:

- トリガー: `main` ブランチへの `viewer/**` または `docs/metadata/**` の変更
- デプロイ先: `gh-pages` ブランチ
- 公開 URL: `https://blockchaininnovation.github.io/nft-tsukuro-2025/viewer/`

## パフォーマンス

- バンドルサイズ: 約 48KB (gzip 圧縮後)
- 初回描画: <500ms
- 画像読み込み: 並列ロード最適化

## ライセンス

MIT
