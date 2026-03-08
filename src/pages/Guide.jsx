import React from 'react';
import { Settings, Bookmark, Rss, Sparkles, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">{title}</h2>
    {children}
  </div>
);

export default function Guide() {
  const location = useLocation();
  const isSettingsActive = location.pathname === createPageUrl('Settings');
  const isGuideActive = location.pathname === createPageUrl('Guide');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3.5">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6999e9b080715094c0e4fdd7/a8809b4cd_image.png"
                alt="Literature Tracker"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Literature Tracker</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            {/* Tab switcher (inactive, for visual consistency) */}
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <button className="flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60">
                  <Rss className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </button>
              </Link>
              <Link to={createPageUrl('Home') + '?tab=saved'}>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </button>
              </Link>
              {/* For You tab - hidden but code preserved for future use
              <Link to={createPageUrl('Home') + '?tab=recommended'}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all text-slate-500 hover:text-slate-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">For You</span>
                </button>
              </Link>
              */}
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Settings')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isSettingsActive ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}>
                  <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600' : ''}`} />
                  <span className="hidden sm:inline">Journal Selector</span>
                </button>
              </Link>
              <Link to={createPageUrl('Guide')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600' : ''}`} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Guide content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border-[1.5px] border-[#DCE8F6] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User Guide</h1>
          <p className="text-slate-500 text-sm mb-8">Everything you need to know to get started with Literature Tracker.</p>

          <p className="mb-8 leading-relaxed">
            <span className="text-blue-600 font-medium">Literature Tracker app is designed to help you follow your favorite journals.</span>
            <br /><br />
            Select your favorite journals via <strong>Journal Selector</strong> (top-right). Choose from hundreds of chemistry, materials, and engineering journals across ACS, RSC, Wiley, Elsevier, MDPI, Springer, and more.
          </p>

          <Section title="Tabs">
            <ul className="space-y-4 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-800">Feed</span> – Live RSS articles from your followed journals, sorted by date. Click the title or arrow icon to open the article. Use the bookmark icon to save an article.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Saved</span> – All your bookmarked articles. Export them as RIS, CSV, or plain text. Set up <strong>Auto-Save Rules</strong> to automatically bookmark articles matching specific keywords or authors.
              </li>
              <li>
                <span className="font-semibold text-slate-800">For You</span> – AI-curated recommendations based on your saved articles and followed journals. Add keywords or authors to refine suggestions.
              </li>
            </ul>
          </Section>

          <Section title="Filters & Persistent Filters">
            <p className="text-sm text-slate-700 mb-3">The Feed tab has a filter bar where you can:</p>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside mb-4">
              <li><span className="font-medium">Search by keyword</span> – filters article titles and abstracts in real time</li>
              <li><span className="font-medium">Filter by author</span> – show only articles from specific authors</li>
              <li><span className="font-medium">Filter by date range</span> – limit results to a time window</li>
              <li><span className="font-medium">Filter by journal</span> – narrow down to one or more followed journals</li>
            </ul>
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold">Persistent Filter:</span> keywords and authors you save as filters are stored in your browser and reapplied automatically every time you open the app. Add them via the filter bar; remove them by clicking the <strong>×</strong> on any filter badge. You can turn on and off this filter via toggle switch.
            </p>
          </Section>

          <Section title="Journal Selector">
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Search by name or keyword</li>
              <li>Filter by publisher or category</li>
              <li>Switch between Chemistry, Engineering, and Materials Science fields</li>
              <li>Add a custom journal by pasting its RSS feed URL</li>
            </ul>
          </Section>

          <Section title="Tips">
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Articles you've scrolled past appear in <span className="text-slate-500 font-medium">gray</span>; unread ones are <span className="text-blue-600 font-medium">blue</span></li>
              <li>Use the <strong>refresh</strong> button on the Feed to fetch the latest articles</li>
              <li>Auto-Save Rules (in Saved tab) run every time the feed refreshes</li>
              <li>Quick filters and auto-save rules persist across sessions (stored locally in your browser)</li>
            </ul>
          </Section>
        </div>

        {/* Suggestions section */}
        <div className="mt-4">
          <div className="bg-white rounded-2xl border-[1.5px] border-[#DCE8F6] shadow-sm p-3">
            <p className="text-sm text-slate-700">
              To share your comments and suggestions about this app{' '}
              <a
                href="mailto:jklosin@dow.com?subject=Suggestion%20to%20improve%20Literature%20Tracker%20app"
                className="text-blue-600 hover:underline font-medium"
              >
                click here
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}