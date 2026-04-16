import { describe, it, expect } from 'vitest';
import { articleMatchesRules } from './articleMatch';

describe('articleMatchesRules', () => {
  const base = { title: 'Catalytic hydrogenation of alkenes', content: '', description: '', author: 'John Smith' };

  it('returns false when rules have no keywords or authors', () => {
    expect(articleMatchesRules(base, { keywords: [], authors: [] })).toBe(false);
  });

  it('matches a keyword in the title', () => {
    expect(articleMatchesRules(base, { keywords: ['catalytic'], authors: [] })).toBe(true);
  });

  it('is case-insensitive for keywords', () => {
    expect(articleMatchesRules(base, { keywords: ['HYDROGENATION'], authors: [] })).toBe(true);
  });

  it('does not match a keyword absent from all fields', () => {
    expect(articleMatchesRules(base, { keywords: ['photovoltaic'], authors: [] })).toBe(false);
  });

  it('matches a keyword in content', () => {
    const article = { ...base, content: '<p>Photovoltaic devices were tested</p>' };
    expect(articleMatchesRules(article, { keywords: ['photovoltaic'], authors: [] })).toBe(true);
  });

  it('matches a keyword in description', () => {
    const article = { ...base, description: 'Study of polymer blends' };
    expect(articleMatchesRules(article, { keywords: ['polymer'], authors: [] })).toBe(true);
  });

  it('matches an author (string)', () => {
    expect(articleMatchesRules(base, { keywords: [], authors: ['Smith'] })).toBe(true);
  });

  it('matches an author (array)', () => {
    const article = { ...base, author: ['Alice Johnson', 'Bob Smith'] };
    expect(articleMatchesRules(article, { keywords: [], authors: ['Johnson'] })).toBe(true);
  });

  it('returns true when either keyword or author matches', () => {
    expect(articleMatchesRules(base, { keywords: ['nope'], authors: ['Smith'] })).toBe(true);
    expect(articleMatchesRules(base, { keywords: ['catalytic'], authors: ['nope'] })).toBe(true);
  });

  it('returns false when neither keyword nor author matches', () => {
    expect(articleMatchesRules(base, { keywords: ['nope'], authors: ['nope'] })).toBe(false);
  });
});
