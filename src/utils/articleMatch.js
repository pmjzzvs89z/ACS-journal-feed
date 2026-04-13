// Check whether an article matches a set of auto-save rules (keywords
// and/or authors). Extracted from Home.jsx.

export function articleMatchesRules(article, rules) {
  const keywords = rules.keywords || [];
  const authors = rules.authors || [];
  if (keywords.length === 0 && authors.length === 0) return false;

  const haystack = [
    article.title || '',
    article.content || '',
    article.description || '',
  ].join(' ').toLowerCase();

  const authorStr = (Array.isArray(article.author)
    ? article.author.join(' ')
    : article.author || '').toLowerCase();

  const kwMatch = keywords.length > 0 && keywords.some(kw => haystack.includes(kw.toLowerCase()));
  const auMatch = authors.length > 0 && authors.some(au => authorStr.includes(au.toLowerCase()));

  // Keywords and authors are independent — match if EITHER hits.
  return kwMatch || auMatch;
}
