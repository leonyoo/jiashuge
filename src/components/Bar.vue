
<template>
  <div class="flex items-center gap-1.5 text-xs">
    <span class="w-8 text-ink/60">{{ label }}</span>
    <div class="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
      <div :class="color" class="h-full transition-all" :style="{ width: pct + '%' }"></div>
    </div>
    <span class="w-8 text-right text-ink/70 font-mono">{{ Math.round(v) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ label: string; v: number; max: number; color: string }>();
const pct = computed(() => Math.max(0, Math.min(100, (props.v / props.max) * 100)));
</script>
