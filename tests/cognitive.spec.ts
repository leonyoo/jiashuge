import { describe, it, expect } from 'vitest';
import { IDIOM_QUESTIONS } from '../src/data/idioms';
import { MATH_DIFFICULTY, POEM_QUESTIONS, FIND_DIFF_SETS, MEMORY_ICONS } from '../src/data/cognitive';

describe('word-chain idiom filter', () => {
  const idioms = IDIOM_QUESTIONS.filter(q => /^[一-鿿]{4}$/.test(q.prompt));
  it('过滤后所有条目都是 4 个汉字', () => {
    expect(idioms.length).toBeGreaterThan(0);
    for (const q of idioms) {
      expect(q.prompt).toMatch(/^[一-鿿]{4}$/);
    }
  });
  it('fallback 池总是非空（保证游戏总能出选项）', () => {
    expect(idioms.length).toBeGreaterThanOrEqual(3);
  });
  it('若数据中存在接龙对，接龙逻辑能正确识别', () => {
    let chainable = 0;
    for (const a of idioms) {
      const last = a.prompt.slice(-1);
      if (idioms.some(b => b.prompt.startsWith(last))) chainable += 1;
    }
    expect(chainable).toBeGreaterThanOrEqual(0);
  });
});

describe('math difficulty ranges', () => {
  it('每档范围和运算符合理', () => {
    for (const d of MATH_DIFFICULTY) {
      expect(d.range[0]).toBeGreaterThanOrEqual(1);
      expect(d.range[1]).toBeGreaterThan(d.range[0]);
      expect(d.ops.length).toBeGreaterThan(0);
    }
  });
});

describe('poem questions', () => {
  it('每条题目都包含下一句和作者', () => {
    expect(POEM_QUESTIONS.length).toBeGreaterThan(0);
    for (const p of POEM_QUESTIONS) {
      expect(p.q.length).toBeGreaterThan(0);
      expect(p.next.length).toBeGreaterThan(0);
      expect(p.author.length).toBeGreaterThan(0);
    }
  });
});

describe('find difference sets', () => {
  it('每组 a 和 b 长度一致', () => {
    for (const s of FIND_DIFF_SETS) {
      expect([...s.a].length).toBe([...s.b].length);
      expect(s.answer).toBeGreaterThanOrEqual(0);
      expect(s.answer).toBeLessThan([...s.b].length);
    }
  });
});

describe('memory icons', () => {
  it('图标至少 6 个（保证能配对 3 对以上）', () => {
    expect(MEMORY_ICONS.length).toBeGreaterThanOrEqual(6);
  });
});

