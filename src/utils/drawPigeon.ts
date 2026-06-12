// 参数化绘制一只鸽子的 SVG（按 appearance 生成）
import type { PigeonAppearance, PigeonStats } from '../types';
import { PALETTES } from '../data/breeds';

export interface DrawPigeonOptions {
  appearance: PigeonAppearance;
  size?: number;       // px
  flying?: boolean;    // 飞行姿态
  mood?: number;       // 0-100 影响表情
  stamina?: number;    // 0-100 影响精力
}

export function pigeonSvg(opts: DrawPigeonOptions): string {
  const size = opts.size ?? 96;
  const palette = opts.appearance.palette ?? PALETTES[opts.appearance.paletteId] ?? PALETTES.gray;
  const flying = !!opts.flying;
  const mood = opts.mood ?? 80;
  const stamina = opts.stamina ?? 80;
  // 配件：小红绳 / 小铃铛 / 小帽子 等
  const acc = opts.appearance.accessories;
  const hasBell = acc?.includes('acc-bell');
  const hasHat = acc?.includes('acc-hat');
  const hasBow = acc?.includes('acc-bow');
  const tired = stamina < 30;
  const sad = mood < 30;

  // 翅膀路径：飞行态展开
  const wing = flying
    ? `<path d="M${size/2} ${size*0.45} Q ${size*0.05} ${size*0.20} ${size*0.15} ${size*0.55} Z" fill="${palette.wing}" stroke="#3a342b" stroke-width="1.2" stroke-linejoin="round"/>
       <path d="M${size/2} ${size*0.45} Q ${size*0.95} ${size*0.20} ${size*0.85} ${size*0.55} Z" fill="${palette.wing}" stroke="#3a342b" stroke-width="1.2" stroke-linejoin="round"/>`
    : `<ellipse cx="${size*0.30}" cy="${size*0.55}" rx="${size*0.18}" ry="${size*0.10}" fill="${palette.wing}" stroke="#3a342b" stroke-width="1"/>
       <ellipse cx="${size*0.70}" cy="${size*0.55}" rx="${size*0.18}" ry="${size*0.10}" fill="${palette.wing}" stroke="#3a342b" stroke-width="1"/>`;

  const mouth = sad
    ? `<path d="M${size*0.46} ${size*0.46} Q ${size*0.50} ${size*0.43} ${size*0.54} ${size*0.46}" stroke="#3a342b" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    : `<path d="M${size*0.46} ${size*0.46} Q ${size*0.50} ${size*0.49} ${size*0.54} ${size*0.46}" stroke="#3a342b" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;

  const eyeY = tired ? size*0.42 : size*0.40;
  const eyeR = tired ? 1.2 : 1.8;
  const eye = `<circle cx="${size*0.46}" cy="${eyeY}" r="${eyeR}" fill="${palette.eye}"/>
    <circle cx="${size*0.54}" cy="${eyeY}" r="${eyeR}" fill="${palette.eye}"/>
    ${!tired ? `<circle cx="${size*0.47}" cy="${eyeY-0.5}" r="0.5" fill="#fff"/><circle cx="${size*0.55}" cy="${eyeY-0.5}" r="0.5" fill="#fff"/>` : ''}`;

  const bell = hasBell ? `<circle cx="${size*0.50}" cy="${size*0.30}" r="${size*0.04}" fill="#e7b75f" stroke="#7a5a2a" stroke-width="0.6"/>` : '';
  const bow = hasBow ? `<path d="M${size*0.50} ${size*0.28} l-6 -3 l0 6 z M${size*0.50} ${size*0.28} l6 -3 l0 6 z" fill="#c84a3a" stroke="#7a2a1a" stroke-width="0.5"/>` : '';
  const hat = hasHat ? `<path d="M${size*0.40} ${size*0.30} Q ${size*0.50} ${size*0.18} ${size*0.60} ${size*0.30} Z" fill="#3a342b"/>
    <rect x="${size*0.35}" y="${size*0.30}" width="${size*0.30}" height="${size*0.04}" fill="#3a342b"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${hat}
    ${bow}
    ${bell}
    <!-- body -->
    <ellipse cx="${size/2}" cy="${size*0.60}" rx="${size*0.30}" ry="${size*0.25}" fill="${palette.body}" stroke="#3a342b" stroke-width="1.2"/>
    <!-- head -->
    <circle cx="${size/2}" cy="${size*0.42}" r="${size*0.18}" fill="${palette.body}" stroke="#3a342b" stroke-width="1.2"/>
    <!-- tail -->
    <path d="M${size*0.48} ${size*0.78} L${size*0.55} ${size*0.92} L${size*0.62} ${size*0.78} Z" fill="${palette.tail}" stroke="#3a342b" stroke-width="1"/>
    <!-- beak -->
    <path d="M${size*0.50} ${size*0.45} L${size*0.46} ${size*0.49} L${size*0.50} ${size*0.51} Z" fill="${palette.beak}" stroke="#3a342b" stroke-width="0.6"/>
    ${wing}
    ${eye}
    ${mouth}
    <!-- feet -->
    ${!flying ? `<line x1="${size*0.45}" y1="${size*0.85}" x2="${size*0.45}" y2="${size*0.92}" stroke="#c98a4a" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="${size*0.55}" y1="${size*0.85}" x2="${size*0.55}" y2="${size*0.92}" stroke="#c98a4a" stroke-width="1.2" stroke-linecap="round"/>` : ''}
  </svg>`;
}
