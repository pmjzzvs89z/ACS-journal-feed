export function renderAuthors(text) {
  if (!text) return null;
  const parts = text.split(/,\s*/);
  return parts.map((name, i) => {
    const hasStar = /\*/.test(name);
    const cleanName = name.replace(/\*/g, '').trim();
    return (
      <span key={i}>
        {i > 0 && ', '}
        {cleanName}
        {hasStar && <span className="text-blue-500 ml-0.5" title="Corresponding author">★</span>}
      </span>
    );
  });
}