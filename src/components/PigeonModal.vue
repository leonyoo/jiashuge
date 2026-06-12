
<template>
  <div class="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" @click.self="$emit('close')">
    <div class="bg-paper w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto">
      <div class="text-center">
        <PigeonSprite :pigeon="pigeon" :size="120" :flying="pigeon.status === 'flying'" />
        <div class="text-xl font-bold text-ink mt-2">{{ pigeon.name }}</div>
        <div class="text-sm text-ink/60">{{ breedName }} · Lv.{{ pigeon.level }}</div>
      </div>
      <div class="my-4 space-y-2">
        <Bar label="饱食" :v="pigeon.satiety" :max="100" color="bg-amber-400" />
        <Bar label="心情" :v="pigeon.mood" :max="100" color="bg-pink-400" />
        <Bar label="体力" :v="pigeon.stats.stamina" :max="100" color="bg-moss" />
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs my-4">
        <div class="rounded-lg bg-moss/10 p-2"><div class="font-bold text-base">{{ pigeon.stats.speed }}</div><div class="text-ink/60">速度</div></div>
        <div class="rounded-lg bg-moss/10 p-2"><div class="font-bold text-base">{{ pigeon.stats.endurance }}</div><div class="text-ink/60">耐力</div></div>
        <div class="rounded-lg bg-moss/10 p-2"><div class="font-bold text-base">{{ pigeon.stats.luck }}</div><div class="text-ink/60">运气</div></div>
      </div>
      <div class="text-sm font-bold text-ink mb-2">喂食</div>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button v-for="f in userFoods" :key="f.id" @click="feed(f.id)" :disabled="(store.currentUser?.inventory[f.id] || 0) <= 0" class="rounded-xl bg-paper border border-moss/20 p-2 text-left disabled:opacity-40">
          <div class="text-sm font-bold text-ink">{{ f.name }}</div>
          <div class="text-xs text-ink/60">库存 {{ store.currentUser?.inventory[f.id] || 0 }} · +{{ (f.payload?.satiety || 20) }} 饱食</div>
        </button>
      </div>
      <button @click="$emit('close')" class="w-full py-2.5 rounded-full bg-ink/10 text-ink text-sm">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "../store";
import PigeonSprite from "./PigeonSprite.vue";
import Bar from "./Bar.vue";
import { FOODS } from "../data/food";
import { BREED_MAP } from "../data/breeds";
import type { Pigeon } from "../types";
const props = defineProps<{ pigeon: Pigeon }>();
const emit = defineEmits<{ (e: "close"): void }>();
const store = useStore();
const breedName = computed(() => BREED_MAP[props.pigeon.breed]?.name || props.pigeon.breed);
const userFoods = computed(() => FOODS.filter(f => (store.currentUser?.inventory[f.id] || 0) > 0));
const feed = (id: string) => { store.feed(props.pigeon.id, id); };
</script>
