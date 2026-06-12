import { ref, computed, type ComputedRef } from 'vue';

export type Locale = 'zh-CN' | 'en-US';

const STORAGE_KEY = 'locale';

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'app.name': '家书鸽',
    'common.back': '返回',
    'common.close': '关闭',
    'common.confirm': '确定',
    'common.cancel': '取消',
    'common.loading': '加载中…',
    'common.language': '语言',
    'mailbox.title': '信箱',
    'mailbox.inbox': '收件箱',
    'mailbox.outbox': '发件箱',
    'mailbox.emptyInbox': '还没有来信',
    'mailbox.emptyOutbox': '还没有寄出的信',
    'me.bigFont': '长辈大字号',
    'me.friends': '好友',
    'me.shop': '商店',
    'me.cognitive': '益智',
    'cognitive.games': '益智',
    'cognitive.today': '今日已玩',
    'shop.title': '商店',
    'onboarding.welcome': '家书鸽',
    'error.generic': '出了一点小问题',
    'notFound.title': '迷路了',
    'notFound.desc': '信鸽飞向了陌生的远方，请回到熟悉的鸽舍'
  },
  'en-US': {
    'app.name': 'Letter Pigeon',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.confirm': 'OK',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.language': 'Language',
    'mailbox.title': 'Mailbox',
    'mailbox.inbox': 'Inbox',
    'mailbox.outbox': 'Outbox',
    'mailbox.emptyInbox': 'No letters yet',
    'mailbox.emptyOutbox': 'No sent letters yet',
    'me.bigFont': 'Large text mode',
    'me.friends': 'Friends',
    'me.shop': 'Shop',
    'me.cognitive': 'Cognitive',
    'cognitive.games': 'Cognitive games',
    'cognitive.today': 'Played today',
    'shop.title': 'Shop',
    'onboarding.welcome': 'Letter Pigeon',
    'error.generic': 'Something went wrong',
    'notFound.title': 'Lost',
    'notFound.desc': 'The pigeon flew to unknown lands. Please head back home.'
  }
};

function readStored(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'zh-CN' || v === 'en-US') return v;
  } catch {}
  // 简单启发：浏览器语言
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'zh-CN';
  return nav.startsWith('zh') ? 'zh-CN' : 'en-US';
}

const current = ref<Locale>(readStored());

export function setLocale(l: Locale) {
  current.value = l;
  try { localStorage.setItem(STORAGE_KEY, l); } catch {}
}

export function getLocale(): Locale { return current.value; }

export function t(key: string, fallback?: string): string {
  return messages[current.value][key] ?? fallback ?? key;
}

export function useT(): { t: (k: string, fb?: string) => string; locale: ComputedRef<Locale>; setLocale: (l: Locale) => void } {
  return {
    t,
    locale: computed(() => current.value),
    setLocale
  };
}
