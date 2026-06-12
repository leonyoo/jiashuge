import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '../src/store';

describe('store bootstrap', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('bootstrap 不自动 seed（真 onboarding 模式）', () => {
    const s = useStore();
    s.bootstrap();
    expect(Object.keys(s.state.users).length).toBe(0);
    expect(s.currentUser).toBeNull();
  });

  it('ensureSeed 造出 demo 数据', () => {
    const s = useStore();
    s.ensureSeed();
    expect(Object.keys(s.state.users).length).toBeGreaterThanOrEqual(3);
    expect(s.myPigeons.length).toBeGreaterThanOrEqual(1);
    expect(s.getMyFriends().length).toBeGreaterThanOrEqual(2);
    expect(s.currentUser).not.toBeNull();
  });

  it('ensureSeed 是幂等的', () => {
    const s = useStore();
    s.ensureSeed();
    const n1 = Object.keys(s.state.users).length;
    s.ensureSeed();
    expect(Object.keys(s.state.users).length).toBe(n1);
  });
});

describe('dailyCheckIn', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('首次签到获得奖励且连签 =1', () => {
    const s = useStore();
    s.ensureSeed();
    const before = s.currentUser!.coins;
    const r = s.dailyCheckIn();
    expect(r.ok).toBe(true);
    expect(r.streak).toBe(1);
    expect(s.currentUser!.coins).toBeGreaterThan(before);
    expect(s.currentUser!.streak).toBe(1);
  });

  it('同日再次签到应返回 ok=false', () => {
    const s = useStore();
    s.ensureSeed();
    s.dailyCheckIn();
    const r2 = s.dailyCheckIn();
    expect(r2.ok).toBe(false);
  });
});

describe('sendLetter / markRead / unreadCount', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('发信后 inbox 增加一封且 unreadCount=1', () => {
    const s = useStore();
    s.ensureSeed();
    const friend = s.getMyFriends()[0];
    const letter = s.sendLetter({
      toUserId: friend.friendUserId,
      toUserName: friend.friendName,
      toCityId: friend.friendCityId,
      pigeonId: s.myPigeons[0].id,
      text: '你好',
      stationeryId: 'paper-plain',
      stampId: 'stamp-common'
    });
    expect(letter).not.toBeNull();
    expect(letter!.status).toBe('flying');
    expect(s.outbox.length).toBe(1);

    expect(s.inbox.length).toBe(0);

    s.switchUser(friend.friendUserId);
    expect(s.inbox.length).toBe(1);
    expect(s.unreadCount).toBe(0);
    s.deliverLetter(letter!.id);


    expect(s.unreadCount).toBe(1);
  });
});

describe('buyItem', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('金币不足时购买失败', () => {
    const s = useStore();
    s.ensureSeed();
    s.currentUser!.coins = 0;
    const ok = s.buyItem('food-grain', 1);
    expect(ok).toBe(false);
  });

  it('金币足够时购买成功并扣减', () => {
    const s = useStore();
    s.ensureSeed();
    s.currentUser!.coins = 1000;
    const before = s.currentUser!.coins;
    const ok = s.buyItem('food-grain', 1);
    expect(ok).toBe(true);
    expect(s.currentUser!.coins).toBe(before - 20);
    expect(s.currentUser!.inventory['food-grain']).toBe(1);
  });

  it('鸽子已达4只上限时无法再购买', () => {
    const s = useStore();
    s.ensureSeed();
    s.currentUser!.coins = 100000;
    while (s.currentUser!.pigeonIds.length < 4) {
      s.adoptPigeon('common', 'p' + s.currentUser!.pigeonIds.length);
    }
    const ok = s.buyItem('pigeon-racing', 1);
    expect(ok).toBe(false);
  });
});

describe('toggleBigFont', () => {
  beforeEach(() => { setActivePinia(createPinia()); });
  it('切换大字号模式', () => {
    const s = useStore(); s.ensureSeed();
    const before = s.currentUser!.bigFontMode;
    s.toggleBigFont();
    expect(s.currentUser!.bigFontMode).toBe(!before);
  });
});

