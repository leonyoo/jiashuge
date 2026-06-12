<template>
  <div class="px-4 py-4">
    <div v-if="!gameId">
      <div class="text-2xl font-bold text-ink mb-1">益智</div>
      <div class="text-sm text-ink/60 mb-4">为长辈设计，每天玩一点，活跃脑力</div>
      <div class="text-xs text-ink/50 mb-3">今日已玩 {{ store.getTodayCognitiveCount() }} / 12 次</div>
      <div class="grid grid-cols-2 gap-3">
        <button v-for="g in COGNITIVE_GAMES" :key="g.id" @click="open(g.id)" :data-testid="`cognitive-game-${g.id}`" class="rounded-2xl bg-paper p-4 shadow-soft text-left hover:shadow-md transition">
          <div class="text-3xl mb-1">{{ g.emoji }}</div>
          <div class="text-base font-bold text-ink">{{ g.name }}</div>
          <div class="text-xs text-ink/60">{{ g.desc }}</div>
          <div class="text-xs text-moss mt-2">{{ g.benefit }}</div>
        </button>
      </div>
    </div>

    <div v-else>
      <button @click="back" class="text-sm text-clay mb-3">‹ 返回益智</button>

      <div v-if="!started" class="rounded-2xl bg-paper shadow-soft p-5 text-center">
        <div class="text-5xl mb-2">{{ currentGame?.emoji }}</div>
        <div class="text-xl font-bold text-ink mb-1">{{ currentGame?.name }}</div>
        <div class="text-sm text-ink/60 mb-4">{{ currentGame?.desc }}</div>
        <div class="text-xs text-moss mb-4">{{ currentGame?.benefit }}</div>
        <button @click="beginGame" data-testid="cognitive-start" class="w-full py-3 rounded-full bg-clay text-white font-bold">开始</button>
      </div>

      <div v-else class="rounded-2xl bg-paper shadow-soft p-5 text-center">
        <div class="text-xs text-ink/60 mb-2">第 {{ round }} / {{ total }} 关 · 得分 {{ score }}</div>

        <div v-if="currentGame?.id === 'memory-cards'" class="space-y-2">
          <div class="text-lg">翻牌配对</div>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="(c, i) in memoryCards" :key="i" @click="flipCard(i)" class="aspect-square rounded-xl flex items-center justify-center text-3xl transition" :class="cardClass(c)">{{ (c.flipped || c.matched) ? c.icon : '?' }}</button>
          </div>
        </div>

        <div v-else-if="currentGame?.id === 'sequence'" class="space-y-3">
          <div class="text-lg">记住顺序再点</div>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="(c, i) in seqTiles" :key="i" @click="tapSeq(i)" :disabled="seqState!=='input'" class="aspect-square rounded-2xl text-3xl font-bold transition disabled:cursor-not-allowed" :class="seqClass(i)">
              {{ seqReveal.includes(i) ? c.label : (seqState==='input' ? '·' : '') }}
            </button>
          </div>
          <div class="text-xs text-ink/60">本关长度 {{ seqTarget.length }} · 已点 {{ seqInput.length }}</div>
        </div>

        <div v-else-if="currentGame?.id === 'find-difference'" class="space-y-2">
          <div class="text-lg">点出第二排不同的位置</div>
          <div class="text-2xl mb-1">{{ findSet.a }}</div>
          <div class="grid grid-cols-5 gap-1">
            <button v-for="(c, i) in findSet.b.split('')" :key="i" @click="pickDiff(i)" class="aspect-square rounded-lg bg-amber-100 text-2xl hover:bg-amber-200">{{ c }}</button>
          </div>
        </div>

        <div v-else-if="currentGame?.id === 'daily-math'" class="space-y-3">
          <div class="text-6xl font-bold text-ink">{{ math.q }}</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="(o, i) in math.opts" :key="i" @click="pickMath(i)" :class="mathResult===i ? (i===math.answer?'bg-moss text-white':'bg-red-200 text-red-700') : 'bg-moss/10 hover:bg-moss/20'" class="py-3 rounded-xl text-lg font-bold">{{ o }}</button>
          </div>
          <div v-if="mathResult!==null" class="text-xs text-ink/60">{{ mathResult===math.answer ? '答对了' : '正确是 ' + math.a + ' ' + math.op + ' ' + math.b + ' = ' + (math.op==='+'?math.a+math.b:math.op==='-'?math.a-math.b:math.op==='×'?math.a*math.b:Math.floor(math.a/math.b)) }}</div>
        </div>

        <div v-else-if="currentGame?.id === 'word-chain'" class="space-y-3">
          <div class="text-lg">用上一个成语的末字开头</div>
          <div class="text-2xl font-bold text-ink">{{ chainLast }}</div>
          <div class="text-xs text-ink/60">从下面选一个以「{{ chainLast.slice(-1) }}」开头的成语</div>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="(o, i) in chainOpts" :key="i" @click="pickChain(i)" :class="chainResult===i ? (o.startsWith(chainLast.slice(-1))?'bg-moss text-white':'bg-red-200 text-red-700') : 'bg-moss/10 hover:bg-moss/20'" class="py-2 rounded-xl text-base">{{ o }}</button>
          </div>
        </div>

        <div v-else-if="currentGame?.id === 'reminder-time'" class="space-y-3">
          <div class="text-lg">现在 {{ timeQ.now }}，{{ timeQ.desc }}</div>
          <div class="text-6xl">⏰</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="(o, i) in timeQ.opts" :key="i" @click="pickTime(i)" :class="timeResult===i ? (i===timeQ.answer?'bg-moss text-white':'bg-red-200 text-red-700') : 'bg-moss/10 hover:bg-moss/20'" class="py-3 rounded-xl text-lg font-bold">{{ o }}</button>
          </div>
        </div>

        <div v-else-if="currentGame?.id === 'classic-poem'" class="space-y-3">
          <div class="text-lg">下一句是什么？</div>
          <div class="text-base text-ink leading-relaxed">{{ poem.q }}</div>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="(o, i) in poemOptions" :key="i" @click="pickPoem(i)" :class="poemResult===i ? (i===poemAnswerIdx?'bg-moss text-white':'bg-red-200 text-red-700') : 'bg-moss/10 hover:bg-moss/20'" class="py-2 rounded-xl text-base">{{ o }}</button>
          </div>
          <div v-if="poemResult!==null" class="text-xs text-ink/60">{{ poem.author }}</div>
        </div>

        <div v-else-if="currentGame?.id === 'family-photo'" class="space-y-3">
          <div v-if="photoPhase==='show'">
            <div class="text-lg mb-2">记住这几位家人</div>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="(p, i) in photoShown" :key="i" class="aspect-square rounded-2xl bg-amber-100 flex items-center justify-center text-5xl">{{ p.emoji }}</div>
            </div>
            <div class="text-xs text-ink/60 mt-2">{{ photoCountdown }} 秒后开始回忆</div>
          </div>
          <div v-else-if="photoPhase==='recall'">
            <div class="text-lg mb-2">刚才看过的是哪几位？</div>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="(p, i) in photoOptions" :key="i" @click="togglePhoto(i)" :class="photoPicked.has(i)?'ring-4 ring-clay bg-amber-100':'bg-amber-50'" class="aspect-square rounded-2xl flex items-center justify-center text-4xl hover:bg-amber-100">{{ p.emoji }}</button>
            </div>
            <button @click="submitPhoto" class="mt-3 w-full py-2 rounded-full bg-clay text-white font-bold">提交</button>
          </div>
          <div v-else class="text-lg">得分 {{ photoScore }} / {{ photoShown.length }}</div>
        </div>

        <div v-if="done" class="mt-4 text-sm text-moss">本轮得分 {{ score }}，{{ score >= 40 ? '获得奖励！' : '再试试～' }}</div>
        <button v-if="done" @click="restart" class="mt-3 px-4 py-2 rounded-full bg-clay text-white text-sm">再来一次</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '../store';
