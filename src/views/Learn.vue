
<template>
  <div class="px-4 py-4">
    <div class="text-2xl font-bold text-ink mb-1">学习塔</div>
    <div class="text-sm text-ink/60 mb-4">答题赚铜板，答对一道获得奖励</div>
    <div v-if="!inSession" class="space-y-3">
      <div v-for="m in modules" :key="m.id" :data-testid="`learn-module-${m.id}`" class="rounded-2xl bg-paper p-4 shadow-soft">
        <div class="flex items-center gap-3">
          <div class="text-3xl">{{ m.emoji }}</div>
          <div class="flex-1">
            <div class="text-base font-bold text-ink">{{ m.name }}</div>
            <div class="text-xs text-ink/60">{{ m.desc }}</div>
            <div class="text-xs text-moss mt-1">今日剩余 {{ m.remaining }} / 3 次</div>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button v-for="d in ['easy','medium','hard']" :key="d" @click="start(m.id, d as any)" :data-testid="`learn-start-${m.id}-${d}`" :disabled="m.remaining <= 0" class="flex-1 py-2 rounded-full text-sm disabled:opacity-30" :class="d==='easy'?'bg-moss/20 text-moss':(d==='medium'?'bg-clay/20 text-clay':'bg-amber-200 text-amber-900')">{{ d==="easy"?"简单":(d==="medium"?"普通":"困难") }}</button>
        </div>
      </div>
    </div>
    <div v-else class="rounded-2xl bg-paper p-4 shadow-soft">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-ink/60">第 {{ index + 1 }} / {{ questions.length }} 题</div>
        <div class="text-sm text-moss">连对 {{ streak }}</div>
      </div>
      <div class="text-lg font-bold text-ink mb-4 min-h-[3.5em]">{{ currentQ?.prompt }}</div>
      <div class="space-y-2">
        <button v-for="(o, i) in currentQ?.options" :key="i" @click="answer(i)" :data-testid="`learn-option-${i}`" :class="optionClass(i)" class="w-full text-left px-3 py-2.5 rounded-xl text-sm border transition" :disabled="answered">
          <span class="font-bold mr-1">{{ 'ABCEFGD'[i] }}.</span> {{ o }}
        </button>
      </div>
      <div v-if="answered" class="mt-3 text-sm" :class="lastCorrect ? 'text-moss' : 'text-clay'">
        {{ lastCorrect ? "✨ 答对了！+" + (currentQ?.reward || 0) + " 金币" : "❌ 答错了，正确答案：" + (currentQ?.options[currentQ.answer] || "") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "../store";
import type { LearningModule, Difficulty, Question } from "../types";
const store = useStore();
const inSession = ref(false);
const module = ref<LearningModule>("idioms");
const difficulty = ref<Difficulty>("easy");
const questions = ref<Question[]>([]);
const index = ref(0);
const streak = ref(0);
const answered = ref(false);
const lastCorrect = ref(false);
const modules = computed(() => ([
  { id: "idioms" as LearningModule, name: "成语", emoji: "", desc: "成语故事、出处、接龙", remaining: 3 - store.getProgress("idioms").sessionsToday },
  { id: "vocab" as LearningModule,  name: "单词", emoji: "", desc: "中英互转，词汇扩展", remaining: 3 - store.getProgress("vocab").sessionsToday },
  { id: "riddles" as LearningModule, name: "谜语", emoji: "", desc: "传统灯谜，动脑练思", remaining: 3 - store.getProgress("riddles").sessionsToday }
]).map(m => ({ ...m, remaining: m.remaining < 0 ? 0 : m.remaining })));
const currentQ = computed(() => questions.value[index.value]);
const start = (m: LearningModule, d: Difficulty) => {
  if (!store.canStartSession(m)) { alert("今日次数已用完"); return; }
  if (!store.startSession(m)) return;
  module.value = m; difficulty.value = d;
  questions.value = store.pickQuestions(m, 5, d);
  index.value = 0; streak.value = 0;
  inSession.value = true; answered.value = false;
};
const answer = (i: number) => {
  if (answered.value) return;
  const q = currentQ.value; if (!q) return;
  const correct = i === q.answer;
  lastCorrect.value = correct;
  answered.value = true;
  store.submitAnswer(module.value, q.id, correct, q.reward);
  if (correct) streak.value += 1;
  setTimeout(() => {
    if (index.value + 1 >= questions.value.length) { inSession.value = false; return; }
    index.value += 1; answered.value = false;
  }, 1400);
};
const optionClass = (i: number) => {
  if (!answered.value) return "bg-paper border-ink/20 text-ink";
  if (i === currentQ.value?.answer) return "bg-moss/20 border-moss text-ink";
  return "bg-paper border-ink/10 text-ink/50";
};
</script>
