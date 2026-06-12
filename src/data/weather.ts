import type { WeatherType } from '../types';
export const WEATHER_FACTOR: Record<WeatherType, number> = {
  sunny: 1.0, cloudy: 1.1, rain: 1.4, storm: 2.0, heavyStorm: 2.8
};
export const WEATHER_LABEL: Record<WeatherType, string> = {
  sunny:'晴', cloudy:'多云', rain:'小雨', storm:'暴雨', heavyStorm:'暴风雨'
};
export const WEATHER_EMOJI: Record<WeatherType, string> = {
  sunny:'☀️', cloudy:'⛅', rain:'🌧️', storm:'🌩️', heavyStorm:'⛈️'
};
export function randomWeather(): WeatherType {
  const r = Math.random();
  if (r < 0.55) return 'sunny';
  if (r < 0.80) return 'cloudy';
  if (r < 0.93) return 'rain';
  if (r < 0.98) return 'storm';
  return 'heavyStorm';
}
