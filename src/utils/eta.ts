import type { Pigeon, Letter, WeatherEvent, WeatherType, Flight } from '../types';
import { haversine } from './distance';
import { WEATHER_FACTOR, randomWeather } from '../data/weather';
import { CITY_MAP } from '../data/cities';
import { rng } from './random';

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export interface EtaParams {
  pigeon: Pigeon;
  letter: Pick<Letter, 'content' | 'fromCityId' | 'toCityId'>;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  weather?: WeatherEvent[];  // 不传则按距离均匀生成
}

// 状态修正（饱食/心情/体力）
function stateMul(p: Pigeon): number {
  let m = 1;
  if (p.mood < 30) m *= 1.3;
  if (p.satiety < 30) m *= 1.15;
  if (p.stats.stamina < 20) m *= 1.5;
  return m;
}

// 负重修正
function weightMul(letter: EtaParams['letter']): number {
  let m = 1;
  if (letter.content.voiceUrl) m *= 1.2;
  if (letter.content.handwriting) m *= 1.1;
  m *= 1 + 0.2 * (letter.content.photos?.length || 0);
  return m;
}

// 运气修正
function luckMul(p: Pigeon): number {
  return Math.max(0.7, 1 - (p.stats.luck / 25) * 0.05);
}

// 生成飞行天气
function genWeather(distance: number): WeatherEvent[] {
  // 每 500km 一天天气
  const days = Math.max(1, Math.ceil(distance / 800));
  const arr: WeatherEvent[] = [];
  for (let i = 0; i < days; i++) {
    const t: WeatherType = randomWeather();
    arr.push({ type: t, factor: WEATHER_FACTOR[t] });
  }
  return arr;
}

// 计算平均天气系数
function weatherAvg(w: WeatherEvent[]): number {
  if (!w.length) return 1;
  return w.reduce((s, e) => s + e.factor, 0) / w.length;
}

export function calcEtaHours(p: EtaParams): { baseHours: number; finalHours: number; weather: WeatherEvent[]; distance: number } {
  const distance = haversine(p.from, p.to);
  if (distance < 1) return { baseHours: 0, finalHours: 0, weather: [], distance: 0 };
  const baseHours = (distance / p.pigeon.stats.speed) * 24;
  const weather = p.weather ?? genWeather(distance);
  let final = baseHours;
  final *= weatherAvg(weather);
  final *= stateMul(p.pigeon);
  final *= weightMul(p.letter);
  final *= luckMul(p.pigeon);
  // 至少 30 分钟
  final = Math.max(0.5, final);
  return { baseHours, finalHours: final, weather, distance };
}

// 生成飞行轨迹（按 lat/lng 线性插值，带轻微弧度）
export function buildFlightPath(from: { lat: number; lng: number }, to: { lat: number; lng: number }, hours: number, startedAt: number): Flight['path'] {
  const STEPS = 24;
  const path: Flight['path'] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    // 大圆弧度（中点抬高）
    const arc = Math.sin(t * Math.PI) * 0.3;
    path.push({
      lat: from.lat + (to.lat - from.lat) * t + arc,
      lng: from.lng + (to.lng - from.lng) * t,
      t: startedAt + hours * HOUR * t
    });
  }
  return path;
}

export { HOUR, DAY };
