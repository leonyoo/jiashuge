// 中国地图的极简经纬度投影（用来在小地图上画城市 + 飞行轨迹）
import { CITIES } from '../data/cities';

// 经纬度 → SVG 坐标（0..1 标准化）
export function project(lat: number, lng: number): { x: number; y: number } {
  // 中国大致范围：lat 18-54, lng 73-135
  const x = (lng - 73) / (135 - 73);
  const y = 1 - (lat - 18) / (54 - 18);
  return { x: Math.max(0.02, Math.min(0.98, x)), y: Math.max(0.02, Math.min(0.98, y)) };
}

export const CITY_POINTS = CITIES.map(c => ({ id: c.id, name: c.name, ...project(c.lat, c.lng) }));
