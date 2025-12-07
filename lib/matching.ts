import { Block, MatchResult } from './types';

/**
 * Calculate cost between two block signatures
 */
export function calculateCost(
  sourceBlock: Block,
  targetBlock: Block,
  gradientWeight: number
): number {
  const colorWeight = 1 - gradientWeight;

  // Gradient difference (magnitude and direction)
  const magDiff = Math.abs(
    sourceBlock.signature.magnitude - targetBlock.signature.magnitude
  );

  // Direction difference (handle circular nature of angles)
  let dirDiff = Math.abs(
    sourceBlock.signature.direction - targetBlock.signature.direction
  );
  if (dirDiff > Math.PI) {
    dirDiff = 2 * Math.PI - dirDiff;
  }

  const gradientCost = magDiff + dirDiff * 10; // Weight direction difference

  // Color difference (Euclidean distance in RGB space)
  const rDiff = sourceBlock.signature.avgColor.r - targetBlock.signature.avgColor.r;
  const gDiff = sourceBlock.signature.avgColor.g - targetBlock.signature.avgColor.g;
  const bDiff = sourceBlock.signature.avgColor.b - targetBlock.signature.avgColor.b;
  const colorCost = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

  return gradientWeight * gradientCost + colorWeight * colorCost;
}

/**
 * Find matching using Greedy algorithm (fast but not optimal)
 */
export function findGreedyMatching(
  sourceBlocks: Block[],
  targetBlocks: Block[],
  gradientWeight: number
): MatchResult[] {
  const n = sourceBlocks.length;
  const results: MatchResult[] = [];
  const usedTargets = new Set<number>();

  // For each target position, find the best available source block
  for (let targetIdx = 0; targetIdx < n; targetIdx++) {
    let bestSourceIdx = -1;
    let bestCost = Infinity;

    for (let sourceIdx = 0; sourceIdx < n; sourceIdx++) {
      if (usedTargets.has(sourceIdx)) continue;

      const cost = calculateCost(sourceBlocks[sourceIdx], targetBlocks[targetIdx], gradientWeight);
      if (cost < bestCost) {
        bestCost = cost;
        bestSourceIdx = sourceIdx;
      }
    }

    if (bestSourceIdx !== -1) {
      usedTargets.add(bestSourceIdx);
      results.push({
        sourceIndex: bestSourceIdx,
        targetIndex: targetIdx,
        cost: bestCost,
      });
    }
  }

  return results;
}
