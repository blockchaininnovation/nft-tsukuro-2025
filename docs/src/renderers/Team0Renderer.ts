import { BaseRenderer } from './BaseRenderer';
import { getRevealedImagePath, getUnrevealedImagePath } from '../utils/constants';

export class Team0Renderer extends BaseRenderer {
  getImageURLs(): string[] {
    if (this.config.isRevealed) {
      return [getRevealedImagePath(0)];
    }
    return [getUnrevealedImagePath(0)];
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