import { COGNITIVE_GAMES, MEMORY_ICONS, FIND_DIFF_SETS, POEM_QUESTIONS, MATH_DIFFICULTY } from '../data/cognitive';
import { IDIOM_QUESTIONS } from '../data/idioms';
import type { CognitiveGameType } from '../types';

const route = useRoute();
const router = useRouter();
const store = useStore();

const gameId = ref<string>(String(route.params.game || ''));
watch(() => route.params.game, v => { gameId.value = String(v || ''); reset(); });

const currentGame = computed(() => COGNITIVE_GAMES.find(g => g.id === gameId.value));
const open = (id: CognitiveGameType) => router.push('/cognitive/' + id);
const back = () => { gameId.value = ''; reset(); };

const started = ref(false);
const done = ref(false);
const round = ref(1);
const total = 5;
const score = ref(0);

const reset = () => { started.value = false; done.value = false; score.value = 0; round.value = 1; };
const beginGame = () => { reset(); started.value = true; setupRound(); };
const restart = () => { reset(); started.value = true; setupRound(); };
const setupRound = () => {
  if (gameId.value === 'memory-cards') setupMemory();
  else if (gameId.value === 'sequence') setupSeq();
  else if (gameId.value === 'find-difference') setupFind();
  else if (gameId.value === 'daily-math') setupMath();
  else if (gameId.value === 'word-chain') setupChain();
  else if (gameId.value === 'reminder-time') setupTime();
  else if (gameId.value === 'classic-poem') setupPoem();
  else if (gameId.value === 'family-photo') setupPhoto();
};
const nextRound = () => {
  if (round.value >= total) { finishGame(); return; }
  round.value += 1;
  setupRound();
};
const finishGame = () => {
  done.value = true;
  store.recordCognitive(gameId.value, score.value, total * 30, 1);
  started.value = false;
};

