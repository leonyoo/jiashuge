import type { ShopItem } from '../types';
export const FOODS: ShopItem[] = [
  { id:'food-basic',   category:'food', name:'普通鸽粮', rarity:'common',
    price:{ currency:'coin', amount:1 },
    description:'+20 饱食。一日三餐的家常味道。',
    payload:{ satiety:20, mood:0, exp:0 } },
  { id:'food-nutri',   category:'food', name:'营养鸽粮', rarity:'common',
    price:{ currency:'coin', amount:5 },
    description:'+50 饱食，+5 心情。鸽子会开心地咕咕叫。',
    payload:{ satiety:50, mood:5, exp:1 } },
  { id:'food-grain',   category:'food', name:'五谷杂粮', rarity:'rare',
    price:{ currency:'coin', amount:20 },
    description:'+100 饱食，+10 心情，+5 经验。谷物香气扑鼻。',
    payload:{ satiety:100, mood:10, exp:5 } },
  { id:'food-saffron', category:'food', name:'藏红花粮', rarity:'epic',
    price:{ currency:'coin', amount:80 },
    description:'+100 饱食，+20 心情，+15 经验。',
    payload:{ satiety:100, mood:20, exp:15 } },
  { id:'food-cake',    category:'food', name:'生日蛋糕粮', rarity:'legendary',
    price:{ currency:'token', amount:1 },
    description:'+100 饱食，+30 心情，+30 经验。限时节日。',
    payload:{ satiety:100, mood:30, exp:30 }, limited:true }
];
