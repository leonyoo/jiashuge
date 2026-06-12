<template>
  <div class="px-5 py-8 text-center">
    <div class="text-6xl mb-3">🕊️</div>
    <div class="text-2xl font-hand text-ink mb-1">{{ t("onboarding.welcome") }}</div>
    <div class="text-sm text-ink/60 mb-8">慢慢通信，把心意寄给远方的家人</div>

    <div class="rounded-2xl bg-paper shadow-soft p-5 text-left space-y-4">
      <div>
        <div class="text-sm font-bold text-ink mb-2">1. 你怎么称呼自己？</div>
        <input v-model="name" data-testid="onboarding-name" maxlength="12" placeholder="如：小明 / 奶奶" class="w-full px-3 py-2 rounded-xl bg-white border border-ink/10 text-base" />
      </div>

      <div>
        <div class="text-sm font-bold text-ink mb-2">2. 你是？</div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="r in roles" :key="r.id" @click="role = r.id" :data-testid="`onboarding-role-${r.id}`" :class="role===r.id?'ring-2 ring-clay bg-clay/10':'bg-white'" class="py-2 rounded-xl text-sm">
            <div class="text-xl">{{ r.emoji }}</div>
            <div class="text-xs">{{ r.label }}</div>
          </button>
        </div>
      </div>

      <div>
        <div class="text-sm font-bold text-ink mb-2">3. 你在哪个城市？</div>
        <select v-model="cityId" data-testid="onboarding-city" class="w-full px-3 py-2 rounded-xl bg-white border border-ink/10 text-base">
          <option v-for="c in CITIES" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <button @click="start" :disabled="!name || !cityId" data-testid="onboarding-start" class="w-full py-3 rounded-full bg-clay text-white font-bold disabled:opacity-50">开始使用</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import { t } from '../i18n';
import { CITIES } from '../data/cities';
import type { UserRole } from '../types';

const store = useStore();
const router = useRouter();
const name = ref('');
const role = ref<UserRole>('kid');
const cityId = ref('beijing');

const roles = [
  { id: 'kid' as UserRole, emoji: '🧒', label: '小朋友' },
  { id: 'elder' as UserRole, emoji: '👵', label: '长辈' },
  { id: 'guest' as UserRole, emoji: '🧑', label: '其他' }
];

onMounted(() => {
  if (store.currentUser) router.replace('/yard');
});

const start = () => {
  if (!name.value || !cityId.value) return;
  const u = store.createUser(name.value, cityId.value, role.value);
  if (u) router.replace('/yard');
};
</script>
