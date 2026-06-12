<template>
  <div class="px-4 py-4" v-if="letter">
    <button @click="back" class="text-sm text-clay mb-3">‹ 返回</button>

    <div class="rounded-2xl bg-paper shadow-soft p-5">
      <div class="flex items-center justify-between text-xs text-ink/60 mb-2">
        <span>{{ fromCityName }} → {{ toCityName }}</span>
        <span>{{ formatDate(letter.sentAt) }}</span>
      </div>
      <div class="border-b border-moss/10 pb-3 mb-3">
        <div class="text-sm text-ink/60">寄件人</div>
        <div class="text-base font-bold text-ink">{{ letter.fromUserName }}</div>
      </div>
      <div class="text-base text-ink leading-relaxed whitespace-pre-wrap min-h-[8em]" :style="{ backgroundImage: paperBg }">
        {{ letter.content.text }}
      </div>
      <div class="flex items-center justify-between text-xs text-ink/50 mt-4">
        <span>用纸：{{ paperName }}</span>
        <span>邮票：{{ stampName }}</span>
      </div>
    </div>

    <div v-if="letter.flight" class="rounded-2xl bg-moss/5 p-4 mt-4">
      <div class="text-sm font-bold text-ink mb-2">飞行记录</div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div><div class="font-bold text-base text-ink">{{ formatDistance(letter.flight.distance) }}</div><div class="text-ink/60">距离</div></div>
        <div><div class="font-bold text-base text-ink">{{ formatHours(letter.flight.finalHours) }}</div><div class="text-ink/60">耗时</div></div>
        <div><div class="font-bold text-base text-ink">{{ weatherEmoji }}</div><div class="text-ink/60">天气</div></div>
      </div>
    </div>

    <div v-if="isIncoming && letter.status !== 'lost'" class="mt-4 flex gap-2">
      <router-link :to="'/compose?to=' + letter.fromUserId" class="flex-1 py-3 rounded-full bg-clay text-white font-bold text-center">回信</router-link>
    </div>

    <div v-if="letter.status === 'lost'" class="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
      这封信在途中丢失了：{{ letter.flight?.lostReason || '原因未知' }}
    </div>
  </div>
  <div v-else class="px-4 py-8 text-center text-ink/50">信件不存在</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '../store';
import { CITY_MAP } from '../data/cities';
import { WEATHER_EMOJI, WEATHER_LABEL } from '../data/weather';
import { PAPERS, STAMPS } from '../data/stationery';
import { formatDate, formatDistance, formatHours } from '../utils/format';

const route = useRoute();
const router = useRouter();
const store = useStore();

const letter = computed(() => store.state.letters[String(route.params.letterId)]);
const fromCityName = computed(() => letter.value ? (CITY_MAP[letter.value.fromCityId]?.name || '?') : '');
const toCityName = computed(() => letter.value ? (CITY_MAP[letter.value.toCityId]?.name || '?') : '');
const isIncoming = computed(() => letter.value?.toUserId === store.currentUserId);

const paperName = computed(() => PAPERS.find(p => p.id === letter.value?.content.stationeryId)?.name || '素纸');
const stampName = computed(() => STAMPS.find(s => s.id === letter.value?.content.stampId)?.name || '邮票');

const paperBg = computed(() => {
  if (!letter.value) return '';
  const colors: Record<string, string> = {
    'paper-plain': '#f7f1e1',
    'paper-bamboo': '#e7eed8',
    'paper-river': '#dfe8ef',
    'paper-classic': '#efe4d0',
    'paper-festive': '#f8d9c7',
    'paper-moon': '#1c2740'
  };
  const c = colors[letter.value.content.stationeryId] || '#f7f1e1';
  return `linear-gradient(transparent, transparent), radial-gradient(ellipse at top left, ${c}, transparent)`;
});

const weatherEmoji = computed(() => {
  if (!letter.value?.flight?.weather?.length) return '☀️';
  const labels = letter.value.flight.weather.map(w => WEATHER_EMOJI[w.type] + WEATHER_LABEL[w.type]);
  return labels.slice(0, 3).join(' ');
});

onMounted(() => {
  if (letter.value && letter.value.status === 'delivered' && isIncoming.value) {
    store.markRead(letter.value.id);
  }
});

const back = () => { if (window.history.length > 1) router.back(); else router.push('/mailbox'); };
</script>