// 翻牌
const memoryCards = ref<{ icon: string; flipped: boolean; matched: boolean }[]>([]);
const flipLock = ref(false);
const setupMemory = () => {
  const pairs = [...MEMORY_ICONS].sort(() => Math.random() - 0.5).slice(0, 6);
  const cards = [...pairs, ...pairs].map(icon => ({ icon, flipped: false, matched: false }));
  cards.sort(() => Math.random() - 0.5);
  memoryCards.value = cards;
};
const flipCard = (i: number) => {
  if (flipLock.value) return;
  const c = memoryCards.value[i]; if (!c || c.flipped || c.matched) return;
  c.flipped = true;
  const flipped = memoryCards.value.filter(x => x.flipped && !x.matched);
  if (flipped.length === 2) {
    flipLock.value = true;
    if (flipped[0].icon === flipped[1].icon) {
      flipped.forEach(x => { x.matched = true; x.flipped = false; });
      score.value += 10;
      flipLock.value = false;
      if (memoryCards.value.every(x => x.matched)) nextRound();
    } else {
      setTimeout(() => { flipped.forEach(x => { x.flipped = false; }); flipLock.value = false; }, 700);
    }
  }
};
const cardClass = (c: any) => {
  if (c.matched) return 'bg-moss/20';
  if (c.flipped) return 'bg-amber-100';
  return 'bg-moss/20 hover:bg-moss/30';
};

// 数字序列
const seqTiles = [
  { label: '①' }, { label: '②' }, { label: '③' },
  { label: '④' }, { label: '⑤' }, { label: '⑥' }
];
const seqTarget = ref<number[]>([]);
const seqReveal = ref<number[]>([]);
const seqInput = ref<number[]>([]);
const seqState = ref<'reveal' | 'input' | 'done'>('reveal');
const setupSeq = () => {
  const len = 2 + round.value;
  seqTarget.value = Array.from({ length: len }, () => Math.floor(Math.random() * 6));
  seqReveal.value = [];
  seqInput.value = [];
  seqState.value = 'reveal';
  let i = 0;
  const tick = () => {
    if (i >= seqTarget.value.length) { seqReveal.value = []; seqState.value = 'input'; return; }
    seqReveal.value = [seqTarget.value[i]];
    i += 1;
    setTimeout(tick, 600);
  };
  setTimeout(tick, 400);
};
const tapSeq = (i: number) => {
  if (seqState.value !== 'input') return;
  seqInput.value.push(i);
  if (seqInput.value[seqInput.value.length - 1] !== seqTarget.value[seqInput.value.length - 1]) {
    score.value = Math.max(0, score.value - 5);
    seqState.value = 'done';
    setTimeout(nextRound, 1000);
    return;
  }
  if (seqInput.value.length === seqTarget.value.length) {
    score.value += 15;
    seqState.value = 'done';
    setTimeout(nextRound, 800);
  }
};
const seqClass = (i: number) => {
  if (seqReveal.value.includes(i)) return 'opacity-100 scale-110 bg-clay text-white';
  if (seqState.value === 'done' && seqInput.value.includes(i)) return 'opacity-100 bg-moss text-white';
  return 'opacity-50 bg-moss/10';
};

