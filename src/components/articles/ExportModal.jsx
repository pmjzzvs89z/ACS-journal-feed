import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table, BookMarked } from 'lucide-react';

function toRIS(articles) {
  return articles.map(a => {
    const authors = a.authors ? a.authors.split(',').map(au => `AU  - ${au.trim()}`).join('\n') : '';
    return [
      'TY  - JOUR',
      `TI  - ${a.title || ''}`,
      authors,
      `JO  - ${a.journal_name || ''}`,
      `PY  - ${a.pub_date ? new Date(a.pub_date).getFullYear() : ''}`,
      `UR  - ${a.link || ''}`,
      `AB  - ${a.abstract || ''}`,
      'ER  - ',
      '',
    ].filter(l => l !== undefined && l !== null && !(l.endsWith('- '))).join('\n');
  }).join('\n');
}

function toCSV(articles) {
  const headers = ['Title', 'Authors', 'Journal', 'Publication Date', 'Link', 'Abstract'];
  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const rows = articles.map(a => [
    escape(a.title),
    escape(a.authors),
    escape(a.journal_name),
    escape(a.pub_date),
    escape(a.link),
    escape(a.abstract),
  ].join(','));
  return [headers.map(escape).join(','), ...rows].join('\n');
}

function toText(articles) {
  return articles.map((a, i) => [
    `[${i + 1}] ${a.title}`,
    a.authors ? `Authors: ${a.authors}` : null,
    a.journal_name ? `Journal: ${a.journal_name}` : null,
    a.pub_date ? `Date: ${a.pub_date}` : null,
    a.link ? `URL: ${a.link}` : null,
    a.abstract ? `Abstract: ${a.abstract}` : null,
    '---',
  ].filter(Boolean).join('\n')).join('\n\n');
}

const FORMATS = [
  { id: 'ris',  label: 'RIS',       desc: 'For citations managers (ReadCube Papers, EndNote, etc.)', icon: BookMarked, ext: 'ris',  mime: 'application/x-research-info-systems' },
  { id: 'csv',  label: 'CSV',       desc: 'Spreadsheet / tabular data',                         icon: Table,      ext: 'csv',  mime: 'text/csv' },
  { id: 'text', label: 'Plain Text', desc: 'Simple human-readable summary',                     icon: FileText,   ext: 'txt',  mime: 'text/plain' },
];

export default function ExportModal({ open, onClose, articles }) {
  const [selected, setSelected] = useState('ris');

  const handleExport = () => {
    const fmt = FORMATS.find(f => f.id === selected);
    let content = '';
    if (selected === 'ris')  content = toRIS(articles);
    if (selected === 'csv')  content = toCSV(articles);
    if (selected === 'text') content = toText(articles);

    const blob = new Blob([content], { type: fmt.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-articles.${fmt.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">Export {articles.length} Article{articles.length !== 1 ? 's' : ''}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {FORMATS.map(fmt => {
            const Icon = fmt.icon;
            const active = selected === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => setSelected(fmt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  active ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-border bg-card'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-slate-800'}`}>{fmt.label}</p>
                  <p className="text-xs text-slate-500">{fmt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}