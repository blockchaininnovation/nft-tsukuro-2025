// Reveal timestamp: 2026/01/01 00:00:00 JST
export const REVEAL_TIMESTAMP = 1767193200;

// Base path for assets (relative to the viewer app)
// Vite copies public/ to dist/, and import.meta.env.BASE_URL includes the configured base path
export const ASSETS_BASE_PATH = `${import.meta.env.BASE_URL}metadata`;

// Check if NFTs are revealed
export function isRevealed(): boolean {
  return Date.now() / 1000 >= REVEAL_TIMESTAMP;
}

// Team names for reference
export const TEAM_NAMES = ['Team A', 'Team B', 'Team C', 'Team D'] as const;

// Image paths for each team
export function getRevealedImagePath(team: number, variant?: number, _serial?: string): string {
  const base = `${ASSETS_BASE_PATH}/revealed`;

  switch (team) {
    case 0:
      return `${base}/0/6f74ea22efa59b15.png`;
    case 1:
      // Team 1 has 4 image variants
      const team1Images = [
        `${base}/1/Gemini_Generated_Image_6vquky6vquky6vqu.png`,
        `${base}/1/10UTBLC_dog.png`,
        `${base}/1/100UTBLC_Cat.png`,
        `${base}/1/SUBMITGemini_Generated_Image_p5loa4p5loa4p5lo.png`
      ];
      const imageIndex = variant !== undefined ? variant % 4 : 0;
      return team1Images[imageIndex];
    case 2:
      return `${base}/2/TeamC_after_reveal_Base.png`;
    case 3:
      return `${base}/3/02.webp`;
    default:
      throw new Error(`Invalid team: ${team}`);
  }
}

export function getUnrevealedImagePath(team: number): string {
  const base = `${ASSETS_BASE_PATH}/unrevealed`;

  switch (team) {
    case 0:
      return `${base}/0a5039bdc382ac2a.png`;
    case 1:
      return `${base}/B_.png`;
    case 2:
      return `${base}/TeamC_before_reveal_Base.png`;
    case 3:
      return `${base}/01_2.webp`;
    default:
      throw new Error(`Invalid team: ${team}`);
  }
}

// Get digit image path for Team 2
export function getDigitImagePath(position: 'hundreds' | 'tens' | 'ones', digit: number): string {
  const base = `${ASSETS_BASE_PATH}/revealed/2`;

  switch (position) {
    case 'hundreds':
      return `${base}/hundredsDigit/${digit}XX.png`;
    case 'tens':
      return `${base}/tensDigit/X${digit}X.png`;
    case 'ones':
      return `${base}/onceDigit/XX${digit}.png`;
    default:
      throw new Error(`Invalid position: ${position}`);
  }
}