// 找不同
const findSet = ref(FIND_DIFF_SETS[0]);
const setupFind = () => { findSet.value = FIND_DIFF_SETS[Math.floor(Math.random() * FIND_DIFF_SETS.length)]; };
const pickDiff = (i: number) => {
  if (i === findSet.value.answer) { score.value += 10; nextRound(); }
  else { score.value = Math.max(0, score.value - 3); }
};

// 算术
const math = ref({ q: '', a: 0, b: 0, op: '+', answer: 0, opts: [] as number[], result: -1 });
const mathResult = ref<number | null>(null);
const setupMath = () => {
  const diff = MATH_DIFFICULTY[Math.min(round.value - 1, MATH_DIFFICULTY.length - 1)];
  const op = diff.ops[Math.floor(Math.random() * diff.ops.length)];
  let a = diff.range[0] + Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1));
  let b = diff.range[0] + Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1));
  if (op === '-' && b > a) { [a, b] = [b, a]; }
  if (op === '÷') { b = b || 1; a = b * (1 + Math.floor(Math.random() * 9)); }
  let ans = 0;
  if (op === '+') ans = a + b;
  else if (op === '-') ans = a - b;
  else if (op === '×') ans = a * b;
  else ans = Math.floor(a / b);
  const opts = new Set<number>([ans]);
  while (opts.size < 4) {
    const delta = Math.max(1, Math.round(ans * 0.3));
    const v = ans + Math.floor((Math.random() - 0.5) * 2 * delta);
    opts.add(v);
  }
  const arr = [...opts].sort(() => Math.random() - 0.5);
  math.value = { q: a + ' ' + op + ' ' + b + ' = ?', a, b, op, answer: ans, opts: arr, result: -1 };
  mathResult.value = null;
};
const pickMath = (i: number) => {
  if (mathResult.value !== null) return;
  mathResult.value = i;
  if (math.value.opts[i] === math.value.answer) score.value += 10;
  setTimeout(nextRound, 1100);
};

// 成语接龙
const IDIOMS = IDIOM_QUESTIONS.filter(q => /^[一-鿿]{4}$/.test(q.prompt));
const chainLast = ref('一心一意');
const chainOpts = ref<string[]>([]);
const chainResult = ref<number | null>(null);
const setupChain = () => {
  if (round.value === 1 || !IDIOMS.some(q => q.prompt === chainLast.value)) {
    chainLast.value = IDIOMS[Math.floor(Math.random() * IDIOMS.length)].prompt;
  }
  const lastChar = chainLast.value.slice(-1);
  const candidates = IDIOMS.filter(q => q.prompt.startsWith(lastChar));
  const pool = candidates.length >= 3 ? candidates : IDIOMS;
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  chainOpts.value = picked.map(q => q.prompt);
  chainResult.value = null;
};
const pickChain = (i: number) => {
  if (chainResult.value !== null) return;
  chainResult.value = i;
  const choice = chainOpts.value[i] || '';
  const lastChar = chainLast.value.slice(-1);
  if (choice.startsWith(lastChar)) {
    score.value += 10;
    chainLast.value = choice;
  }
  setTimeout(nextRound, 1100);
};

// 时间计算
const timeQ = ref({ now: '', desc: '', opts: [] as string[], answer: 0 });
const timeResult = ref<number | null>(null);
const setupTime = () => {
  const h = 7 + Math.floor(Math.random() * 11);
  const m = Math.floor(Math.random() * 12) * 5;
  const offsetMin = [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)];
  const desc = offsetMin < 60 ? (offsetMin + ' 分钟后') : (Math.round(offsetMin / 60) + ' 小时后');
  const total2 = h * 60 + m + offsetMin;
  const nh = Math.floor((total2 / 60) % 24);
  const nm = total2 % 60;
  const ans = (nh < 10 ? '0' : '') + nh + ':' + (nm < 10 ? '0' : '') + nm;
  const wrongs = new Set<string>();
  while (wrongs.size < 3) {
    const dh = Math.floor((Math.random() - 0.5) * 4) * 60;
    const dm = Math.floor((Math.random() - 0.5) * 90);
    let wt = total2 + dh + dm;
    wt = ((wt % (24 * 60)) + 24 * 60) % (24 * 60);
    const wh = Math.floor(wt / 60), wm = wt % 60;
    const w = (wh < 10 ? '0' : '') + wh + ':' + (wm < 10 ? '0' : '') + wm;
    if (w !== ans) wrongs.add(w);
  }
  const opts = [ans, ...wrongs].sort(() => Math.random() - 0.5);
  timeQ.value = { now: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m, desc, opts, answer: opts.indexOf(ans) };
  timeResult.value = null;
};
const pickTime = (i: number) => {
  if (timeResult.value !== null) return;
  timeResult.value = i;
  if (i === timeQ.value.answer) score.value += 10;
  setTimeout(nextRound, 1100);
};

