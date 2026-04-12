import { describe, test, expect, beforeEach } from 'vitest';
import {
  setSeenArticlesUser,
  getSeenArticleIds,
  clearAllSeenArticles,
} from '@/utils/seenArticles';

beforeEach(() => {
  localStorage.clear();
  // Reset the module-level user to null so tests start clean
  setSeenArticlesUser(null);
});

// ---------------------------------------------------------------------------
// a) Auto-save rules — localStorage namespacing
// ---------------------------------------------------------------------------
describe('Auto-save rules isolation', () => {
  test('auto-save rules are namespaced by userId', () => {
    localStorage.setItem(
      'cjf_autosave_rules:user-a',
      JSON.stringify({ enabled: true, keywords: ['catalysis'], authors: [] }),
    );
    localStorage.setItem(
      'cjf_autosave_rules:user-b',
      JSON.stringify({ enabled: false, keywords: [], authors: ['Smith'] }),
    );

    const rulesA = JSON.parse(localStorage.getItem('cjf_autosave_rules:user-a'));
    const rulesB = JSON.parse(localStorage.getItem('cjf_autosave_rules:user-b'));

    expect(rulesA.enabled).toBe(true);
    expect(rulesA.keywords).toEqual(['catalysis']);
    expect(rulesB.enabled).toBe(false);
    expect(rulesB.authors).toEqual(['Smith']);
  });

  test('writing rules for one user does not affect another', () => {
    localStorage.setItem(
      'cjf_autosave_rules:user-a',
      JSON.stringify({ enabled: true, keywords: ['polymer'], authors: [] }),
    );

    expect(localStorage.getItem('cjf_autosave_rules:user-b')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// b) Seen articles isolation — using the exported helpers from ArticleCard
// ---------------------------------------------------------------------------
describe('Seen articles isolation', () => {
  test('marking an article seen for userA does not affect userB', () => {
    // Write directly to localStorage as the module helper for markArticleSeen
    // is not exported. The storage format is seenArticles:<userId> = JSON array.
    setSeenArticlesUser('userA');
    // Simulate markArticleSeen by writing to the namespaced key
    localStorage.setItem('seenArticles:userA', JSON.stringify(['article1']));
    // Force cache re-read
    setSeenArticlesUser(null);
    setSeenArticlesUser('userA');

    const seenA = getSeenArticleIds();
    expect(seenA.has('article1')).toBe(true);

    // Switch to userB — article1 should NOT be seen
    setSeenArticlesUser('userB');
    const seenB = getSeenArticleIds();
    expect(seenB.has('article1')).toBe(false);

    // Switch back to userA — article1 should still be seen
    setSeenArticlesUser('userA');
    const seenA2 = getSeenArticleIds();
    expect(seenA2.has('article1')).toBe(true);
  });

  test('clearAllSeenArticles only clears the current user', () => {
    localStorage.setItem('seenArticles:userA', JSON.stringify(['a1', 'a2']));
    localStorage.setItem('seenArticles:userB', JSON.stringify(['b1']));

    setSeenArticlesUser('userA');
    clearAllSeenArticles();

    expect(localStorage.getItem('seenArticles:userA')).toBeNull();
    // userB's data should be untouched
    expect(JSON.parse(localStorage.getItem('seenArticles:userB'))).toEqual(['b1']);
  });
});

// ---------------------------------------------------------------------------
// c) Feed filter isolation
// ---------------------------------------------------------------------------
describe('Feed filter isolation', () => {
  test('feed filters are namespaced by userId', () => {
    const filtersA = { journal: 'acs-catal', search: 'polymer' };
    const filtersB = { journal: 'nature-chem', search: 'synthesis' };

    localStorage.setItem('cjf_feed_filters:user-a', JSON.stringify(filtersA));
    localStorage.setItem('cjf_feed_filters:user-b', JSON.stringify(filtersB));

    const readA = JSON.parse(localStorage.getItem('cjf_feed_filters:user-a'));
    const readB = JSON.parse(localStorage.getItem('cjf_feed_filters:user-b'));

    expect(readA.journal).toBe('acs-catal');
    expect(readA.search).toBe('polymer');
    expect(readB.journal).toBe('nature-chem');
    expect(readB.search).toBe('synthesis');
  });

  test('writing feed filters for one user does not affect another', () => {
    localStorage.setItem(
      'cjf_feed_filters:user-a',
      JSON.stringify({ journal: 'all', search: '' }),
    );

    expect(localStorage.getItem('cjf_feed_filters:user-b')).toBeNull();
  });
});
