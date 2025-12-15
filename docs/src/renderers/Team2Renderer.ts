import { BaseRenderer } from './BaseRenderer';
import { getRevealedImagePath, getUnrevealedImagePath, getDigitImagePath } from '../utils/constants';

export class Team2Renderer extends BaseRenderer {
  getImageURLs(): string[] {
    if (!this.config.isRevealed) {
      return [getUnrevealedImagePath(2)];
    }

    const urls: string[] = [getRevealedImagePath(2)];

    // If serial is provided, load digit overlay images
    if (this.config.serial) {
      const serialNum = parseInt(this.config.serial, 10);
      const hundreds = Math.floor(serialNum / 100);
      const tens = Math.floor((serialNum % 100) / 10);
      const ones = serialNum % 10;

      urls.push(
        getDigitImagePath('hundreds', hundreds),
        getDigitImagePath('tens', tens),
        getDigitImagePath('ones', ones)
      );
    }

    return urls;
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

    // Draw base image
    this.drawImage(baseImage, 0, 0);

    // If revealed and digit overlays are loaded, composite them
    if (this.config.isRevealed && this.images.length > 1) {
      this.drawDigitOverlays(width, height);
    }
  }

  private drawDigitOverlays(width: number, height: number): void {
    // Digit overlay images are at indices 1, 2, 3
    const hundredsImg = this.images[1];
    const tensImg = this.images[2];
    const onesImg = this.images[3];

    if (!hundredsImg || !tensImg || !onesImg) {
      console.warn('Some digit images failed to load');
      return;
    }

    // Draw digit overlays
    // Each digit overlay should be positioned to cover the entire canvas
    // since they are designed as full-size overlays with transparent backgrounds
    this.drawImage(hundredsImg, 0, 0, width, height);
    this.drawImage(tensImg, 0, 0, width, height);
    this.drawImage(onesImg, 0, 0, width, height);
  }
}
