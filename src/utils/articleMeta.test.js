import { describe, it, expect } from 'vitest';
import { extractAbstract, buildPdfUrl, extractImage } from './articleMeta';

describe('extractAbstract', () => {
  it('returns null when no content or description', () => {
    expect(extractAbstract({})).toBeNull();
  });

  it('extracts text from a <p> tag when long enough', () => {
    const article = { content: '<p>This is a sufficiently long paragraph that should be extracted as the abstract text for this article.</p>' };
    expect(extractAbstract(article)).toContain('sufficiently long paragraph');
  });

  it('skips short <p> tags and falls back to plain text', () => {
    const article = { content: '<p>Short</p>This is a longer plain text that exceeds sixty characters and should be returned.' };
    expect(extractAbstract(article)).toContain('longer plain text');
  });

  it('tries description when content has nothing usable', () => {
    const article = { content: '<p>Hi</p>', description: 'A description that is long enough to pass the sixty character threshold for abstract extraction.' };
    expect(extractAbstract(article)).toContain('description that is long enough');
  });
});

describe('buildPdfUrl', () => {
  it('converts ACS article URL to PDF', () => {
    expect(buildPdfUrl({ link: 'https://pubs.acs.org/doi/10.1021/jacs.3c12345' }))
      .toBe('https://pubs.acs.org/doi/pdf/10.1021/jacs.3c12345');
  });

  it('converts Wiley full URL to PDF', () => {
    expect(buildPdfUrl({ link: 'https://onlinelibrary.wiley.com/doi/full/10.1002/anie.202312345' }))
      .toBe('https://onlinelibrary.wiley.com/doi/pdf/10.1002/anie.202312345');
  });

  it('converts Springer URL to PDF', () => {
    expect(buildPdfUrl({ link: 'https://link.springer.com/article/10.1007/s10562-026-05358-9' }))
      .toBe('https://link.springer.com/content/pdf/10.1007/s10562-026-05358-9.pdf');
  });

  it('converts Nature URL to PDF', () => {
    expect(buildPdfUrl({ link: 'https://www.nature.com/articles/s41929-024-01234-5' }))
      .toBe('https://www.nature.com/articles/s41929-024-01234-5.pdf');
  });

  it('returns original link for unknown publishers', () => {
    const link = 'https://example.com/article/12345';
    expect(buildPdfUrl({ link })).toBe(link);
  });
});

describe('extractImage', () => {
  it('returns enclosure link when available', () => {
    const article = { enclosure: { link: 'https://cdn.example.com/image.png' } };
    expect(extractImage(article)).toBe('https://cdn.example.com/image.png');
  });

  it('skips tracking/spacer images', () => {
    const article = { enclosure: { link: 'https://cdn.example.com/spacer.gif' }, content: '' };
    expect(extractImage(article)).toBeNull();
  });

  it('constructs Elsevier GA URL from PII in link', () => {
    const article = { link: 'https://www.sciencedirect.com/science/article/pii/S0021951724001234' };
    expect(extractImage(article)).toBe('https://ars.els-cdn.com/content/image/1-s2.0-S0021951724001234-ga1_lrg.jpg');
  });

  it('returns null when no image source exists', () => {
    expect(extractImage({ link: 'https://example.com/article' })).toBeNull();
  });
});
