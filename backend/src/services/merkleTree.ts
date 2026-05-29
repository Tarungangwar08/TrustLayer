import crypto from 'crypto';

export class MerkleTree {
  private leaves: string[];
  private tree: string[][];

  constructor(leaves: string[]) {
    this.leaves = [...leaves];
    this.tree = this.buildTree(leaves);
  }

  private hashPair(left: string, right: string): string {
    const sorted = [left, right].sort();
    return crypto
      .createHash('sha256')
      .update(sorted[0] + sorted[1])
      .digest('hex');
  }

  private buildTree(leaves: string[]): string[][] {
    if (leaves.length === 0) return [[]];

    const paddedLeaves =
      leaves.length % 2 === 0
        ? [...leaves]
        : [...leaves, leaves[leaves.length - 1]];

    const tree: string[][] = [paddedLeaves];

    let currentLevel = paddedLeaves;
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] ?? currentLevel[i];
        nextLevel.push(this.hashPair(left, right));
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return tree;
  }

  getRoot(): string {
    const topLevel = this.tree[this.tree.length - 1];
    return topLevel[0] ?? '';
  }

  getProof(leafIndex: number): string[] {
    const proof: string[] = [];
    let index = leafIndex;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const currentLevel = this.tree[level];
      const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
      const sibling = currentLevel[siblingIndex] ?? currentLevel[index];
      proof.push(sibling);
      index = Math.floor(index / 2);
    }

    return proof;
  }

  static verifyProof(leafHash: string, proof: string[], root: string): boolean {
    let current = leafHash;

    for (const sibling of proof) {
      const sorted = [current, sibling].sort();
      current = crypto
        .createHash('sha256')
        .update(sorted[0] + sorted[1])
        .digest('hex');
    }

    return current === root;
  }
}
