// 格式化工具
export function formatCoins(n: number): string {
  if (n >= 100000) return (n / 10000).toFixed(1) + '万';
  return n.toString();
}
export function formatHours(h: number): string {
  if (h < 1) return Math.round(h * 60) + ' 分钟';
  if (h < 24) return h.toFixed(1) + ' 小时';
  const d = Math.floor(h / 24);
  const r = Math.round(h - d * 24);
  return d + ' 天' + (r > 0 ? ' ' + r + ' 小时' : '');
}
export function formatDistance(km: number): string {
  if (km < 1) return Math.round(km * 1000) + ' m';
  if (km < 10) return km.toFixed(1) + ' km';
  return Math.round(km) + ' km';
}
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.getMonth() + 1 + '月' + d.getDate() + '日 ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}
export function formatRelative(ts: number, now = Date.now()): string {
  const diff = ts - now;
  if (diff <= 0) return '已送达';
  return '还需 ' + formatHours(diff / 3600_000);
}
export function todayKey(d = new Date()): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
}
