import type { PigeonBreed, PigeonAppearance } from '../types';

export interface BreedDef {
  id: PigeonBreed; name: string; speed: number; endurance: number;
  luck: number; stamina: number; price: number; desc: string;
  paletteId: string; patternId: string;
}
export const BREEDS: BreedDef[] = [
  {
    id: 'common', name: '普通鸽', speed: 50, endurance: 500,
    luck: 30, stamina: 80, price: 0,
    desc: '朴实的家鸽，温顺好养。', paletteId: 'gray', patternId: 'solid'
  },
  {
    id: 'racing', name: '赛鸽', speed: 110, endurance: 300,
    luck: 40, stamina: 70, price: 500,
    desc: '速度型选手，500公里内闪电送达。', paletteId: 'white', patternId: 'racing'
  },
  {
    id: 'homing', name: '归巢鸽', speed: 70, endurance: 900,
    luck: 50, stamina: 90, price: 800,
    desc: '耐力惊人，能飞越千山万水。', paletteId: 'brown', patternId: 'barred'
  },
  {
    id: 'swift', name: '雨燕', speed: 140, endurance: 220,
    luck: 35, stamina: 60, price: 1200,
    desc: '极快但娇贵，长途易累。', paletteId: 'black', patternId: 'swift'
  },
  {
    id: 'messenger', name: '传书鸽', speed: 95, endurance: 1100,
    luck: 75, stamina: 85, price: 5000,
    desc: '古老信鸽后裔，幸运与耐力俱佳。', paletteId: 'blue', patternId: 'messenger'
  },
  {
    id: 'mottled', name: '花斑鸽', speed: 60, endurance: 650,
    luck: 55, stamina: 75, price: 1500,
    desc: '灵动机敏，常有意外惊喜。', paletteId: 'mottled', patternId: 'mottled'
  },
  {
    id: 'snow', name: '雪鸽', speed: 75, endurance: 700,
    luck: 45, stamina: 80, price: 2200,
    desc: '白羽如雪，温润如玉。', paletteId: 'snow', patternId: 'snow'
  },
  {
    id: 'lavender', name: '紫丁香鸽', speed: 65, endurance: 800,
    luck: 60, stamina: 80, price: 3500,
    desc: '淡紫羽毛，神秘优雅。', paletteId: 'lavender', patternId: 'lavender'
  },
  {
    id: 'golden', name: '金羽鸽', speed: 80, endurance: 950,
    luck: 70, stamina: 90, price: 8000,
    desc: '传说的金羽，幸运+1。', paletteId: 'golden', patternId: 'golden'
  },
  {
    id: 'phoenix', name: '凤凰鸽', speed: 130, endurance: 1500,
    luck: 90, stamina: 100, price: 20000,
    desc: '羽色如火，只在春节限定登场。', paletteId: 'phoenix', patternId: 'phoenix'
  }
];
export const BREED_MAP: Record<PigeonBreed, BreedDef> = Object.fromEntries(BREEDS.map(b => [b.id, b])) as any;

// 调色板（用于个性化）
export interface Palette { id: string; body: string; wing: string; beak: string; tail: string; eye: string; }
export const PALETTES: Record<string, Palette> = {
  gray:    { id:'gray',    body:'#b9c4a8', wing:'#9aa890', beak:'#8a6f4a', tail:'#7a8470', eye:'#2b2b2b' },
  white:   { id:'white',   body:'#f5f0e1', wing:'#e6dfcb', beak:'#c98a4a', tail:'#d6cbac', eye:'#3a342b' },
  brown:   { id:'brown',   body:'#a87650', wing:'#7d4f31', beak:'#5a3a23', tail:'#6e4528', eye:'#2b1810' },
  black:   { id:'black',   body:'#3b3b3b', wing:'#222',    beak:'#7a6045', tail:'#2a2a2a', eye:'#f5d76e' },
  blue:    { id:'blue',    body:'#6c8aa6', wing:'#4a6480', beak:'#a87b4e', tail:'#557290', eye:'#f5d76e' },
  mottled: { id:'mottled', body:'#dccab2', wing:'#9b8870', beak:'#7a5b3a', tail:'#a08a6e', eye:'#2b2b2b' },
  snow:    { id:'snow',    body:'#fbfaf5', wing:'#e9e4d3', beak:'#e7b75f', tail:'#e2dcc8', eye:'#5a6470' },
  lavender:{ id:'lavender',body:'#c5b8d6', wing:'#9d8ab8', beak:'#a07a55', tail:'#a89bbc', eye:'#3a342b' },
  golden:  { id:'golden',  body:'#e7b75f', wing:'#b8893a', beak:'#7a4f2a', tail:'#c89a45', eye:'#3a342b' },
  phoenix: { id:'phoenix', body:'#d65a3a', wing:'#a83c20', beak:'#f5d76e', tail:'#8a2a14', eye:'#fff5d6' }
};

export const DEFAULT_APPEARANCE = (breed: PigeonBreed): PigeonAppearance => {
  const b = BREED_MAP[breed];
  return {
    paletteId: b.paletteId,
    patternId: b.patternId,
    accessories: [],
    palette: PALETTES[b.paletteId]
  };
};
