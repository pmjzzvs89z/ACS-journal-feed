import React, { useState, useEffect, useRef } from 'react';
import { Share2, Mail, FileText } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function buildRIS({ title, authors, journal, doi, pubDate, url, abstract }) {
  const lines = ['TY  - JOUR'];
  if (title) lines.push(`TI  - ${title}`);
  if (authors) {
    authors.split(',').map(a => a.trim()).filter(Boolean).forEach(a => {
      lines.push(`AU  - ${a}`);
    });
  }
  if (journal) lines.push(`JO  - ${journal}`);
  if (pubDate) {
    const year = new Date(pubDate).getFullYear();
    if (!isNaN(year)) lines.push(`PY  - ${year}`);
    lines.push(`DA  - ${pubDate}`);
  }
  if (doi) lines.push(`DO  - ${doi}`);
  if (url) lines.push(`UR  - ${url}`);
  if (abstract) lines.push(`AB  - ${abstract}`);
  lines.push('ER  - ');
  lines.push('');
  return lines.join('\n');
}

// Minimal BibTeX builder — used by the "BibTeX" share option. Produces a
// LaTeX-ready @article entry with a citation key derived from the first
// author's surname + year + first title word, which matches the
// conventions used by ReadCube Papers and Zotero.
function buildBibTeX({ title, authors, journal, doi, pubDate, url, abstract }) {
  const authorList = authors
    ? authors.split(',').map(a => a.trim()).filter(Boolean)
    : [];
  const firstSurname = authorList[0]
    ? authorList[0].split(/\s+/).pop().replace(/[^A-Za-z]/g, '')
    : 'unknown';
  const year = pubDate ? new Date(pubDate).getFullYear() : '';
  const firstTitleWord = (title || '').split(/\s+/)
    .find(w => w.length > 3)?.replace(/[^A-Za-z]/g, '').toLowerCase() || 'article';
  const key = `${firstSurname.toLowerCase()}${year || ''}${firstTitleWord}`;
  const escape = (s) => String(s).replace(/([{}\\])/g, '\\$1');
  const fields = [];
  if (title) fields.push(`  title = {${escape(title)}}`);
  if (authorList.length) fields.push(`  author = {${authorList.map(escape).join(' and ')}}`);
  if (journal) fields.push(`  journal = {${escape(journal)}}`);
  if (year) fields.push(`  year = {${year}}`);
  if (doi) fields.push(`  doi = {${doi}}`);
  if (url) fields.push(`  url = {${url}}`);
  if (abstract) fields.push(`  abstract = {${escape(abstract)}}`);
  return `@article{${key},\n${fields.join(',\n')}\n}\n`;
}

export default function ShareButton({ title, url, authors, journal, doi, pubDate, abstract }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const emailSubject = encodeURIComponent(title || 'Check out this article');
  // Normalise author list to a single comma-separated line (the raw
  // string may contain newlines from some RSS feeds).
  const authorLine = authors ? authors.replace(/\n/g, ', ').replace(/,\s*,/g, ',') : '';
  const emailBody = encodeURIComponent(
    `${title || ''}\n\n${authorLine ? `Authors: ${authorLine}\n\n` : ''}${journal ? `Journal: ${journal}\n\n` : ''}${url || ''}\n\nSent from Literature Tracker (https://literature-tracker.com)`
  );
  const emailHref = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const teamsText = encodeURIComponent(`${title || ''}\n${url || ''}`);
  const teamsHref = `https://teams.microsoft.com/share?msgText=${teamsText}`;

  // ReadCube Papers: download a one-paper RIS file. If the user has
  // ReadCube Papers set as the default handler for .ris files (common
  // on systems with the Papers desktop app installed), the OS will
  // open the file in Papers and import the citation automatically.
  // Otherwise the file just lands in Downloads and can be imported
  // manually.
  const readcubeHref = doi ? '#' : null;
  const safeTitleSlug = () =>
    (title || 'article').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'article';

  const downloadBlob = (content, mime, extension) => {
    const blob = new Blob([content], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${safeTitleSlug()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const handleReadcubeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!doi) return;
    const ris = buildRIS({ title, authors, journal, doi, pubDate, url, abstract });
    downloadBlob(ris, 'application/x-research-info-systems', 'ris');
    setOpen(false);
  };

  const handleBibtexClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bib = buildBibTeX({ title, authors, journal, doi, pubDate, url, abstract });
    downloadBlob(bib, 'application/x-bibtex', 'bib');
    setOpen(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(v => !v);
  };

  return (
    <div className="relative" ref={ref}>
      <Tooltip label="Share article" delay={500}>
        <button
          onClick={handleClick}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </Tooltip>
      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 bg-card border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
          <a
            href={emailHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            Email
          </a>
          <a
            href={teamsHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
          >
            <img
              src="/teams-icon.svg"
              alt=""
              className="w-3.5 h-3.5 object-contain"
            />
            Teams
          </a>
          {readcubeHref && (
            <a
              href={readcubeHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReadcubeClick}
              title={`Download RIS citation for ReadCube Papers\n${doi}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
              <img
                src="/readcube-icon.ico"
                alt=""
                className="w-3.5 h-3.5 object-contain"
              />
              ReadCube
            </a>
          )}
          <a
            href="#"
            onClick={handleBibtexClick}
            title="Download BibTeX (.bib) citation"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            BibTeX
          </a>
        </div>
      )}
    </div>
  );
}
