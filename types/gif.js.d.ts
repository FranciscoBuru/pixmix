declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
  }

  class GIF {
    constructor(options: GIFOptions);
    addFrame(
      element: HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions
    ): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    render(): void;
  }

  export = GIF;
}
