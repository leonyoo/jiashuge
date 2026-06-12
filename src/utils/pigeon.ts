import type { Pigeon } from '../types';
import { HOUR } from './eta';

// 衰减 tick
export function pigeonTick(p: Pigeon, now: number): Pigeon {
  const elapsedHours = (now - p.lastTickAt) / HOUR;
  if (elapsedHours < 0.01) return p;
  let satiety = p.satiety - elapsedHours;          // -1/h
  let mood = p.mood - elapsedHours / 3;             // -1/3h
  if (satiety < 30) mood -= elapsedHours * 0.5;    // 饱食 < 30 心情加速
  satiety = Math.max(0, Math.min(100, satiety));
  mood = Math.max(0, Math.min(100, mood));
  // 飞行后恢复体力
  let stamina = p.stats.stamina;
  if (p.status === 'resting') stamina = Math.min(100, stamina + elapsedHours * 5);
  if (p.status === 'flying') stamina = Math.max(0, stamina - elapsedHours * 3);
  // 升级
  const expNeeded = p.level * 30 + 30;
  let level = p.level, exp = p.exp;
  while (exp >= expNeeded) { exp -= expNeeded; level += 1; }
  return { ...p, satiety, mood, lastTickAt: now, stats: { ...p.stats, stamina }, exp, level };
}

export function canFly(p: Pigeon): { ok: boolean; reason?: string } {
  if (p.status === 'flying' || p.status === 'returning') return { ok: false, reason: '鸽子还在路上' };
  if (p.mood < 30) return { ok: false, reason: '心情太差，需要陪它玩' };
  if (p.satiety < 10) return { ok: false, reason: '太饿了，先喂点粮' };
  if (p.stats.stamina < 20) return { ok: false, reason: '体力不足，休息一会儿' };
  return { ok: true };
}

export function feedPigeon(p: Pigeon, food: { satiety: number; mood?: number; exp?: number }, now: number): Pigeon {
  return {
    ...p,
    satiety: Math.min(100, p.satiety + food.satiety),
    mood: Math.min(100, p.mood + (food.mood || 0)),
    exp: p.exp + (food.exp || 0),
    lastFedAt: now
  };
}
