<template>
  <div class="px-5 py-16 text-center">
    <div class="text-7xl mb-3">🕊️💨</div>
    <div class="text-2xl font-hand text-ink mb-1">{{ t("notFound.title") }}</div>
    <div class="text-sm text-ink/60 mb-6">{{ t("notFound.desc") }}</div>
    <router-link to="/yard" class="inline-block px-6 py-2 rounded-full bg-clay text-white font-bold">{{ t("common.back") }}鸽舍</router-link>
  </div>
</template>

<script setup lang="ts">
import { t } from '../i18n';
</script>
