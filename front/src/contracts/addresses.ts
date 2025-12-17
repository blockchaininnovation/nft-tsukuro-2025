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
    title: "大願成就ツシマヤマネコ・GOLD (Unrevealed)",
    description:
      "一度結ぶと容易には解けない「梅結び」を採用。固い絆の象徴であり、改ざん困難なブロックチェーンの堅牢性と、講座を通じて結ばれた卒業生の揺るぎない結束を表現しています。運命好転や魔除けの意味を持つ、新春にふさわしい吉祥デザインです。",
    image: "/img/unrevealed/0a5039bdc382ac2a.png",
  },
  {
    id: NFT_TYPES.TYPE_2,
    title: "東大ブロックチェーンコイン UTBLC (Unrevealed)",
    description:
      "このNFTは、日本の伝統的な贈答文化と最先端のブロックチェーン技術の哲学の融合から生まれました。リビールには「熨斗（のし）」の姿をまとい、価値を静かに内包します。中には金・銀・銅・アルミの4種類のUTBLCコインのいずれかを秘めています。",
    image: "/img/unrevealed/B_.png",
  },
  {
    id: NFT_TYPES.TYPE_3,
    title: "Departure of the 2025 Alumni (Unrevealed)",
    description:
      "このポチ袋は、2025年度東京大学ブロックチェーン公開講座の修了を記念して配布されました。中には、国境や従来の枠組みを超え、日本から広大なWeb3の世界へと旅立つ卒業生を描いたコインが入っています。",
    image: "/img/unrevealed/TeamC_before_reveal_Base.png",
  },
  {
    id: NFT_TYPES.TYPE_4,
    title: "月下のニャカモト ～共創の調べ～ (Unrevealed)",
    description:
      "元旦にお年玉として登場する架空のデジタルアセット「ニャカモト」のイメージは、卒業生が将来的にサトシ・ナカモトのように国際社会で認められ、その評価が月まで届くほど高まることを期待してデザインされました。",
    image: "/img/unrevealed/01_2.webp",
  },
] as const;
