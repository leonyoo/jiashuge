
<template>
  <div class="px-4 py-4">
    <div class="text-2xl font-bold text-ink mb-1">写信</div>
    <div class="text-sm text-ink/60 mb-4">选一只鸽子，安静地记下你的心意</div>
    <div v-if="!store.getMyFriends().length" class="py-12 text-center text-ink/50">还没有好友，去“我”里加</div>
    <div v-else class="space-y-4">
      <section>
        <div class="text-sm font-bold text-ink mb-2">1. 收信人</div>
        <div class="space-y-1.5">
          <label v-for="f in store.getMyFriends()" :key="f.id" :data-testid="`compose-friend-${f.friendUserId}`" class="flex items-center gap-2 p-2 rounded-xl bg-paper" :class="toFriendId===f.friendUserId?'ring-2 ring-clay':''">
            <input type="radio" v-model="toFriendId" :value="f.friendUserId" class="accent-clay" />
            <span class="text-base">{{ f.friendName }}</span>
            <span class="text-xs text-ink/50">{{ cityName(f.friendCityId) }}</span>
          </label>
        </div>
      </section>
      <section v-if="toFriendId">
        <div class="text-sm font-bold text-ink mb-2">2. 选鸽子</div>
        <div class="grid grid-cols-2 gap-2">
          <label v-for="p in availablePigeons" :key="p.id" :data-testid="`compose-pigeon-${p.id}`" class="rounded-xl bg-paper p-2 flex items-center gap-2" :class="pigeonId===p.id?'ring-2 ring-clay':''">
            <input type="radio" v-model="pigeonId" :value="p.id" class="accent-clay" />
            <PigeonSprite :pigeon="p" :size="40" />
            <div class="text-xs">
              <div class="font-bold">{{ p.name }}</div>
              <div class="text-ink/50">{{ breedName(p.breed) }} · 体 {{ Math.round(p.stats.stamina) }}</div>
            </div>
          </label>
          <div v-if="!availablePigeons.length" class="col-span-2 text-center text-sm text-ink/50 py-4">没有可用的鸽子（所有都在跑或体力不足）</div>
        </div>
      </section>
      <section v-if="pigeonId">
        <div class="text-sm font-bold text-ink mb-2">3. 信纸与邮票</div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div class="text-ink/60 mb-1">信纸</div>
            <div class="flex flex-wrap gap-1">
              <button v-for="p in PAPERS" :key="p.id" @click="stationeryId=p.id" :disabled="(store.currentUser?.inventory[p.id]||0)<=0" :class="stationeryId===p.id?'ring-2 ring-clay':''" class="px-2 py-1 rounded-lg bg-paper disabled:opacity-30">{{ p.name }} x{{ store.currentUser?.inventory[p.id]||0 }}</button>
            </div>
          </div>
          <div>
            <div class="text-ink/60 mb-1">邮票</div>
            <div class="flex flex-wrap gap-1">
              <button v-for="s in STAMPS" :key="s.id" @click="stampId=s.id" :disabled="(store.currentUser?.inventory[s.id]||0)<=0" :class="stampId===s.id?'ring-2 ring-clay':''" class="px-2 py-1 rounded-lg bg-paper disabled:opacity-30">{{ s.name }} x{{ store.currentUser?.inventory[s.id]||0 }}</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="pigeonId">
        <div class="text-sm font-bold text-ink mb-2">4. 写信</div>
        <textarea v-model="text" data-testid="compose-text" rows="6" maxlength="500" class="w-full p-3 rounded-xl bg-paper border border-ink/10 text-base" placeholder="爱的姨姨，我想你了..."></textarea>
        <div class="text-right text-xs text-ink/40 mt-1">{{ text.length }} / 500</div>
        <div v-if="preview" class="mt-2 text-xs text-ink/60">预计送达：{{ preview.hours }} 小时 · {{ preview.distance }} km</div>
      </section>
      <button v-if="pigeonId" @click="send" data-testid="compose-send" :disabled="!text || !stationeryId || !stampId" class="w-full py-3 rounded-full bg-clay text-white font-bold disabled:opacity-50">寄出这封信</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import PigeonSprite from "../components/PigeonSprite.vue";
import { PAPERS, STAMPS } from "../data/stationery";
import { BREED_MAP } from "../data/breeds";
import { CITY_MAP } from "../data/cities";
import { calcEtaHours } from "../utils/eta";
import { formatHours, formatDistance } from "../utils/format";
const store = useStore();
const router = useRouter();
const friends = computed(() => store.getMyFriends());
const toFriendId = ref(friends.value[0]?.friendUserId || "");
watch(friends, v => { if (!toFriendId.value && v.length) toFriendId.value = v[0].friendUserId; });
const pigeonId = ref("");
const stationeryId = ref("paper-plain");
const stampId = ref("stamp-common");
const text = ref("");
const availablePigeons = computed(() => store.myPigeons.filter(p => p.status==="idle"||p.status==="resting") && store.myPigeons.filter(p => p.mood>=30 && p.satiety>=10 && p.stats.stamina>=20));
watch(availablePigeons, v => { if (!pigeonId.value && v.length) pigeonId.value = v[0].id; }, { immediate: true });
const breedName = (b: string) => BREED_MAP[b as keyof typeof BREED_MAP]?.name || b;
const cityName = (id: string) => CITY_MAP[id]?.name || id;
const preview = computed(() => {
  if (!pigeonId.value || !toFriendId.value) return null;
  const p = store.state.pigeons[pigeonId.value]; const f = friends.value.find(x => x.friendUserId===toFriendId.value); if (!p || !f) return null;
  const from = CITY_MAP[store.currentUser!.homeCityId]; const to = CITY_MAP[f.friendCityId]; if (!from || !to) return null;
  const r = calcEtaHours({ pigeon: p, letter: { content: { text: text.value, weight: 1 } as any, fromCityId: from.id, toCityId: to.id } as any, from, to });
  return { hours: formatHours(r.finalHours), distance: formatDistance(r.distance) };
});
const send = () => {
  const f = friends.value.find(x => x.friendUserId===toFriendId.value); if (!f) return;
  const l = store.sendLetter({ toUserId: f.friendUserId, toUserName: f.friendName, toCityId: f.friendCityId, pigeonId: pigeonId.value, text: text.value, stationeryId: stationeryId.value, stampId: stampId.value });
  if (l) { router.push("/flying/" + l.id); }
  else { alert("寄信失败，检查鸽子状态与信纸邮票库存"); }
};
</script>
