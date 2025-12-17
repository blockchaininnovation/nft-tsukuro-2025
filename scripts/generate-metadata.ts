import * as fs from "fs";
import * as path from "path";

// =============================================================================
// 定数定義
// =============================================================================

const GITHUB_PAGES_URL = "https://blockchaininnovation.github.io/nft-tsukuro-2025";
const OUTPUT_DIR = path.join(__dirname, "../assets");
const MAX_SERIALS = 300;

// =============================================================================
// 型定義
// =============================================================================

interface Attribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

interface TeamConfig {
  name: string;
  unrevealedDescription: string;
  revealedDescription: string;
  images: {
    unrevealed: string;
    revealed: string;
  };
  attributes: {
    unrevealed: Attribute[];
    revealed: Attribute[];
  };
}

interface TeamBVariantConfig {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

// =============================================================================
// 画像パス定義
// =============================================================================

const IMAGE_PATHS = {
  unrevealed: {
    0: "0a5039bdc382ac2a.png",
    1: "B_.png",
    2: "TeamC_before_reveal_Base.png",
    3: "01_2.webp",
  },
  revealed: {
    0: "0/6f74ea22efa59b15.png",
    1: [
      "1/Gemini_Generated_Image_6vquky6vquky6vqu.png", // variant 0
      "1/10UTBLC_dog.png", // variant 1
      "1/100UTBLC_Cat.png", // variant 2
      "1/SUBMITGemini_Generated_Image_p5loa4p5loa4p5lo.png", // variant 3
    ],
    2: "2/TeamC_after_reveal_Base.png",
    3: "3/02.webp",
  },
} as const;

// =============================================================================
// Team A (チーム0) 設定
// =============================================================================

const TEAM_A_CONFIG: TeamConfig = {
  name: "大願成就ツシマヤマネコ・GOLD",
  unrevealedDescription: `一度結ぶと容易には解けない「梅結び」を採用。固い絆の象徴であり、改ざん困難なブロックチェーンの堅牢性と、講座を通じて結ばれた卒業生の揺るぎない結束を表現しています。運命好転や魔除けの意味を持つ、新春にふさわしい吉祥デザインです。`,
  revealedDescription: `大願成就を象徴する「ツシマヤマネコ」。日本固有の力強さを纏い、アカデミックな卒業ローブを翻して社会へ飛び出す姿は、私たち受講生の未来そのものです。高く掲げた両手は、ブロックチェーンがもたらす「経済的価値」と「人の和」の両方を呼び込みます。コインに刻まれた「522」は、2010年5月22日の「ビットコイン・ピザ・デー」へのオマージュ。机上の学びで終わらせず、実社会で価値を生み出す人材になるという願いを込めて。`,
  images: {
    unrevealed: IMAGE_PATHS.unrevealed[0],
    revealed: IMAGE_PATHS.revealed[0],
  },
  attributes: {
    unrevealed: [
      { trait_type: "ACADEMIC YEAR", value: "2025" },
      { trait_type: "TEAM", value: "A" },
      { trait_type: "MIZUHIKI", value: "Ume Knot" },
    ],
    revealed: [
      { trait_type: "ACADEMIC YEAR", value: "2025" },
      { trait_type: "TEAM", value: "A" },
      { trait_type: "MIZUHIKI", value: "Ume Knot" },
      { trait_type: "CAT", value: "Tsushima Leopard Cat" },
      { trait_type: "HAT", value: "Mortarboard" },
      { trait_type: "CLOTH", value: "Graduation Gown" },
      { trait_type: "COIN", value: "Gold" },
      { trait_type: "AMOUNT", value: 522 },
      { trait_type: "OTHER", value: "Beckoning with Both Paws" },
    ],
  },
};

// =============================================================================
// Team B (チーム1) 設定
// =============================================================================

const TEAM_B_UNREVEALED_DESCRIPTION = `このNFTは、日本の伝統的な贈答文化と最先端のブロックチェーン技術の哲学の融合から生まれました。

リビールには「熨斗（のし）」の姿をまとい、価値を静かに内包します。熨斗は、古の人々が鮑（あわび）を押し伸ばし乾かし、贈り物に「心」を添えたことに由来する、日本文化の象徴。チームbのお年玉袋の熨斗には、手仕事の温かさ、相手を思う気持ちが込められています。

この伝統的な包みには、デジタル価値に物理的な存在感を与える試みを秘めています。左下に配された紅い三角形からは、中に秘められたコインを包むガチャボールが今にも転がり落ちようとしています。

中には金・銀・銅・アルミの4種類のUTBLCコインのいずれかを秘めています。「見えない重み」が作用し、玉結びの水引は本来の位置からわずかにずれ、その歪みは、デジタルデータが物理世界に影響を及ぼす様を視覚的に表現した存在証明です。`;

const TEAM_B_REVEALED_DESCRIPTION = `UTBLCの哲学的基盤 ——「コードが法となる」
ガチャボールに秘められたUTBLC（UTokyo Blockchain Coin）の思想的基盤は、サトシナカモトが設計したビットコインにあります。サトシは、中央集権的な仲介者への「信頼」を排除し、数学的証明と暗号技術を据えました。Proof-of-Work（PoW）による膨大な計算がデジタル価値を物理的コストに裏打ちされた「困難なビット」として証明します。「コードが法となる」——計算と検証こそが秩序を生むという哲学を学術的に継承し、東京大学ブロックチェーン公開講座から生まれたのがUTBLCです。

4種のコインが描く、ステーブルな調和世界
UTBLCチェーンでは、物理的な重みと象徴性をもつ4つの独立コインが調和した世界観を形づくります。

1 UTBLC／アルミの猫：「始原」——すべての革新は、一つのトランザクションから始まる
10 UTBLC／ブロンズの犬：「信頼」——連帯と継続を支える基盤
100 UTBLC／シルバーの猫：「理性」——自由と秩序を両立させる知性
1000 UTBLC／ゴールドの犬：「主権」——トラストレスな世界で成立する自律的忠誠

学びの出発点としてのSBT
このコレクションは、ブロックチェーンを「学ぶ」だけでなく、NFTを作ることで理解したいという想いから生まれた、コミュニティ共創の成果です。参加者全員で一つのコレクションを完成させ、ミントまで到達する——それは学びの成果を刻む、出発点そのものです。

形式はOpen Edition、チェーンはPolygon。ガス代は東京大学側が全額負担し、参加者は無料でミントできます。さあ、ガチャガチャ感覚でMINTしてみてください。その一枚は、あなたにとってどんな「価値の始まり」になるでしょうか。

シリアル番号がもたらす、保有履歴の完全な透明性

UTBLCの最大の特徴は、発行される全てのコインに固有のシリアル番号が付与される点にあります。このSBT（Soulbound Token）は譲渡不可能であり、発行から保有に至るまでの系譜がブロックチェーン上に恒久的に刻まれます。

現実世界の硬貨は一度流通すると個別の追跡が不可能ですが、UTBLCは最小単位に至るまでシリアル番号によってアイデンティティが管理されます。これにより、そのコインが「いつ、誰に対して、どのような学びの証として発行されたか」という出自の真正性を誰でも確認することが可能です。不正な複製や身元の偽装を許さないこの仕組みは、デジタル空間における純粋な信頼の基盤となります。

4つのコインに刻まれたシリアル番号は、あなたの学びの軌跡を唯一無二の存在として証明します。さあ、あなたの「証」をミントしましょう。`;

const TEAM_B_UNREVEALED_ATTRIBUTES: Attribute[] = [
  { trait_type: "AcademicYear", value: "2025" },
  { trait_type: "Team", value: "b" },
  { trait_type: "KnotType", value: "a ball knot" },
  { trait_type: "StrandMaterial", value: "quad-phase cord composed of Au, Ag, Cu, and Al" },
  { trait_type: "StrandType", value: "Metallic-Treated Silk-Wrapped Cord" },
  { trait_type: "NoshiBukuroType", value: "Otoshidama envelope" },
  { trait_type: "NoshiFabric", value: "Hand-formed (shape)" },
  { trait_type: "AccentShape", value: "Right Triangle" },
  { trait_type: "AccentColor", value: "Vermilion & Coin GachaPon" },
];

const TEAM_B_VARIANTS: TeamBVariantConfig[] = [
  // variant 0: 1 UTBLC（決意：パイオニア・キャット）
  {
    name: "1 UTBLC（決意：パイオニア・キャット）",
    description: TEAM_B_REVEALED_DESCRIPTION,
    image: IMAGE_PATHS.revealed[1][0],
    attributes: [
      { trait_type: "ACADEMIC YEAR", value: "2025年度" },
      { trait_type: "TEAM", value: "チームB" },
      { trait_type: "VALUE", value: "1 UTBLC (最小額面)" },
      { trait_type: "Rarity Tier", value: "Pioneer Genesis (始原/パイオニア精神)" },
      { trait_type: "Material", value: "Aluminum (アルミニウム)" },
      { trait_type: "Pioneer Symbol", value: "Pioneer Cat (パイオニア・キャット)" },
      { trait_type: "Core Philosophy", value: "The Single Resolve (たった一つの決意)" },
      { trait_type: "Primary Focus", value: "Infinite Possibility (無限の可能性)" },
      { trait_type: "Conceptual Role", value: "First Courage (最初の勇気)" },
    ],
  },
  // variant 1: 10 UTBLC（連帯：ブロンズ・コンパニオン）
  {
    name: "10 UTBLC（連帯：ブロンズ・コンパニオン）",
    description: TEAM_B_REVEALED_DESCRIPTION,
    image: IMAGE_PATHS.revealed[1][1],
    attributes: [
      { trait_type: "ACADEMIC YEAR", value: "2025年度" },
      { trait_type: "TEAM", value: "チームB" },
      { trait_type: "VALUE", value: "10 UTBLC" },
      { trait_type: "Rarity Tier", value: "Foundational Solidarity (基礎的な連帯)" },
      { trait_type: "Material", value: "Bronze (ブロンズ)" },
      { trait_type: "Companion Symbol", value: "Bronze Companion (ブロンズの仲間)" },
      { trait_type: "Core Philosophy", value: "Trust Built by Code (コードによって構築される信頼)" },
      { trait_type: "Primary Focus", value: "Universal Network Right (普遍的なネットワーク利用権)" },
      { trait_type: "Conceptual Role", value: "Unwavering Foundation (揺るぎない礎)" },
    ],
  },
  // variant 2: 100 UTBLC（叡智：シルバー・ニャカモト）
  {
    name: "100 UTBLC（叡智：シルバー・ニャカモト）",
    description: TEAM_B_REVEALED_DESCRIPTION,
    image: IMAGE_PATHS.revealed[1][2],
    attributes: [
      { trait_type: "ACADEMIC YEAR", value: "2025年度" },
      { trait_type: "TEAM", value: "チームB" },
      { trait_type: "VALUE", value: "100 UTBLC" },
      { trait_type: "Rarity Tier", value: "Intelligent Wisdom (叡智)" },
      { trait_type: "Material", value: "Silver (銀)" },
      { trait_type: "Intelligence Symbol", value: "Silver Nyakamoto (シルバー・ニャカモト)" },
      { trait_type: "Core Philosophy", value: "Cryptographic Proof (暗号学的証明)" },
      { trait_type: "Primary Focus", value: "New Value Generation (新しい価値の創出)" },
      { trait_type: "Conceptual Role", value: "Order of Liberty and Reason (自由と理性の秩序)" },
    ],
  },
  // variant 3: 1000 UTBLC（至宝：黄金の守護者）
  {
    name: "1000 UTBLC（至宝：黄金の守護者）",
    description: TEAM_B_REVEALED_DESCRIPTION,
    image: IMAGE_PATHS.revealed[1][3],
    attributes: [
      { trait_type: "ACADEMIC YEAR", value: "2025年度" },
      { trait_type: "TEAM", value: "チームB" },
      { trait_type: "VALUE", value: "1000 UTBLC (最高額面)" },
      { trait_type: "Rarity Tier", value: "Sovereign Artifact (至宝)" },
      { trait_type: "Material", value: "Gold (黄金)" },
      { trait_type: "Guardian Symbol", value: "Golden Guardian (黄金の守護者)" },
      { trait_type: "Core Philosophy", value: "Autonomous Loyalty (自律的な忠誠心)" },
      { trait_type: "Primary Focus", value: "Permanent Inquiry (恒久的な知の探求)" },
      { trait_type: "Conceptual Role", value: "Trustless Sovereign (トラストレスな主権を持つ存在)" },
    ],
  },
];

// =============================================================================
// Team C (チーム2) 設定
// =============================================================================

const TEAM_C_DESCRIPTION = `This pochi bag was distributed to commemorate the completion of the 2025 UTokyo Blockchain Open Lecture Course. Inside is a coin depicting alumni setting off from Japan into the vast world of Web3, beyond borders and conventional frameworks.

May the relationships within the cohort who studied together in the same course at the same time continue, allowing them to celebrate one another's future achievements.`;

const TEAM_C_CONFIG: TeamConfig = {
  name: "Departure of the 2025 Alumni",
  unrevealedDescription: TEAM_C_DESCRIPTION,
  revealedDescription: TEAM_C_DESCRIPTION,
  images: {
    unrevealed: IMAGE_PATHS.unrevealed[2],
    revealed: IMAGE_PATHS.revealed[2],
  },
  attributes: {
    unrevealed: [
      { trait_type: "ACADEMIC YEAR", value: "2025" },
      { trait_type: "TEAM", value: "C" },
      { trait_type: "MIZUHIKI", value: "Butterfly knot" },
      { trait_type: "CAT", value: "Calico" },
      { trait_type: "COLOR", value: "Silver" },
      { trait_type: "OTHER", value: "From Japan to Web3" },
    ],
    revealed: [
      { trait_type: "ACADEMIC YEAR", value: "2025" },
      { trait_type: "TEAM", value: "C" },
      { trait_type: "MIZUHIKI", value: "Butterfly knot" },
      { trait_type: "CAT", value: "Calico" },
      { trait_type: "COLOR", value: "Silver" },
      { trait_type: "OTHER", value: "From Japan to Web3" },
    ],
  },
};

// =============================================================================
// Team D (チーム3) 設定
// =============================================================================

const TEAM_D_DESCRIPTION = `元旦にお年玉として登場する架空のデジタルアセット「ニャカモト」のイメージは、卒業生が将来的にサトシ・ナカモトのように国際社会で認められ、その評価が月まで届くほど高まることを期待してデザインされました。

このNFTは柔らかい色彩や曲線をベースとしたデザインで、不協和から時間の経過とともに調和を形成する様子を表現しています。

貨幣を基盤とする利己的な資本主義の弊害が指摘される昨今、和を結ぶことによって温かい人とのつながりを実現する。日本的な共生の思考は真の価値を提供するものであると考えます。`;

const TEAM_D_CONFIG: TeamConfig = {
  name: "月下のニャカモト ～共創の調べ～",
  unrevealedDescription: TEAM_D_DESCRIPTION,
  revealedDescription: TEAM_D_DESCRIPTION,
  images: {
    unrevealed: IMAGE_PATHS.unrevealed[3],
    revealed: IMAGE_PATHS.revealed[3],
  },
  attributes: {
    unrevealed: [
      { trait_type: "受講年度", value: "2025" },
      { trait_type: "チーム", value: "D" },
      { trait_type: "水引き", value: "蝶結び" },
      { trait_type: "猫", value: "月猫" },
      { trait_type: "色", value: "夢色" },
      { trait_type: "その他", value: "月、和風、猫、達成記念、東大ブロックチェーン公開講座、和紙、調和、共創、和の誘引" },
    ],
    revealed: [
      { trait_type: "受講年度", value: "2025" },
      { trait_type: "チーム", value: "D" },
      { trait_type: "水引き", value: "蝶結び" },
      { trait_type: "猫", value: "月猫" },
      { trait_type: "色", value: "夢色" },
      { trait_type: "その他", value: "月、和風、猫、達成記念、東大ブロックチェーン公開講座、和紙、調和、共創、和の誘引" },
    ],
  },
};

// =============================================================================
// ヘルパー関数
// =============================================================================

function getImageUrl(relativePath: string, isUnrevealed: boolean): string {
  const base = isUnrevealed ? "unrevealed" : "revealed";
  return `${GITHUB_PAGES_URL}/metadata/${base}/${relativePath}`;
}

function getAnimationUrl(teamId: number, serialNumber?: number, variant?: number): string {
  const base = GITHUB_PAGES_URL;
  const serialPadded = serialNumber?.toString().padStart(6, "0");

  switch (teamId) {
    case 0:
      // Team A: シリアル番号不要
      return `${base}/?team=0`;
    case 1:
      // Team B: variantパラメータを使用
      return variant !== undefined
        ? `${base}/?team=1&variant=${variant}`
        : `${base}/?team=1`;
    case 2:
      // Team C: シリアル番号必須
      return serialPadded
        ? `${base}/?team=2&serial=${serialPadded}`
        : `${base}/?team=2`;
    case 3:
      // Team D: シリアル番号必須
      return serialPadded
        ? `${base}/?team=3&serial=${serialPadded}`
        : `${base}/?team=3`;
    default:
      throw new Error(`Invalid team ID: ${teamId}`);
  }
}

// =============================================================================
// メタデータ生成関数
// =============================================================================

function generateUnrevealedMetadata(teamId: number): object {
  switch (teamId) {
    case 0: {
      return {
        name: `${TEAM_A_CONFIG.name} (Unrevealed)`,
        description: TEAM_A_CONFIG.unrevealedDescription,
        image: getImageUrl(TEAM_A_CONFIG.images.unrevealed, true),
        animation_url: getAnimationUrl(0),
        attributes: TEAM_A_CONFIG.attributes.unrevealed,
      };
    }
    case 1: {
      return {
        name: "東大ブロックチェーンコイン UTBLC (Unrevealed)",
        description: TEAM_B_UNREVEALED_DESCRIPTION,
        image: getImageUrl(IMAGE_PATHS.unrevealed[1], true),
        animation_url: getAnimationUrl(1),
        attributes: TEAM_B_UNREVEALED_ATTRIBUTES,
      };
    }
    case 2: {
      return {
        name: `${TEAM_C_CONFIG.name} (Unrevealed)`,
        description: TEAM_C_CONFIG.unrevealedDescription,
        image: getImageUrl(TEAM_C_CONFIG.images.unrevealed, true),
        animation_url: getAnimationUrl(2),
        attributes: TEAM_C_CONFIG.attributes.unrevealed,
      };
    }
    case 3: {
      return {
        name: `${TEAM_D_CONFIG.name} (Unrevealed)`,
        description: TEAM_D_CONFIG.unrevealedDescription,
        image: getImageUrl(TEAM_D_CONFIG.images.unrevealed, true),
        animation_url: getAnimationUrl(3),
        attributes: TEAM_D_CONFIG.attributes.unrevealed,
      };
    }
    default:
      throw new Error(`Invalid team ID: ${teamId}`);
  }
}

function generateRevealedMetadata(
  teamId: number,
  serialNumber: number,
  variant?: number
): object {
  const serialPadded = serialNumber.toString().padStart(6, "0");

  switch (teamId) {
    case 0: {
      const attributes: Attribute[] = [
        ...TEAM_A_CONFIG.attributes.revealed,
        { trait_type: "Serial Number", display_type: "number", value: serialNumber },
      ];
      return {
        name: `${TEAM_A_CONFIG.name} #${serialPadded}`,
        description: TEAM_A_CONFIG.revealedDescription,
        image: getImageUrl(TEAM_A_CONFIG.images.revealed, false),
        animation_url: getAnimationUrl(0, serialNumber),
        attributes,
      };
    }
    case 1: {
      if (variant === undefined || variant < 0 || variant > 3) {
        throw new Error(`Invalid variant for Team B: ${variant}`);
      }
      const variantConfig = TEAM_B_VARIANTS[variant];
      const attributes: Attribute[] = [
        ...variantConfig.attributes,
        { trait_type: "Serial Number", display_type: "number", value: serialNumber },
        { trait_type: "Variant", value: variant },
      ];
      return {
        name: `東大ブロックチェーンコイン UTBLC - ${variantConfig.name} #${serialPadded}`,
        description: variantConfig.description,
        image: getImageUrl(variantConfig.image, false),
        animation_url: getAnimationUrl(1, serialNumber, variant),
        attributes,
      };
    }
    case 2: {
      const attributes: Attribute[] = [
        ...TEAM_C_CONFIG.attributes.revealed,
        { trait_type: "Serial Number", display_type: "number", value: serialNumber },
      ];
      return {
        name: `${TEAM_C_CONFIG.name} #${serialPadded}`,
        description: TEAM_C_CONFIG.revealedDescription,
        image: getImageUrl(TEAM_C_CONFIG.images.revealed, false),
        animation_url: getAnimationUrl(2, serialNumber),
        attributes,
      };
    }
    case 3: {
      const attributes: Attribute[] = [
        ...TEAM_D_CONFIG.attributes.revealed,
        { trait_type: "Serial Number", display_type: "number", value: serialNumber },
      ];
      return {
        name: `${TEAM_D_CONFIG.name} #${serialPadded}`,
        description: TEAM_D_CONFIG.revealedDescription,
        image: getImageUrl(TEAM_D_CONFIG.images.revealed, false),
        animation_url: getAnimationUrl(3, serialNumber),
        attributes,
      };
    }
    default:
      throw new Error(`Invalid team ID: ${teamId}`);
  }
}

// =============================================================================
// メイン生成関数
// =============================================================================

function generateAllMetadata() {
  console.log("Generating metadata files...\n");
  console.log(`MAX_SERIALS: ${MAX_SERIALS}`);
  console.log(`OUTPUT_DIR: ${OUTPUT_DIR}\n`);

  // -------------------------------------------------------------------------
  // Unrevealed メタデータ生成
  // -------------------------------------------------------------------------
  const unrevealedDir = path.join(OUTPUT_DIR, "unrevealed");
  fs.mkdirSync(unrevealedDir, { recursive: true });

  for (let teamId = 0; teamId <= 3; teamId++) {
    const metadata = generateUnrevealedMetadata(teamId);
    const filePath = path.join(unrevealedDir, `${teamId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    console.log(`✓ Created: unrevealed/${teamId}.json`);
  }

  console.log("");

  // -------------------------------------------------------------------------
  // Revealed メタデータ生成
  // -------------------------------------------------------------------------
  const revealedDir = path.join(OUTPUT_DIR, "revealed");

  // Team 0 (Team A): 300ファイル
  const team0Dir = path.join(revealedDir, "0");
  fs.mkdirSync(team0Dir, { recursive: true });
  for (let serial = 1; serial <= MAX_SERIALS; serial++) {
    const metadata = generateRevealedMetadata(0, serial);
    fs.writeFileSync(
      path.join(team0Dir, `${serial}.json`),
      JSON.stringify(metadata, null, 2)
    );
  }
  console.log(`✓ Created: revealed/0/ (${MAX_SERIALS} files)`);

  // Team 1 (Team B): 300 × 4 = 1200ファイル
  const team1Dir = path.join(revealedDir, "1");
  fs.mkdirSync(team1Dir, { recursive: true });
  let team1Count = 0;
  for (let serial = 1; serial <= MAX_SERIALS; serial++) {
    for (let variant = 0; variant < 4; variant++) {
      const metadata = generateRevealedMetadata(1, serial, variant);
      const filename = `${serial}-${variant}.json`;
      fs.writeFileSync(
        path.join(team1Dir, filename),
        JSON.stringify(metadata, null, 2)
      );
      team1Count++;
    }
  }
  console.log(`✓ Created: revealed/1/ (${team1Count} files)`);

  // Team 2 (Team C): 300ファイル
  const team2Dir = path.join(revealedDir, "2");
  fs.mkdirSync(team2Dir, { recursive: true });
  for (let serial = 1; serial <= MAX_SERIALS; serial++) {
    const metadata = generateRevealedMetadata(2, serial);
    fs.writeFileSync(
      path.join(team2Dir, `${serial}.json`),
      JSON.stringify(metadata, null, 2)
    );
  }
  console.log(`✓ Created: revealed/2/ (${MAX_SERIALS} files)`);

  // Team 3 (Team D): 300ファイル
  const team3Dir = path.join(revealedDir, "3");
  fs.mkdirSync(team3Dir, { recursive: true });
  for (let serial = 1; serial <= MAX_SERIALS; serial++) {
    const metadata = generateRevealedMetadata(3, serial);
    fs.writeFileSync(
      path.join(team3Dir, `${serial}.json`),
      JSON.stringify(metadata, null, 2)
    );
  }
  console.log(`✓ Created: revealed/3/ (${MAX_SERIALS} files)`);

  // -------------------------------------------------------------------------
  // サマリー
  // -------------------------------------------------------------------------
  const totalUnrevealed = 4;
  const totalRevealed = MAX_SERIALS * 3 + team1Count; // Teams 0, 2, 3 + Team 1
  const total = totalUnrevealed + totalRevealed;

  console.log("\n✨ All metadata files generated successfully!");
  console.log(`📁 Total files: ${total}`);
  console.log(`   - Unrevealed: ${totalUnrevealed}`);
  console.log(`   - Revealed: ${totalRevealed}`);
  console.log(`     - Team A: ${MAX_SERIALS}`);
  console.log(`     - Team B: ${team1Count} (${MAX_SERIALS} serials × 4 variants)`);
  console.log(`     - Team C: ${MAX_SERIALS}`);
  console.log(`     - Team D: ${MAX_SERIALS}`);
}

// =============================================================================
// 実行
// =============================================================================

generateAllMetadata();
