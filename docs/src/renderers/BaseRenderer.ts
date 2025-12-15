import { loadImages } from '../utils/imageUtils';

export interface RendererConfig {
  canvas: HTMLCanvasElement;
  team: number;
  variant?: number;
  serial?: string;
  isRevealed: boolean;
}

export abstract class BaseRenderer {
  protected ctx: CanvasRenderingContext2D;
  protected config: RendererConfig;
  protected images: HTMLImageElement[] = [];

  constructor(config: RendererConfig) {
    const ctx = config.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }

    this.ctx = ctx;
    this.config = config;
  }

  abstract getImageURLs(): string[];
  abstract render(): void;

  async loadAndRender(): Promise<void> {
    const urls = this.getImageURLs();
    this.images = await loadImages(urls);
    this.render();
  }

  protected setCanvasSize(width: number, height: number): void {
    this.config.canvas.width = width;
    this.config.canvas.height = height;
  }

  protected clearCanvas(): void {
    const { canvas } = this.config;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  protected drawImage(
    img: HTMLImageElement,
    dx: number = 0,
    dy: number = 0,
    dWidth?: number,
    dHeight?: number
  ): void {
    if (dWidth !== undefined && dHeight !== undefined) {
      this.ctx.drawImage(img, dx, dy, dWidth, dHeight);
    } else {
      this.ctx.drawImage(img, dx, dy);
    }
  }
}