// 诗词
const poem = ref(POEM_QUESTIONS[0]);
const poemOptions = ref<string[]>([]);
const poemResult = ref<number | null>(null);
const poemAnswerIdx = computed(() => poemOptions.value.indexOf(poem.value.next));
const setupPoem = () => {
  poem.value = POEM_QUESTIONS[Math.floor(Math.random() * POEM_QUESTIONS.length)];
  const wrong = POEM_QUESTIONS.filter(p => p.next !== poem.value.next).map(p => p.next);
  const opts = [poem.value.next, ...wrong.slice(0, 2)].sort(() => Math.random() - 0.5);
  poemOptions.value = opts;
  poemResult.value = null;
};
const pickPoem = (i: number) => {
  poemResult.value = i;
  if (poemOptions.value[i] === poem.value.next) score.value += 10;
  setTimeout(nextRound, 1100);
};

// 家庭相册
const FAMILY = [
  { emoji: '👵', name: '奶奶' }, { emoji: '👴', name: '爷爷' }, { emoji: '👨', name: '爸爸' },
  { emoji: '👩', name: '妈妈' }, { emoji: '👦', name: '儿子' }, { emoji: '👧', name: '女儿' },
  { emoji: '🧒', name: '孙子' }, { emoji: '👶', name: '宝宝' }, { emoji: '🐱', name: '咪咪' },
  { emoji: '🐶', name: '旺财' }, { emoji: '🌳', name: '老槐树' }, { emoji: '🏠', name: '老房子' }
];
const photoShown = ref<{ emoji: string; name: string }[]>([]);
const photoOptions = ref<{ emoji: string; name: string }[]>([]);
const photoPicked = ref(new Set<number>());
const photoPhase = ref<'show' | 'recall' | 'result'>('show');
const photoCountdown = ref(0);
const photoScore = ref(0);
let photoTimer: number | undefined;
const setupPhoto = () => {
  const n = 2 + Math.floor(round.value / 2);
  const shown = [...FAMILY].sort(() => Math.random() - 0.5).slice(0, n);
  const distractors = [...FAMILY].filter(f => !shown.includes(f)).sort(() => Math.random() - 0.5).slice(0, 6 - n);
  photoShown.value = shown;
  photoOptions.value = [...shown, ...distractors].sort(() => Math.random() - 0.5);
  photoPicked.value = new Set();
  photoPhase.value = 'show';
  photoCountdown.value = 3;
  const tick = () => {
    photoCountdown.value -= 1;
    if (photoCountdown.value <= 0) { photoPhase.value = 'recall'; return; }
    photoTimer = window.setTimeout(tick, 1000);
  };
  photoTimer = window.setTimeout(tick, 1000);
};
const togglePhoto = (i: number) => {
  if (photoPicked.value.has(i)) photoPicked.value.delete(i); else photoPicked.value.add(i);
  photoPicked.value = new Set(photoPicked.value);
};
const submitPhoto = () => {
  let correct = 0;
  photoShown.value.forEach(s => {
    const idx = photoOptions.value.findIndex(o => o.emoji === s.emoji);
    if (idx >= 0 && photoPicked.value.has(idx)) correct += 1;
  });
  photoScore.value = correct * 10;
  score.value += photoScore.value;
  photoPhase.value = 'result';
  setTimeout(nextRound, 1400);
};

onUnmounted(() => { if (photoTimer) clearTimeout(photoTimer); });
</script>

