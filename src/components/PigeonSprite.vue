
<template>
  <div v-html="svg" :class="props.className" :style="props.style"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pigeonSvg } from '../utils/drawPigeon';
import type { Pigeon } from '../types';
const props = defineProps<{ pigeon: Pigeon; size?: number; flying?: boolean; className?: string; style?: any }>();
const svg = computed(() => pigeonSvg({
  appearance: props.pigeon.appearance,
  size: props.size ?? 96,
  flying: props.flying ?? false,
  mood: props.pigeon.mood,
  stamina: props.pigeon.stats.stamina
}));
</script>
