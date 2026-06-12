
<template>
  <nav class="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-paper/95 backdrop-blur border-t border-moss/10 px-2 py-1.5 flex justify-around z-10">
    <router-link v-for="t in tabs" :key="t.path" :to="t.path" :data-testid="`tab-${t.path.slice(1)}`" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg" :class="isActive(t.path) ? 'text-clay' : 'text-ink/50'">
      <span class="text-xl">{{ t.emoji }}</span>
      <span class="text-xs">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const tabs = [
  { path: '/yard',     emoji: '🏠', label: '鸽舍' },
  { path: '/learn',    emoji: '📚', label: '学习' },
  { path: '/compose',  emoji: '✉️', label: '写信' },
  { path: '/mailbox',  emoji: '📮', label: '信箱' },
  { path: '/me',       emoji: '👤', label: '我' }
];
const isActive = (p: string) => { if (route.path === p) return true; if (p === '/mailbox' && (route.path.startsWith('/reading') || route.path.startsWith('/flying'))) return true; if (p === '/me' && (route.path === '/shop' || route.path.startsWith('/cognitive'))) return true; return false; };
</script>
