import { describe, it, expect, beforeEach, vi } from 'vitest';
import { track, trackError, configureTransport, install, setUser, getSessionId } from '../src/analytics';

class FakeTransport { events: any[] = []; send(e: any[]) { this.events.push(...e) } }

describe('analytics SDK', () => {
  let fake: FakeTransport;
  beforeEach(() => {
    fake = new FakeTransport();
    configureTransport(fake);
  });

  it('track() 把事件发到 transport', () => {
    track('test_event', { foo: 1 });
    expect(fake.events.length).toBe(1);
    expect(fake.events[0].name).toBe('test_event');
    expect(fake.events[0].props).toEqual({ foo: 1 });
  });

  it('trackError() 捕获 Error 信息', () => {
    trackError(new Error('boom'), { ctx: 'unit' });
    expect(fake.events[0].name).toBe('error');
    expect(fake.events[0].props.message).toBe('boom');
    expect(fake.events[0].level).toBe('error');
  });

  it('setUser() 后事件带 userId', () => {
    setUser('u-123');
    track('login');
    expect(fake.events[0].userId).toBe('u-123');
  });

  it('install() 后产生 sessionId', () => {
    expect(getSessionId()).toBe('');
    install({ autoPageView: false });
    expect(getSessionId().length).toBeGreaterThan(0);
  });
});
