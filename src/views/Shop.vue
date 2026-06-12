<template>
  <div class="px-4 py-4">
    <div class="flex items-center justify-between mb-3">
      <div class="text-2xl font-bold text-ink">商店</div>
      <div class="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100">
        <span>🪙</span><span class="text-sm font-bold text-amber-900">{{ store.currentUser?.coins ?? 0 }}</span>
      </div>
    </div>

    <div class="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
      <button v-for="c in categories" :key="c.id" @click="cat = c.id" :class="cat===c.id?'bg-clay text-white':'bg-paper text-ink/60'" class="px-4 py-1.5 rounded-full text-sm whitespace-nowrap">{{ c.label }}</button>
    </div>

    <div class="space-y-2">
      <div v-for="it in filteredItems" :key="it.id" :data-testid="`shop-item-${it.id}`" class="rounded-2xl bg-paper shadow-soft p-3 flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-moss/10 flex items-center justify-center text-2xl">{{ categoryEmoji(it.category) }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <div class="text-sm font-bold text-ink truncate">{{ it.name }}</div>
            <span :class="rarityClass(it.rarity)" class="text-xs px-1.5 py-0.5 rounded">{{ rarityLabel(it.rarity) }}</span>
          </div>
          <div class="text-xs text-ink/60 line-clamp-1">{{ it.description }}</div>
          <div class="text-xs text-clay mt-1">🪙 {{ it.price.amount }} {{ currencyName(it.price.currency) }} · 库存 {{ owned(it.id) }}</div>
        </div>
        <button @click="buy(it.id)" :data-testid="`shop-buy-${it.id}`" :disabled="!canBuy(it)" class="px-3 py-1.5 rounded-full bg-clay text-white text-xs font-bold disabled:opacity-40 disabled:bg-ink/30">购买</button>
      </div>
    </div>

    <!-- IAP / 订阅区 -->
    <div class="mt-6 rounded-2xl bg-gradient-to-br from-amber-100 to-clay/20 p-4 border border-amber-200/50">
      <div class="text-sm font-bold text-amber-900 mb-2">充值与会员</div>
      <div class="grid grid-cols-3 gap-2 mb-3">
        <button v-for="p in COIN_PACKS" :key="p.id" @click="buyCoins(p.id)" class="rounded-xl bg-white p-2 text-center shadow-soft hover:shadow-md transition">
          <div class="text-lg font-bold text-clay">🪙 {{ p.coin }}</div>
          <div v-if="p.bonus" class="text-xs text-amber-700">+{{ p.bonus }} 赠</div>
          <div class="text-xs text-ink/60 mt-1">¥ {{ (p.real/100).toFixed(2) }}</div>
        </button>
      </div>
      <button @click="subscribe" class="w-full py-2 rounded-full bg-clay text-white text-sm font-bold">🌙 开通月度会员（¥18/月）</button>
      <div class="text-xs text-ink/50 mt-2 text-center">支付通道为占位演示，不会真实扣款</div>
    </div>

    <div class="mt-4 rounded-2xl bg-amber-50 border border-amber-200/50 p-3 text-center">
      <div class="text-sm font-bold text-amber-900 mb-1">看视频得金币</div>
      <div class="text-xs text-amber-700 mb-2">每天可领几次，每次 +50 金币 + 1 次学习</div>
      <button @click="watchAd" :disabled="(store.currentUser?.tickets || 0) <= 0" class="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold disabled:opacity-40">观看广告</button>
    </div>

    <div class="mt-4 text-center text-xs text-ink/40">晶石可通过会员订阅获得</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from '../store';
import { SHOP_ITEMS, COIN_PACKS } from '../data/shop';
import type { ItemCategory, CurrencyType } from '../types';

const store = useStore();
const cat = ref<ItemCategory>('food');
const categories = [
  { id: 'food' as ItemCategory, label: '粮食' },
  { id: 'paper' as ItemCategory, label: '信纸' },
  { id: 'stamp' as ItemCategory, label: '邮票' },
  { id: 'pigeon' as ItemCategory, label: '鸽子' },
  { id: 'tool' as ItemCategory, label: '道具' }
];

const filteredItems = computed(() => SHOP_ITEMS.filter(i => i.category === cat.value));

const owned = (id: string) => store.currentUser?.inventory[id] || 0;
const canBuy = (it: typeof SHOP_ITEMS[number]) => {
  const u = store.currentUser; if (!u) return false;
  if (it.category === 'pigeon' && u.pigeonIds.length >= 4) return false;
  if (it.price.currency === 'coin') return u.coins >= it.price.amount;
  if (it.price.currency === 'token') return u.tokens >= it.price.amount;
  if (it.price.currency === 'ticket') return u.tickets >= it.price.amount;
  return true;
};

const buy = (id: string) => {
  const ok = store.buyItem(id, 1);
  if (!ok) alert('购买失败：金币不足或已达上限');
};
const buyCoins = (packId: string) => {
  const ok = store.iapAddRealCoins(packId);
  alert(ok ? '充值成功（金币已到账）' : '充值失败');
};
const subscribe = () => {
  // 占位：实际接入时调起支付 SDK
  store.currentUser!.tokens += 30;
  alert('订阅成功（演示），已发放 30 晶石');
};
const watchAd = () => {
  const r = store.rewardAd();
  if (!r) alert('今日券已用完');
  else alert('获得 ' + r.coins + ' 金币');
};

const currencyName = (c: CurrencyType) => c === 'coin' ? '金币' : c === 'token' ? '晶石' : c === 'ticket' ? '券' : '余额';
const rarityClass = (r: string) => ({ common: 'bg-ink/10 text-ink/60', rare: 'bg-sky-100 text-sky-700', epic: 'bg-purple-100 text-purple-700', legendary: 'bg-amber-100 text-amber-800' } as any)[r] || 'bg-ink/10 text-ink/60';
const rarityLabel = (r: string) => ({ common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' } as any)[r] || r;
const categoryEmoji = (c: string) => ({ food: '🌾', paper: '📜', stamp: '🏷️', pigeon: '🕊️', tool: '🛠️', cosmetic: '✨', gift: '🎁' } as any)[c] || '📦';
</script>
