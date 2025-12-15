import { BaseRenderer } from './BaseRenderer';
import { getRevealedImagePath, getUnrevealedImagePath } from '../utils/constants';

export class Team1Renderer extends BaseRenderer {
  getImageURLs(): string[] {
    if (this.config.isRevealed) {
      return [getRevealedImagePath(1, this.config.variant)];
    }
    return [getUnrevealedImagePath(1)];
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
  }
}
