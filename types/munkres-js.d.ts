declare module 'munkres-js' {
  export class Munkres {
    constructor();
    compute(costMatrix: number[][]): [number, number][];
  }
}
