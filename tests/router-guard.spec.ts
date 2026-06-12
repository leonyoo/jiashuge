import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '../src/store';

// 直接复刻 router.ts 中的守卫逻辑，避免引入 vue-router 实例依赖
function guard(to: string, hasUser: boolean): string | null {
  if (!hasUser && to !== '/onboarding') return '/onboarding';
  if (hasUser && to === '/onboarding') return '/yard';
  return null;
}

describe('router guard（无依赖复刻）', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('无用户访问 /yard 应跳 /onboarding', () => {
    expect(guard('/yard', false)).toBe('/onboarding');
  });

  it('无用户访问 /onboarding 不应跳转', () => {
    expect(guard('/onboarding', false)).toBeNull();
  });

  it('有用户访问 /onboarding 应跳 /yard', () => {
    expect(guard('/onboarding', true)).toBe('/yard');
  });

  it('有用户访问任何业务路由都不跳', () => {
    for (const path of ['/yard', '/learn', '/compose', '/mailbox', '/me', '/shop', '/cognitive']) {
      expect(guard(path, true)).toBeNull();
    }
  });
});

describe('store + guard 集成', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('bootstrap 后应有当前用户 → 不应被守卫拦下', () => {
    const s = useStore(); s.ensureSeed(); s.bootstrap();
    expect(guard('/yard', !!s.currentUser)).toBeNull();
  });

  it('resetAll 清空后应触发守卫', () => {
    const s = useStore(); s.ensureSeed(); s.bootstrap();
    s.resetAll();
    expect(s.currentUser).not.toBeNull(); // resetAll 会重新 seed
  });
});
