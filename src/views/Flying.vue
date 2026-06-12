<template>
  <div class="px-4 py-6 text-center" v-if="letter">
    <div class="rounded-2xl bg-paper shadow-soft p-5">
      <div class="flex items-center justify-between text-xs text-ink/60 mb-3">
        <span data-testid="flying-from">{{ fromCity }}</span>
        <span data-testid="flying-status">{{ statusText }}</span>
        <span data-testid="flying-to">{{ toCity }}</span>
      </div>

      <div class="relative h-40 flex items-center justify-center">
        <div class="absolute inset-x-4 top-1/2 h-0.5 bg-moss/30"></div>
        <PigeonSprite v-if="pigeon" :pigeon="pigeon" :size="100" :flying="true" className="relative transition-all duration-700" :style="{ transform: `translateX(${pigeonX}px)` }" />
        <div class="absolute left-4 bottom-2 text-2xl">🏠</div>
        <div class="absolute right-4 bottom-2 text-2xl">🏯</div>
      </div>

      <div class="mt-4">
        <div class="h-3 bg-ink/10 rounded-full overflow-hidden">
          <div class="h-full bg-clay transition-all" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="flex items-center justify-between text-xs text-ink/60 mt-2">
          <span>{{ letter.flight ? formatDistance(letter.flight.distance) : '' }}</span>
          <span>{{ etaLabel }}</span>
        </div>
      </div>

      <div v-if="weather.length" class="flex items-center justify-center gap-2 mt-3 text-sm">
        <span v-for="(w, i) in weather" :key="i">{{ WEATHER_EMOJI[w.type] }} {{ WEATHER_LABEL[w.type] }}</span>
      </div>
    </div>

    <div v-if="letter.status === 'delivered' || letter.status === 'read'" class="mt-4 rounded-xl bg-moss/15 p-3 text-sm text-moss">
      ✉️ 已送达，去看看吧
    </div>
    <div v-else-if="letter.status === 'lost'" class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
      信件丢失：{{ letter.flight?.lostReason }}
    </div>
    <router-link v-else to="/mailbox" class="mt-4 inline-block text-sm text-clay">返回信箱</router-link>
  </div>
  <div v-else class="px-4 py-8 text-center text-ink/50">信件不存在</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '../store';
import { CITY_MAP } from '../data/cities';
import { WEATHER_EMOJI, WEATHER_LABEL } from '../data/weather';
import { formatDistance, formatHours } from '../utils/format';
import PigeonSprite from '../components/PigeonSprite.vue';

const route = useRoute();
const store = useStore();
const now = ref(Date.now());
let timer: number | undefined;

const letter = computed(() => store.state.letters[String(route.params.letterId)]);
const pigeon = computed(() => letter.value?.flight ? store.state.pigeons[letter.value.flight.pigeonId] : null);
const fromCity = computed(() => letter.value ? CITY_MAP[letter.value.fromCityId]?.name || '' : '');
const toCity = computed(() => letter.value ? CITY_MAP[letter.value.toCityId]?.name || '' : '');
const weather = computed(() => letter.value?.flight?.weather || []);

const progress = computed(() => {
  if (!letter.value?.flight) return 0;
  const { startedAt, etaAt } = letter.value.flight;
  if (etaAt <= startedAt) return 1;
  return Math.max(0, Math.min(1, (now.value - startedAt) / (etaAt - startedAt)));
});
const progressPct = computed(() => Math.round(progress.value * 100));
const pigeonX = computed(() => Math.round(progress.value * 180));

const etaLabel = computed(() => {
  if (!letter.value?.flight) return '';
  if (letter.value.status === 'delivered' || letter.value.status === 'read') return '已送达';
  if (letter.value.status === 'lost') return '已丢失';
  return '还需 ' + formatHours((letter.value.flight.etaAt - now.value) / 3600_000);
});

const statusText = computed(() => {
  if (!letter.value) return '';
  const map: any = { draft: '草稿', flying: '飞行中', delivered: '已送达', read: '已读', lost: '丢失' };
  return map[letter.value.status] || '';
});

onMounted(() => {
  timer = window.setInterval(() => { now.value = Date.now(); }, 1000);
});
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>
