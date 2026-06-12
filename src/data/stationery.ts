import type { ShopItem } from '../types';
export const PAPERS: ShopItem[] = [
  { id:'paper-plain',  category:'paper', name:'素白信纸',  rarity:'common',  price:{ currency:'coin', amount:1 },   description:'干净的白纸，最朴素的心意。' },
  { id:'paper-bamboo', category:'paper', name:'竹纹信纸',  rarity:'common',  price:{ currency:'coin', amount:10 },  description:'淡绿竹叶暗纹，清雅。' },
  { id:'paper-river',  category:'paper', name:'山水信纸',  rarity:'rare',    price:{ currency:'coin', amount:50 },  description:'远山含黛，写一封远方的信。' },
  { id:'paper-classic',category:'paper', name:'复古信纸',  rarity:'rare',    price:{ currency:'coin', amount:80 },  description:'牛皮纸质感，时光倒流。' },
  { id:'paper-festive',category:'paper', name:'春节信纸',  rarity:'epic',    price:{ currency:'token', amount:1 },  description:'灯笼高挂，年味浓浓。', limited:true },
  { id:'paper-moon',   category:'paper', name:'中秋信纸',  rarity:'epic',    price:{ currency:'token', amount:1 },  description:'月圆人团圆。', limited:true }
];
export const STAMPS: ShopItem[] = [
  { id:'stamp-common',  category:'stamp', name:'普通邮票', rarity:'common', price:{ currency:'coin', amount:1 },  description:'官方标准邮票。' },
  { id:'stamp-flower',  category:'stamp', name:'花卉邮票', rarity:'common', price:{ currency:'coin', amount:5 },  description:'一束小花。' },
  { id:'stamp-bird',    category:'stamp', name:'飞鸟邮票', rarity:'rare',   price:{ currency:'coin', amount:20 }, description:'衔着橄榄枝的信鸽。' },
  { id:'stamp-paint',   category:'stamp', name:'名画邮票', rarity:'epic',   price:{ currency:'coin', amount:50 }, description:'复刻传世名画。' },
  { id:'stamp-festive', category:'stamp', name:'生肖邮票', rarity:'epic',   price:{ currency:'token', amount:1 }, description:'每年一款，限定。', limited:true }
];
