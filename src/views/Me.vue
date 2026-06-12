<template>
  <div class="px-4 py-4">
    <div class="rounded-2xl bg-moss/10 p-4 mb-4 flex items-center gap-3">
      <div class="w-14 h-14 rounded-full bg-paper flex items-center justify-center text-3xl shadow-soft">{{ avatarEmoji }}</div>
      <div class="flex-1">
        <div class="text-lg font-bold text-ink">{{ store.currentUser?.name || '访客' }}</div>
        <div class="text-xs text-ink/60">{{ cityName }} · {{ roleLabel }} · Lv.{{ store.currentUser?.level || 1 }}</div>
      </div>
    </div>

    <div class="rounded-2xl bg-paper shadow-soft p-4 mb-4">
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div><div class="text-xl">🪙</div><div class="font-bold">{{ store.currentUser?.coins ?? 0 }}</div><div class="text-ink/50">金币</div></div>
        <div><div class="text-xl">💎</div><div class="font-bold">{{ store.currentUser?.tokens ?? 0 }}</div><div class="text-ink/50">晶石</div></div>
        <div><div class="text-xl">🎟️</div><div class="font-bold">{{ store.currentUser?.tickets ?? 0 }}</div><div class="text-ink/50">券</div></div>
        <div><div class="text-xl">🔥</div><div class="font-bold">{{ store.currentUser?.streak ?? 0 }}</div><div class="text-ink/50">连签</div></div>
      </div>
      <Bar label="经验" :v="store.currentUser?.exp || 0" :max="expNeeded" color="bg-clay" />
    </div>

    <div class="rounded-2xl bg-paper shadow-soft p-4 mb-4">
      <div class="text-sm font-bold text-ink mb-2">{{ t("common.language") }}</div>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="l in langs" :key="l" @click="setLocale(l)" :class="locale===l ? 'ring-2 ring-clay bg-clay/10' : 'bg-white'" class="py-1.5 rounded-xl text-sm">{{ l === 'zh-CN' ? '简体中文' : 'English' }}</button>
      </div>
    </div>

    <div class="rounded-2xl bg-paper shadow-soft p-4 mb-4">
      <div class="text-sm font-bold text-ink mb-2">设置</div>
      <label class="flex items-center justify-between py-2">
        <span class="text-sm">长辈大字号</span>
        <input type="checkbox" :checked="store.currentUser?.bigFontMode" @change="store.toggleBigFont()" class="w-5 h-5 accent-clay" />
      </label>
    </div>

    <div class="rounded-2xl bg-paper shadow-soft p-4 mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm font-bold text-ink">好友</div>
        <router-link to="/me" class="text-xs text-clay">添加</router-link>
      </div>
      <div v-if="friends.length === 0" class="text-sm text-ink/50 py-3 text-center">还没有好友，去商店认识一些吧</div>
      <div v-else class="space-y-2">
        <div v-for="f in friends" :key="f.id" class="flex items-center justify-between text-sm">
          <div><div class="font-bold text-ink">{{ f.friendName }}</div><div class="text-xs text-ink/50">{{ CITY_MAP[f.friendCityId]?.name }}</div></div>
          <button @click="store.removeFriend(f.friendUserId)" class="text-xs text-ink/40">移除</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <router-link to="/shop" class="rounded-2xl bg-amber-100 p-4 text-center">
        <div class="text-2xl mb-1">🛍️</div>
        <div class="text-sm font-bold text-amber-900">商店</div>
      </router-link>
      <router-link to="/cognitive" class="rounded-2xl bg-sky-100 p-4 text-center">
        <div class="text-2xl mb-1">🧠</div>
        <div class="text-sm font-bold text-sky-900">益智</div>
      </router-link>
    </div>

    <div class="rounded-2xl bg-paper shadow-soft p-4 mb-4">
      <div class="text-sm font-bold text-ink mb-2">切换账号（演示）</div>
      <div class="space-y-1">
        <button v-for="u in allUsers" :key="u.id" @click="store.switchUser(u.id)" :data-testid="`me-switch-${u.id}`" :class="u.id===store.currentUserId?'ring-2 ring-clay':''" class="w-full text-left px-3 py-2 rounded-xl bg-white text-sm flex items-center justify-between">
          <span>{{ u.name }}</span>
          <span class="text-xs text-ink/50">{{ CITY_MAP[u.homeCityId]?.name }}</span>
        </button>
      </div>
    </div>

    <button @click="reset" data-testid="me-reset" class="w-full py-2 text-xs text-ink/40">重置全部数据（调试）</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { t, useT, setLocale as i18nSetLocale } from '../i18n';
import { CITY_MAP } from '../data/cities';
import Bar from '../components/Bar.vue';

const store = useStore();
const friends = computed(() => store.getMyFriends());
const allUsers = computed(() => store.listAllUsers());
const cityName = computed(() => store.currentUser ? (CITY_MAP[store.currentUser.homeCityId]?.name || '') : '');
const roleLabel = computed(() => ({ kid: '小朋友', elder: '长辈', guest: '其他' } as any)[store.currentUser?.role || 'kid']);
const { locale } = useT();
const langs = ['zh-CN', 'en-US'] as const;
const setLocale = (l: 'zh-CN' | 'en-US') => i18nSetLocale(l);
const avatarEmoji = computed(() => ({ kid: '🧒', elder: '👵', guest: '🧑' } as any)[store.currentUser?.role || 'kid']);
const expNeeded = computed(() => (store.currentUser?.level || 1) * 30 + 30);

const reset = () => { if (confirm('清空所有数据并重新生成演示用户？')) store.resetAll(); };
</script>

