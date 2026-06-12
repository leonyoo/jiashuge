import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale, useT } from '../src/i18n';

describe('i18n t()', () => {
  beforeEach(() => { setLocale('zh-CN'); });

  it('默认语言 zh-CN', () => {
    expect(getLocale()).toBe('zh-CN');
  });

  it('已知 key 返回中文', () => {
    expect(t('mailbox.title')).toBe('信箱');
    expect(t('app.name')).toBe('家书鸽');
  });

  it('未知 key 返回 fallback 或自身', () => {
    expect(t('nope.nothing', '默认')).toBe('默认');
    expect(t('nope.nothing')).toBe('nope.nothing');
  });
});

describe('i18n 切换', () => {
  beforeEach(() => { setLocale('zh-CN'); });

  it('setLocale(en-US) 后所有 t() 返回英文', () => {
    setLocale('en-US');
    expect(getLocale()).toBe('en-US');
    expect(t('mailbox.title')).toBe('Mailbox');
    expect(t('mailbox.inbox')).toBe('Inbox');
    expect(t('app.name')).toBe('Letter Pigeon');
  });

  it('useT() 返回 reactive locale', () => {
    const { locale, t: tt } = useT();
    expect(locale.value).toBe('zh-CN');
    expect(tt('shop.title')).toBe('商店');
    setLocale('en-US');
    expect(locale.value).toBe('en-US');
    expect(tt('shop.title')).toBe('Shop');
  });
});
