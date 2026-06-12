
<template>
  <div class="px-4 py-4">
    <div class="text-center mb-4">
      <div class="text-3xl font-hand text-ink mb-1">家书鸽舍</div>
      <div class="text-sm text-ink/60">今天是寂寞的一天，你的信鸽在等你</div>
    </div>
    <div v-if="checkinMsg" class="rounded-xl bg-amber-100 border border-amber-300 p-3 mb-3 text-sm text-amber-900 text-center">{{ checkinMsg }}</div>
    <div class="rounded-2xl bg-moss/5 p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-base font-bold text-ink">我的信鸽 <span class="text-sm text-ink/50">({{ store.myPigeons.length }}/4)</span></div>
        <router-link to="/me" class="text-sm text-clay">管理 ›</router-link>
      </div>
      <div v-if="store.myPigeons.length === 0" class="py-8 text-center text-ink/50">还没有信鸽，去商店抢个吧</div>
      <div v-else class="grid grid-cols-2 gap-3">
        <div v-for="p in store.myPigeons" :key="p.id" class="bg-paper rounded-xl p-3 shadow-soft cursor-pointer hover:shadow-md transition" @click="openPigeon(p.id)">
          <div class="flex items-start justify-between mb-2">
            <PigeonSprite :pigeon="p" :size="64" />
            <div class="text-right">
              <div class="text-sm font-bold text-ink">{{ p.name }}</div>
              <div class="text-xs text-ink/50">Lv.{{ p.level }} · {{ breedName(p.breed) }}</div>
            </div>
          </div>
          <div class="space-y-1">
            <Bar label="饱食" :v="p.satiety" :max="100" color="bg-amber-400" />
            <Bar label="心情" :v="p.mood" :max="100" color="bg-pink-400" />
            <Bar label="体力" :v="p.stats.stamina" :max="100" color="bg-moss" />
          </div>
          <div v-if="p.status === 'flying'" class="mt-2 text-xs text-clay text-center">✨ 飞中</div>
          <div v-else-if="p.status === 'resting'" class="mt-2 text-xs text-moss text-center">休息中</div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <router-link to="/learn" class="rounded-2xl bg-clay/10 p-4 text-center">
        <div class="text-3xl mb-1">📚</div>
        <div class="text-sm font-bold text-ink">去学习</div>
        <div class="text-xs text-ink/50">答题赚铜板</div>
      </router-link>
      <router-link to="/compose" class="rounded-2xl bg-moss/10 p-4 text-center">
        <div class="text-3xl mb-1">✉️</div>
        <div class="text-sm font-bold text-ink">写信</div>
        <div class="text-xs text-ink/50">寄给亲人朋友</div>
      </router-link>
    </div>
    <div class="rounded-2xl bg-amber-50 p-4 border border-amber-200/50">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-amber-900">每日签到</div>
          <div class="text-xs text-amber-700">连签 {{ store.currentUser?.streak || 0 }} 天</div>
        </div>
        <button @click="doCheckIn" data-testid="yard-checkin" class="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold disabled:opacity-50" :disabled="checkedToday">签到 +{{ 10 + (store.currentUser?.streak || 0) * 5 }}</button>
      </div>
    </div>
    <PigeonModal v-if="selectedPigeon" :pigeon="selectedPigeon" @close="selectedPigeonId = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "../store";
import PigeonSprite from "../components/PigeonSprite.vue";
import Bar from "../components/Bar.vue";
import PigeonModal from "../components/PigeonModal.vue";
import { BREED_MAP } from "../data/breeds";
import { todayKey } from "../utils/format";
import type { Pigeon } from "../types";
const store = useStore();
const selectedPigeonId = ref<string | null>(null);
const selectedPigeon = computed<Pigeon | null>(() => selectedPigeonId.value ? store.state.pigeons[selectedPigeonId.value] : null);
const checkedToday = computed(() => store.currentUser?.lastCheckInDate === todayKey());
const checkinMsg = ref("");
const openPigeon = (id: string) => { selectedPigeonId.value = id; };
const breedName = (b: string) => BREED_MAP[b as keyof typeof BREED_MAP]?.name || b;
const doCheckIn = () => {
  const r = store.dailyCheckIn();
  if (r.ok) {
    checkinMsg.value = "签到成功！获得 " + r.reward + " 金币，连签 " + r.streak + " 天";
    setTimeout(() => checkinMsg.value = "", 3000);
  } else {
    checkinMsg.value = "今天已签到了，明天再来吧~";
    setTimeout(() => checkinMsg.value = "", 3000);
  }
};
</script>
