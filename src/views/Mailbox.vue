<template>
  <div class="px-4 py-4">
    <div class="text-2xl font-bold text-ink mb-1">{{ t("mailbox.title") }}</div>
    <div class="text-sm text-ink/60 mb-3">收信、发信，慢慢把心意送达</div>

    <div class="flex gap-2 mb-4">
      <button v-for="t1 in tabs" :key="t1.id" @click="tab = t1.id" :class="tab===t1.id?'bg-clay text-white':'bg-paper text-ink/60'" class="flex-1 py-2 rounded-full text-sm font-bold">
        {{ t1.label }} <span v-if="t1.id==='inbox' && store.unreadCount>0" class="ml-1 text-xs">({{ store.unreadCount }})</span>
      </button>
    </div>

    <div v-if="list.length === 0" class="py-16 text-center text-ink/50" data-testid="mailbox-empty">
      <div class="text-4xl mb-2">📭</div>
      <div class="text-sm">{{ tab === "inbox" ? t("mailbox.emptyInbox") : t("mailbox.emptyOutbox") }}</div>
      <router-link to="/compose" class="inline-block mt-4 px-5 py-2 rounded-full bg-clay text-white text-sm">去写信</router-link>
    </div>

    <div v-else class="space-y-2">
      <router-link v-for="l in list" :key="l.id" :data-testid="`mailbox-letter-${l.id}`" :to="readingUrl(l.id)" class="block rounded-2xl bg-paper p-3 shadow-soft">
        <div class="flex items-center justify-between mb-1">
          <div class="text-base font-bold text-ink flex items-center gap-1">
            <span v-if="tab==='inbox' && l.status==='delivered'" class="w-2 h-2 rounded-full bg-clay"></span>
            <span>{{ tab==='inbox' ? l.fromUserName : l.toUserName }}</span>
          </div>
          <span :class="statusBadge(l.status)" class="text-xs px-2 py-0.5 rounded-full">{{ statusLabel(l.status) }}</span>
        </div>
        <div class="text-sm text-ink/70 line-clamp-2">{{ l.content.text || "(空)" }}</div>
        <div class="flex items-center justify-between mt-2 text-xs text-ink/50">
          <span>{{ cityName(tab==='inbox' ? l.fromCityId : l.toCityId) }}</span>
          <span>{{ formatDate(l.sentAt) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from '../store';
import { t } from '../i18n';
import { CITY_MAP } from '../data/cities';
import { formatDate } from '../utils/format';
import type { Letter } from '../types';

const store = useStore();
const tab = ref<'inbox' | 'outbox'>('inbox');
const tabs = [
  { id: 'inbox' as const, label: t('mailbox.inbox') },
  { id: 'outbox' as const, label: t('mailbox.outbox') }
];

const list = computed<Letter[]>(() => tab.value === 'inbox' ? store.inbox : store.outbox);
const readingUrl = (id: string) => '/reading/' + id;
const cityName = (id: string) => CITY_MAP[id]?.name || id;
const statusLabel = (s: string) => ({ draft: '草稿', flying: '飞行中', delivered: '已送达', read: '已读', lost: '已丢失' } as any)[s] || s;
const statusBadge = (s: string) => ({
  draft: 'bg-ink/10 text-ink/60',
  flying: 'bg-amber-100 text-amber-800',
  delivered: 'bg-clay/20 text-clay',
  read: 'bg-moss/20 text-moss',
  lost: 'bg-red-100 text-red-700'
} as any)[s] || 'bg-ink/10 text-ink/60';
</script>

