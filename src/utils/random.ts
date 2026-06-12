// 简易可复现随机（带种子）
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rng = mulberry32(Date.now() & 0xffffffff);
export function randInt(min: number, max: number) { return Math.floor(rng() * (max - min + 1)) + min; }
export function pick<T>(arr: T[]): T { return arr[Math.floor(rng() * arr.length)]; }
export function id(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
