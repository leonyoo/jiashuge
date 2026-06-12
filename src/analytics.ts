// 轻量埋点 SDK
// 1) 事件总线：track() / trackError()，可被任何模块调用
// 2) 可插拔 transport：默认 console（开发），可注入 Sentry / 自建后端
// 3) 自动收集：window.onerror / unhandledrejection / 路由切换

export type EventLevel = "debug" | "info" | "warn" | "error";
export interface AnalyticsEvent {
  name: string; level: EventLevel; ts: number; props?: Record<string, unknown>;
  userId?: string; sessionId?: string; url?: string; userAgent?: string;
}
export interface Transport { send(events: AnalyticsEvent[]): void | Promise<void>; }

class ConsoleTransport implements Transport {
  send(events: AnalyticsEvent[]) {
    for (const e of events) {
      const fn = e.level === "error" ? console.error : e.level === "warn" ? console.warn : console.log;
      fn("[analytics]", e.name, e.props ?? "");
    }
  }
}

class BufferTransport implements Transport {
  private buf: AnalyticsEvent[] = [];
  constructor(private inner: Transport, private max = 20, private flushMs = 5000) {
    if (typeof window !== "undefined") {
      setInterval(() => this.flush(), this.flushMs);
      window.addEventListener("beforeunload", () => this.flush());
    }
  }
  send(events: AnalyticsEvent[]) {
    this.buf.push(...events);
    if (this.buf.length >= this.max) this.flush();
  }
  flush() {
    if (this.buf.length === 0) return;
    const batch = this.buf.splice(0, this.buf.length);
    this.inner.send(batch);
  }
}

let transport: Transport = new ConsoleTransport();
let sessionId = "";
let userId = "";
let installed = false;
const queue: AnalyticsEvent[] = [];

export function configureTransport(t: Transport) {
  transport = t;
  if (queue.length) transport.send(queue.splice(0, queue.length));
}
export function wrapTransport(inner: Transport, opts?: { max?: number; flushMs?: number }): Transport {
  return new BufferTransport(inner, opts?.max, opts?.flushMs);
}
export function setUser(id: string) { userId = id; }
export function setSession(id: string) { sessionId = id; }
export function getSessionId() { return sessionId; }

function baseEvent(name: string, level: EventLevel, props?: Record<string, unknown>): AnalyticsEvent {
  return {
    name, level, ts: Date.now(), props,
    userId: userId || undefined,
    sessionId: sessionId || undefined,
    url: typeof location !== "undefined" ? location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined
  };
}

export function track(name: string, props?: Record<string, unknown>, level: EventLevel = "info") {
  const e = baseEvent(name, level, props);
  if (queue.length > 0) queue.push(e);
  else transport.send([e]);
}

export function trackError(err: unknown, context?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  track("error", { message, stack, ...context }, "error");
}

export function install(opts?: { autoPageView?: boolean }) {
  if (installed) return;
  installed = true;
  sessionId = sessionId || (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "s-" + Math.random().toString(36).slice(2));
  if (typeof window !== "undefined") {
    window.addEventListener("error", (e) => trackError(e.error || e.message, { source: "window.error" }));
    window.addEventListener("unhandledrejection", (e) => trackError(e.reason, { source: "unhandledrejection" }));
    if (opts?.autoPageView !== false) {
      const orig = history.pushState;
      history.pushState = function (...args) {
        const r = orig.apply(this, args as any);
        track("page_view", { path: location.pathname + location.hash });
        return r;
      };
      window.addEventListener("popstate", () => track("page_view", { path: location.pathname + location.hash }));
      track("page_view", { path: location.pathname + location.hash });
    }
  }
  if (queue.length) transport.send(queue.splice(0, queue.length));
}

// Sentry 适配示例（注释保留）
// import * as Sentry from "@sentry/vue";
// configureTransport(wrapTransport({ send: (events) => events.filter(e => e.level === "error").forEach(e => Sentry.captureException(new Error(e.name + ": " + JSON.stringify(e.props)))) }));
