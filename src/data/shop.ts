import type { ShopItem } from '../types';
import { FOODS } from './food';
import { PAPERS, STAMPS } from './stationery';
import { BREEDS } from './breeds';

function breedToShop(b: typeof BREEDS[number]): ShopItem {
  return {
    id: 'pigeon-' + b.id, name: b.name, category: 'pigeon', rarity:
      b.price >= 5000 ? 'legendary' : b.price >= 1000 ? 'epic' : b.price > 0 ? 'rare' : 'common',
    price: { currency: b.price > 0 ? 'coin' : 'coin', amount: b.price },
    description: b.desc + '（速度 ' + b.speed + '，耐力 ' + b.endurance + '，运气 ' + b.luck + '）',
    payload: { breed: b.id }
  };
}

export const SHOP_ITEMS: ShopItem[] = [
  ...FOODS,
  ...PAPERS,
  ...STAMPS,
  ...BREEDS.map(breedToShop),
  // 商业化预留：订阅特权（订阅代币）
  { id:'sub-monthly', category:'cosmetic', name:'家书会员（月）', rarity:'legendary',
    price:{ currency:'real', amount:1800 },  // 18 元/月
    description:'每月获得 30 代币 + 1 只限定凤凰鸽抽奖券 + 长辈大字永久。' },
  // 商业化预留：广告券换金币
  { id:'ad-ticket', category:'tool', name:'看视频得金币', rarity:'common',
    price:{ currency:'ticket', amount:1 },
    description:'看一段 30s 视频，获得 50 金币与 1 次额外学习机会。' }
];

export const SHOP_MAP: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));

// 商业化钩子：价格档位
export const COIN_PACKS = [
  { id:'coin-100',  real:600,   coin:100,   bonus:0  },
  { id:'coin-600',  real:3000,  coin:600,   bonus:50 },
  { id:'coin-3000', real:12800, coin:3000,  bonus:400 }
];
export const REWARDED_AD_COINS = 50;
export const REWARDED_AD_EXTRA_LEARN = 1;  // 额外学习次数
