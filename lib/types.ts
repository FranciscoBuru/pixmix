export interface BlockSignature {
  magnitude: number;
  direction: number;
  avgColor: { r: number; g: number; b: number };
  x: number;
  y: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: ImageData;
  signature: BlockSignature;
}

export interface MatchResult {
  sourceIndex: number;
  targetIndex: number;
  cost: number;
}
