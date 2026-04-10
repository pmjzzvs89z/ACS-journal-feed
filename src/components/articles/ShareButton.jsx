import React, { useState, useEffect, useRef } from 'react';
import { Share2, Mail } from 'lucide-react';

export default function ShareButton({ title, url, authors, journal }) {
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
  const emailBody = encodeURIComponent(
    `${title || ''}\n${authors ? `Authors: ${authors}\n` : ''}${journal ? `Journal: ${journal}\n` : ''}\n${url || ''}`
  );
  const emailHref = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const teamsText = encodeURIComponent(`${title || ''}\n${url || ''}`);
  const teamsHref = `https://teams.microsoft.com/share?msgText=${teamsText}`;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(v => !v);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        title="Share article"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>
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
            <svg className="w-3.5 h-3.5 text-[#6264A7]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 2a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm4 7a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm.5 6h-3a3 3 0 00-3 3v2h9v-2a3 3 0 00-3-3zm-7-6H7a3 3 0 00-3 3v5h16v-5a3 3 0 00-3-3zM8 2a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
            Teams
          </a>
        </div>
      )}
    </div>
  );
}
