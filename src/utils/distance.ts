import type { City } from '../types';
const R = 6371; // 地球半径 km
export function toRad(d: number) { return (d * Math.PI) / 180; }
export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function distanceLevel(km: number): '同城' | '同省' | '跨省' | '跨大区' {
  if (km < 50) return '同城';
  if (km < 500) return '同省';
  if (km < 2000) return '跨省';
  return '跨大区';
}
