
import { defineStore } from 'pinia';
import { reactive, computed, ref, watch } from 'vue';
import { storage, CURRENT_USER_KEY } from './storage';
import type { User, Pigeon, Letter, Friend, LearningProgress, CognitiveScore, Transaction, PigeonBreed, CurrencyType, Question, LearningModule } from './types';
import { BREED_MAP, DEFAULT_APPEARANCE, PALETTES } from './data/breeds';
import { CITY_MAP } from './data/cities';
import { SHOP_MAP } from './data/shop';
import { IDIOM_QUESTIONS } from './data/idioms';
import { VOCAB_QUESTIONS } from './data/vocab';
import { RIDDLE_QUESTIONS } from './data/riddles';
import { calcEtaHours, buildFlightPath } from './utils/eta';
import { pigeonTick, feedPigeon } from './utils/pigeon';
import { id as makeId } from './utils/random';
import { todayKey } from './utils/format';

interface AllState {
  users: Record<string, User>;
  pigeons: Record<string, Pigeon>;
  letters: Record<string, Letter>;
  friends: Record<string, Friend>;
  progress: Record<string, LearningProgress>;
  cognitive: Record<string, CognitiveScore>;
  txns: Record<string, Transaction>;
}

export const useStore = defineStore('app', () => {
  const state = reactive<AllState>(storage.get('state', { users:{}, pigeons:{}, letters:{}, friends:{}, progress:{}, cognitive:{}, txns:{} }));
  const currentUserId = ref<string>(storage.get(CURRENT_USER_KEY, ''));
  watch(() => state, (v) => storage.set('state', v), { deep: true });
  watch(currentUserId, (v) => storage.set(CURRENT_USER_KEY, v));

  const currentUser = computed<User | null>(() => state.users[currentUserId.value] || null);
  const myPigeons = computed<Pigeon[]>(() => currentUser.value ? currentUser.value.pigeonIds.map(id => state.pigeons[id]).filter(Boolean) as Pigeon[] : []);
  const myLetters = computed<Letter[]>(() => Object.values(state.letters).filter(l => l.fromUserId === currentUserId.value || l.toUserId === currentUserId.value));
  const inbox = computed<Letter[]>(() => myLetters.value.filter(l => l.toUserId === currentUserId.value).sort((a, b) => b.sentAt - a.sentAt));
  const outbox = computed<Letter[]>(() => myLetters.value.filter(l => l.fromUserId === currentUserId.value).sort((a, b) => b.sentAt - a.sentAt));
  const unreadCount = computed(() => inbox.value.filter(l => l.status === 'delivered').length);

  // 交易流水
  function addTxn(t: Omit<Transaction, 'id' | 'ts' | 'userId'>) {
    if (!currentUser.value) return;
    const x: Transaction = { id: makeId('t'), ts: Date.now(), userId: currentUser.value.id, ...t };
    state.txns[x.id] = x;
  }
  function adjustCoin(delta: number, reason: string): boolean {
    if (!currentUser.value) return false;
    if (currentUser.value.coins + delta < 0) return false;
    currentUser.value.coins += delta;
    addTxn({ type: delta >= 0 ? 'earn' : 'spend', currency: 'coin', amount: delta, reason });
    return true;
  }
  function adjustCurrency(c: CurrencyType, delta: number, reason: string): boolean {
    if (!currentUser.value) return false;
    const u = currentUser.value;
    if (c === 'coin') return adjustCoin(delta, reason);
    if (c === 'real') u.realBalance = Math.max(0, u.realBalance + delta);
    if (c === 'ticket') u.tickets = Math.max(0, u.tickets + delta);
    if (c === 'token') u.tokens = Math.max(0, u.tokens + delta);
    addTxn({ type: delta >= 0 ? 'reward' : 'spend', currency: c, amount: delta, reason });
    return true;
  }
  function earnExp(amount: number) {
    if (!currentUser.value) return;
    const u = currentUser.value;
    const need = u.level * 30 + 30;
    u.exp += amount;
    while (u.exp >= need) { u.exp -= need; u.level += 1; }
  }

  // 用户管理
  function createUser(name: string, homeCityId: string, role: 'kid' | 'elder' | 'guest' = 'kid'): User {
    const u: User = {
      id: makeId('u'), name, homeCityId,
      coins: 50, realBalance: 0, tickets: 3, tokens: 0,
      level: 1, exp: 0, role, bigFontMode: role === 'elder', soundOn: true,
      streak: 0,
      inventory: { 'food-basic': 5, 'paper-plain': 3, 'stamp-common': 3 },
      pigeonIds: [], createdAt: Date.now()
    };
    state.users[u.id] = u;
    if (!currentUserId.value) currentUserId.value = u.id;
    return u;
  }
  function switchUser(id: string) { currentUserId.value = id; }
  function listAllUsers(): User[] { return Object.values(state.users); }
  function toggleBigFont() { if (currentUser.value) currentUser.value.bigFontMode = !currentUser.value.bigFontMode; }

  // 鸽子
  function adoptPigeon(breed: PigeonBreed, name: string): Pigeon | null {
    if (!currentUser.value) return null;
    if (currentUser.value.pigeonIds.length >= 4) return null;
    const b = BREED_MAP[breed];
    const p: Pigeon = {
      id: makeId('p'), ownerId: currentUser.value.id, name, breed,
      stats: { speed: b.speed, endurance: b.endurance, luck: b.luck, stamina: b.stamina },
      appearance: DEFAULT_APPEARANCE(breed),
      satiety: 80, mood: 90, exp: 0, level: 1,
      status: 'idle', lastFedAt: Date.now(), lastTickAt: Date.now(), createdAt: Date.now()
    };
    state.pigeons[p.id] = p;
    currentUser.value.pigeonIds.push(p.id);
    return p;
  }
  function tickAllPigeons() {
    const now = Date.now();
    for (const p of Object.values(state.pigeons)) state.pigeons[p.id] = pigeonTick(p, now);
  }
  function feed(pigeonId: string, foodId: string): boolean {
    const p = state.pigeons[pigeonId]; if (!p) return false;
    const item = SHOP_MAP[foodId]; if (!item) return false;
    const u = currentUser.value; if (!u) return false;
    if ((u.inventory[foodId] || 0) <= 0) return false;
    u.inventory[foodId] -= 1;
    const payload = item.payload || { satiety: 20 };
    state.pigeons[pigeonId] = feedPigeon(p, payload as any, Date.now());
    return true;
  }
  function restPigeon(pigeonId: string) {
    const p = state.pigeons[pigeonId];
    if (!p) return;
    if (p.status === 'flying' || p.status === 'returning') return;
    state.pigeons[pigeonId] = { ...p, status: 'resting', lastTickAt: Date.now() };
  }
  function customizePigeon(pigeonId: string, paletteId?: string, accessoryAdd?: string, accessoryRm?: string) {
    const p = state.pigeons[pigeonId]; if (!p) return;
    const next = { ...p, appearance: { ...p.appearance, accessories: [...p.appearance.accessories] } };
    if (paletteId) {
      const fromData = PALETTES[paletteId];
      if (fromData) {
        next.appearance.paletteId = paletteId;
        next.appearance.palette = fromData;
      }
    }
    if (accessoryAdd && !next.appearance.accessories.includes(accessoryAdd)) next.appearance.accessories.push(accessoryAdd);
    if (accessoryRm) next.appearance.accessories = next.appearance.accessories.filter(a => a !== accessoryRm);
    state.pigeons[pigeonId] = next;
  }

  // 好友
  function addFriend(name: string, homeCityId: string, isDemo = false, friendUserId?: string): Friend | null {
    if (!currentUser.value) return null;
    const f: Friend = {
      id: makeId('f'), userId: currentUser.value.id, friendUserId: friendUserId || makeId('u'),
      friendName: name, friendCityId: homeCityId, addedAt: Date.now(), isDemo
    };
    state.friends[f.id] = f;
    return f;
  }
  function removeFriend(id: string) { delete state.friends[id]; }
  function getMyFriends(): Friend[] {
    if (!currentUser.value) return [];
    return Object.values(state.friends).filter(f => f.userId === currentUser.value!.id);
  }

  // 信件
  function sendLetter(opts: {
    toUserId: string; toUserName: string; toCityId: string;
    pigeonId: string; text: string; stationeryId: string; stampId: string;
    replyToId?: string;
  }): Letter | null {
    const u = currentUser.value; if (!u) return null;
    const pigeon = state.pigeons[opts.pigeonId];
    if (!pigeon) return null;
    if (pigeon.status !== 'idle' && pigeon.status !== 'resting') return null;
    if (pigeon.mood < 30 || pigeon.satiety < 10 || pigeon.stats.stamina < 20) return null;
    if ((u.inventory[opts.stationeryId] || 0) <= 0) return null;
    if ((u.inventory[opts.stampId] || 0) <= 0) return null;
    u.inventory[opts.stationeryId] -= 1;
    u.inventory[opts.stampId] -= 1;

    const from = CITY_MAP[u.homeCityId];
    const to = CITY_MAP[opts.toCityId];
    if (!from || !to) return null;
    const { baseHours, finalHours, weather, distance } = calcEtaHours({
      pigeon, letter: { content: { text: opts.text, weight: 1 } as any, fromCityId: u.homeCityId, toCityId: opts.toCityId } as any,
      from: { lat: from.lat, lng: from.lng }, to: { lat: to.lat, lng: to.lng }
    });
    const startedAt = Date.now();
    const etaAt = startedAt + finalHours * 3600_000;
    const weight = 1 + (opts.text.length > 100 ? 0.3 : 0);

    const letter: Letter = {
      id: makeId('l'),
      fromUserId: u.id, fromUserName: u.name, fromCityId: u.homeCityId,
      toUserId: opts.toUserId, toUserName: opts.toUserName, toCityId: opts.toCityId,
      content: { text: opts.text, stationeryId: opts.stationeryId, stampId: opts.stampId, weight },
      status: 'flying',
      flight: {
        pigeonId: opts.pigeonId, distance, baseHours, finalHours, weather,
        path: buildFlightPath({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }, finalHours, startedAt),
        startedAt, etaAt
      },
      sentAt: startedAt,
      replyToId: opts.replyToId,
      earnedCoins: 0
    };
    state.letters[letter.id] = letter;
    state.pigeons[pigeon.id] = { ...pigeon, status: 'flying', stats: { ...pigeon.stats, stamina: Math.max(0, pigeon.stats.stamina - 30) } };
    addTxn({ type: 'system', currency: 'coin', amount: 0, reason: '寄出一封信' });
    scheduleDelivery(letter.id);
    return letter;
  }
  function scheduleDelivery(letterId: string) {
    const l = state.letters[letterId]; if (!l || !l.flight) return;
    const delay = Math.max(1000, l.flight.etaAt - Date.now());
    setTimeout(() => deliverLetter(letterId), delay);
  }
  function deliverLetter(letterId: string) {
    const l = state.letters[letterId]; if (!l) return;
    if (l.status !== 'flying') return;
    // 风险检查
    const pigeon = state.pigeons[l.flight!.pigeonId];
    if (pigeon) {
      const hasStorm = l.flight!.weather.some(w => w.type === 'heavyStorm');
      if (hasStorm && pigeon.stats.luck < 50) {
        state.letters[letterId] = { ...l, status: 'lost', flight: { ...l.flight!, lostReason: '暴风雨中迷失方向' } };
        return;
      }
    }
    state.letters[letterId] = { ...l, status: 'delivered', deliveredAt: Date.now() };
    // 寄件人获得奖励
    if (state.users[l.fromUserId]) {
      const u = state.users[l.fromUserId];
      u.coins += 10; u.exp += 5;
      addTxn({ type: 'reward', currency: 'coin', amount: 10, reason: '信件送达奖励' });
    }
    // 鸽子回归
    if (pigeon) state.pigeons[pigeon.id] = { ...pigeon, status: 'returning' };
    setTimeout(() => {
      const p = state.pigeons[l.flight!.pigeonId];
      if (p) state.pigeons[p.id] = { ...p, status: 'idle' };
    }, 5000);
    // 如果是寄给 demo 好友，自动回信
    scheduleAutoReply(letterId);
  }
  function markRead(letterId: string) {
    const l = state.letters[letterId]; if (!l) return;
    if (l.toUserId !== currentUserId.value) return;
    if (l.status === 'delivered') state.letters[letterId] = { ...l, status: 'read', readAt: Date.now() };
  }

  // demo 好友自动回信
  function scheduleAutoReply(letterId: string) {
    const l = state.letters[letterId]; if (!l) return;
    // 找 demo 好友
    const friends = Object.values(state.friends).filter(f => f.friendUserId === l.toUserId);
    if (friends.length === 0) return;
    if (!friends[0].isDemo) return;
    // 5-30 秒回信（demo 用真实时间）
    const delay = 5000 + Math.random() * 25000;
    setTimeout(() => {
      autoReply(letterId);
    }, delay);
  }
  function autoReply(originalLetterId: string) {
    const l = state.letters[originalLetterId]; if (!l) return;
    const replies = [
      '收到你的信，奶奶好开心！天冷了，多穿点衣服。',
      '我在家挺好的，每天都去公园打太极。',
      '想你了！等你放假回来，奶奶给你做红烧肉。',
      '学习辛苦了，记得多休息，别熬夜。',
      '我种的月季开花了，等你回来看。',
      '今天的天气真好，下午去市场买了点水果。',
      '邻居王奶奶也问你好，让你有空来玩。',
      '保重身体，我们全家都为你骄傲。'
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    // 切换到 demo 好友身份写信
    const demoFriend = Object.values(state.friends).find(f => f.friendUserId === l.toUserId);
    if (!demoFriend) return;
    const myPrevId = currentUserId.value;
    switchUser(demoFriend.friendUserId);
    // 找一个 demo 用户的鸽子（自动创建）
    let demoPigeonId = '';
    const demoUser = state.users[demoFriend.friendUserId];
    if (demoUser) {
      demoPigeonId = demoUser.pigeonIds[0];
      if (!demoPigeonId) {
        const p = adoptPigeon('homing', demoFriend.friendName + '的鸽子');
        if (p) demoPigeonId = p.id;
      }
    }
    if (demoPigeonId) {
      // 给 demo 库存
      if (demoUser) {
        demoUser.inventory['paper-plain'] = (demoUser.inventory['paper-plain'] || 0) + 1;
        demoUser.inventory['stamp-common'] = (demoUser.inventory['stamp-common'] || 0) + 1;
      }
      const newLetter = sendLetter({
        toUserId: l.fromUserId, toUserName: l.fromUserName, toCityId: l.fromCityId,
        pigeonId: demoPigeonId, text: replyText, stationeryId: 'paper-plain', stampId: 'stamp-common',
        replyToId: originalLetterId
      });
      if (newLetter) {
        // 加速 demo 回信（30 秒到达）
        if (newLetter.flight) {
          state.letters[newLetter.id] = {
            ...newLetter,
            flight: { ...newLetter.flight, finalHours: 0.005, etaAt: Date.now() + 5000 }
          };
        }
      }
    }
    switchUser(myPrevId);
  }


  // 学习进度
  function getProgress(module: LearningModule): LearningProgress {
    const key = currentUserId.value + ':' + module;
    return state.progress[key] || (state.progress[key] = {
      userId: currentUserId.value, module, sessionsToday: 0,
      lastSessionDate: '', recentIds: [],
      totalAnswered: 0, correctAnswered: 0, bestStreak: 0, currentStreak: 0
    });
  }
  function todayDate() { return todayKey(); }
  function canStartSession(module: LearningModule): boolean {
    const p = getProgress(module);
    if (p.lastSessionDate !== todayDate()) return true;
    return p.sessionsToday < 3;
  }
  function startSession(module: LearningModule): boolean {
    if (!canStartSession(module)) return false;
    const p = getProgress(module);
    if (p.lastSessionDate !== todayDate()) p.sessionsToday = 0;
    p.sessionsToday += 1;
    p.lastSessionDate = todayDate();
    return true;
  }
  function pickQuestions(module: LearningModule, count: number, difficulty?: 'easy'|'medium'|'hard'): Question[] {
    const all = module === 'idioms' ? IDIOM_QUESTIONS : module === 'vocab' ? VOCAB_QUESTIONS : RIDDLE_QUESTIONS;
    const pool = difficulty ? all.filter(q => q.difficulty === difficulty) : all;
    const p = getProgress(module);
    const recent = new Set(p.recentIds);
    const candidates = pool.filter(q => !recent.has(q.id));
    if (candidates.length < count) {
      p.recentIds = [];
      return pool.slice(0, count);
    }
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    p.recentIds = [...p.recentIds, ...picked.map(q => q.id)].slice(-30);
    return picked;
  }
  function submitAnswer(module: LearningModule, qid: string, correct: boolean, reward: number) {
    const p = getProgress(module);
    p.totalAnswered += 1;
    if (correct) {
      p.correctAnswered += 1;
      p.currentStreak += 1;
      p.bestStreak = Math.max(p.bestStreak, p.currentStreak);
      adjustCoin(reward, '答题奖励');
      earnExp(Math.floor(reward / 5));
    } else {
      p.currentStreak = 0;
    }
  }

  // 认知游戏分数
  function recordCognitive(game: string, score: number, duration: number, level: number) {
    const id = makeId('c');
    state.cognitive[id] = { id, userId: currentUserId.value, game: game as any, date: todayDate(), score, duration, level } as any;
    if (score >= 60) {
      adjustCoin(Math.floor(score / 10), '益智游戏奖励');
      earnExp(2);
    }
  }
  function getTodayCognitiveCount(): number {
    return Object.values(state.cognitive).filter(c => c.userId === currentUserId.value && c.date === todayDate()).length;
  }


  // 商店
  function buyItem(itemId: string, qty = 1): boolean {
    const u = currentUser.value; if (!u) return false;
    const item = SHOP_MAP[itemId]; if (!item) return false;
    const total = item.price.amount * qty;
    if (item.price.currency === 'coin' && u.coins < total) return false;
    if (item.price.currency === 'real' && u.realBalance < total) return false;
    if (item.price.currency === 'token' && u.tokens < total) return false;
    if (item.price.currency === 'ticket' && u.tickets < total) return false;
    if (item.category === 'pigeon' && u.pigeonIds.length >= 4) return false;
    adjustCurrency(item.price.currency, -total, '购买 ' + item.name);
    u.inventory[itemId] = (u.inventory[itemId] || 0) + qty;
    if (item.category === 'pigeon' && item.payload?.breed) {
      adoptPigeon(item.payload.breed as PigeonBreed, item.name);
    }
    return true;
  }
  function rewardAd(): { coins: number; extraLearn: number } | null {
    const u = currentUser.value; if (!u) return null;
    if (u.tickets <= 0) return null;
    u.tickets -= 1;
    u.coins += 50;
    addTxn({ type: 'reward', currency: 'coin', amount: 50, reason: '观看广告奖励' });
    return { coins: 50, extraLearn: 1 };
  }
  function iapAddRealCoins(packId: string): boolean {
    const u = currentUser.value; if (!u) return false;
    const pack: any = { 'coin-100': 100, 'coin-600': 650, 'coin-3000': 3400 }[packId];
    if (!pack) return false;
    u.realBalance += pack;
    u.coins += pack;
    addTxn({ type: 'iap', currency: 'real', amount: pack, reason: 'IAP 充值' });
    return true;
  }


  // 每日签到
  function dailyCheckIn(): { ok: boolean; reward: number; streak: number } {
    const u = currentUser.value; if (!u) return { ok: false, reward: 0, streak: 0 };
    if (u.lastCheckInDate === todayDate()) return { ok: false, reward: 0, streak: u.streak };
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (u.lastCheckInDate === todayKey(yesterday)) u.streak += 1; else u.streak = 1;
    u.lastCheckInDate = todayDate();
    const reward = 10 + u.streak * 5;
    u.coins += reward; u.exp += 10;
    addTxn({ type: 'reward', currency: 'coin', amount: reward, reason: '每日签到' });
    return { ok: true, reward, streak: u.streak };
  }

  // 首次启动：建 demo 用户和鸽子
  function ensureSeed() {
    if (Object.keys(state.users).length > 0) return;
    // 玩家默认 kid
    const me = createUser('小明', 'beijing', 'kid');
    currentUserId.value = me.id;
    // 奶奶在广州（demo 好友）
    const grandma = createUser('奶奶', 'guangzhou', 'elder');
    const lao = createUser('老朋友王伯', 'shanghai', 'elder');
    addFriend('奶奶', 'guangzhou', true, grandma.id);
    addFriend('老朋友王伯', 'shanghai', true, lao.id);
    // 给玩家一只普通鸽
    adoptPigeon('common', '小灰');
    // 给 demo 好友鸽子
    switchUser(grandma.id);
    const gp = adoptPigeon('homing', '老飞鸽');
    if (gp) { gp.satiety = 90; gp.mood = 95; }
    switchUser(lao.id);
    const lp = adoptPigeon('racing', '飞毛腿');
    if (lp) { lp.satiety = 90; lp.mood = 95; }
    switchUser(me.id);
  }

  // 重置（调试用）
  function resetAll() {
    state.users = {}; state.pigeons = {}; state.letters = {}; state.friends = {};
    state.progress = {}; state.cognitive = {}; state.txns = {};
    currentUserId.value = '';
    storage.remove('state'); storage.remove(CURRENT_USER_KEY);
    ensureSeed();
  }

  // 启动时执行：自动 tick 鸽子 + 投递检查
  function bootstrap() {
    // 真 onboarding：首次启动不自动 seed，等用户走完 onboarding 再创建
    if (!currentUserId.value && Object.keys(state.users).length > 0) {
      currentUserId.value = Object.values(state.users)[0].id;
    }
    tickAllPigeons();
    // 启动时检查未送达的信件
    for (const l of Object.values(state.letters)) {
      if (l.status === 'flying' && l.flight && l.flight.etaAt <= Date.now()) {
        deliverLetter(l.id);
      } else if (l.status === 'flying' && l.flight) {
        scheduleDelivery(l.id);
      }
    }
    // 启动后台 tick（每 60s 跑一次）
    setInterval(tickAllPigeons, 60000);
  }

  return {
    state, currentUserId, currentUser, myPigeons, myLetters, inbox, outbox, unreadCount,
    adjustCoin, adjustCurrency, earnExp,
    createUser, switchUser, listAllUsers, toggleBigFont,
    adoptPigeon, tickAllPigeons, feed, restPigeon, customizePigeon,
    addFriend, removeFriend, getMyFriends,
    sendLetter, deliverLetter, markRead, scheduleAutoReply,
    getProgress, canStartSession, startSession, pickQuestions, submitAnswer,
    recordCognitive, getTodayCognitiveCount,
    buyItem, rewardAd, iapAddRealCoins,
    dailyCheckIn, ensureSeed, resetAll, bootstrap
  };
});




