// 共享类型定义
export type ID = string;

export interface City {
  id: ID; name: string; province: string;
  region: 'north'|'east'|'south'|'central'|'southwest'|'northwest'|'northeast';
  lat: number; lng: number;
}

export type CurrencyType = 'coin' | 'real' | 'ticket' | 'token';
export type ItemCategory = 'food' | 'pigeon' | 'paper' | 'stamp' | 'tool' | 'cosmetic' | 'gift';
export interface ShopItem {
  id: ID; name: string; category: ItemCategory;
  price: { currency: CurrencyType; amount: number };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  payload?: Record<string, any>;
  stock?: number | 'infinite';
  limited?: boolean;
  unlockLevel?: number;
}

export type PigeonBreed = 'common'|'racing'|'homing'|'swift'|'messenger'|'mottled'|'snow'|'lavender'|'golden'|'phoenix';
export type PigeonStatus = 'idle' | 'flying' | 'returning' | 'resting';
export interface PigeonStats { speed: number; endurance: number; luck: number; stamina: number; }
export interface PigeonAppearance {
  paletteId: string; patternId: string; accessories: ID[];
  palette?: { body: string; wing: string; beak: string; tail: string; eye: string };
}
export interface Pigeon {
  id: ID; ownerId: ID; name: string; breed: PigeonBreed; stats: PigeonStats;
  appearance: PigeonAppearance;
  satiety: number; mood: number; exp: number; level: number;
  status: PigeonStatus; lastFedAt: number; lastTickAt: number; createdAt: number;
}

export type LetterStatus = 'draft'|'flying'|'delivered'|'read'|'lost';
export type WeatherType = 'sunny'|'cloudy'|'rain'|'storm'|'heavyStorm';
export interface LetterContent {
  text: string; handwriting?: string; voiceUrl?: string; voiceDuration?: number;
  photos?: string[]; stationeryId: ID; stampId: ID; weight: number;
}
export interface WeatherEvent { type: WeatherType; factor: number; }
export interface Flight {
  pigeonId: ID; distance: number; baseHours: number; finalHours: number;
  weather: WeatherEvent[];
  path: { lat: number; lng: number; t: number }[];
  startedAt: number; etaAt: number; lostReason?: string;
}
export interface Letter {
  id: ID;
  fromUserId: ID; fromUserName: string; fromCityId: ID;
  toUserId: ID; toUserName: string; toCityId: ID;
  content: LetterContent; status: LetterStatus; flight?: Flight;
  sentAt: number; deliveredAt?: number; readAt?: number;
  replyToId?: ID; earnedCoins: number;
}

export interface Friend {
  id: ID; userId: ID; friendUserId: ID;
  friendName: string; friendCityId: ID; alias?: string;
  addedAt: number; isDemo?: boolean;
}

export type UserRole = 'kid' | 'elder' | 'guest';
export interface User {
  id: ID; openid?: string; name: string; avatar?: string;
  homeCityId: ID; coins: number; realBalance: number;
  tickets: number; tokens: number;
  level: number; exp: number; role: UserRole;
  bigFontMode: boolean; soundOn: boolean;
  streak: number; lastCheckInDate?: string;
  inventory: Record<string, number>; pigeonIds: ID[]; createdAt: number;
}

export type LearningModule = 'idioms' | 'vocab' | 'riddles';
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Question {
  id: ID; module: LearningModule; prompt: string;
  options: string[]; answer: number; difficulty: Difficulty; reward: number; explain?: string;
}
export interface LearningProgress {
  userId: ID; module: LearningModule; sessionsToday: number;
  lastSessionDate: string; recentIds: ID[];
  totalAnswered: number; correctAnswered: number;
  bestStreak: number; currentStreak: number;
}

export type CognitiveGameType =
  'memory-cards'|'sequence'|'find-difference'|'daily-math'|
  'word-chain'|'reminder-time'|'classic-poem'|'family-photo';
export interface CognitiveScore {
  userId: ID; game: CognitiveGameType;
  date: string; score: number; duration: number; level: number;
}

export type TxnType = 'earn'|'spend'|'reward'|'iap'|'gift'|'system';
export interface Transaction {
  id: ID; userId: ID; type: TxnType; currency: CurrencyType;
  amount: number; reason: string; ts: number;
}
