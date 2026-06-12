<template>
  <div :class="['h-full w-full max-w-md mx-auto flex flex-col bg-paper relative', store.currentUser?.bigFontMode ? 'big-font' : '']">
    <TopBar v-if="showTop" />
    <main class="flex-1 overflow-y-auto no-scrollbar pb-16">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <TabBar v-if="showTab" />

    <!-- 全局错误兜底 -->
    <div v-if="fatal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">
      <div class="bg-paper rounded-2xl p-5 max-w-sm w-full text-center">
        <div class="text-5xl mb-2">😵‍💫</div>
        <div class="text-base font-bold text-ink mb-1">出了一点小问题</div>
        <div class="text-xs text-ink/60 mb-3">{{ fatalMsg }}</div>
        <button @click="reload" class="px-4 py-2 rounded-full bg-clay text-white text-sm font-bold">重新加载</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from './store';
import TopBar from './components/TopBar.vue';
import TabBar from './components/TabBar.vue';

const store = useStore();
const route = useRoute();
const showTop = computed(() => !route.meta?.hideTop);
const showTab = computed(() => !!route.meta?.tab);

const fatal = ref(false);
const fatalMsg = ref('');
onErrorCaptured((err: any) => {
  fatal.value = true;
  fatalMsg.value = (err && (err.message || String(err))) || '未知错误';
  // 上报埋点可在此接入
  return false;
});
const reload = () => { try { location.reload(); } catch { fatal.value = false; } };
</script>
