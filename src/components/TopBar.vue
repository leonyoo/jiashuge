
<template>
  <header class="px-4 py-3 flex items-center justify-between bg-paper/80 backdrop-blur sticky top-0 z-10 border-b border-moss/10">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🕊️</span>
      <div>
        <div class="text-sm text-ink/60">{{ store.currentUser?.name || '访客' }}</div>
        <div class="text-base font-bold text-ink">{{ greeting }}</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100">
        <span>🪙</span>
        <span class="text-sm font-bold text-amber-900" data-testid="topbar-coins">{{ store.currentUser?.coins ?? 0 }}</span>
      </div>
      <router-link to="/mailbox" class="relative px-2 py-1 rounded-full bg-moss/10" data-testid="topbar-mailbox">
        <span class="text-xl">📮</span>
        <span v-if="store.unreadCount > 0" class="absolute -top-1 -right-1 bg-clay text-white text-xs rounded-full px-1.5">{{ store.unreadCount }}</span>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
const store = useStore();
const greeting = computed(() => { const h = new Date().getHours(); if (h < 6) return '夜深了'; if (h < 11) return '早安'; if (h < 14) return '中午好'; if (h < 18) return '下午好'; return '晚上好'; });
</script>
