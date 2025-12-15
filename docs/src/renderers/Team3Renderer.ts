import { BaseRenderer } from './BaseRenderer';
import { getRevealedImagePath, getUnrevealedImagePath } from '../utils/constants';

export class Team3Renderer extends BaseRenderer {
  getImageURLs(): string[] {
    if (this.config.isRevealed) {
      return [getRevealedImagePath(3)];
    }
    return [getUnrevealedImagePath(3)];
  }

  render(): void {
    const baseImage = this.images[0];
    if (!baseImage) {
      throw new Error('Base image not loaded');
    }

    const width = baseImage.naturalWidth;
    const height = baseImage.naturalHeight;

    this.setCanvasSize(width, height);
    this.clearCanvas();
    this.drawImage(baseImage, 0, 0);

    // If revealed and serial is provided, overlay serial number as text
    if (this.config.isRevealed && this.config.serial) {
      this.drawSerialText(width, height);
    }
  }

  private drawSerialText(width: number, height: number): void {
    const { serial } = this.config;
    if (!serial) return;

    const fontSize = Math.floor(width * 0.07);
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillStyle = '#d1d5db';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    // Shadow for visibility
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    this.ctx.shadowBlur = Math.max(8, Math.floor(fontSize / 10));
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = Math.max(4, Math.floor(fontSize / 30));

    // Position text (similar to token page implementation)
    const xPos = width * 0.65;
    const yPos = height * 0.85;

    this.ctx.fillText(serial, xPos, yPos);

    // Reset shadow
    this.ctx.shadowColor = 'transparent';
  }
}
