import React from 'react';
import { Settings, Bookmark, Rss, BookOpen, Moon, Sun, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
    {children}
  </div>
);

export default function Guide() {
  const location = useLocation();
  const isSettingsActive = location.pathname === createPageUrl('Settings');
  const isGuideActive = location.pathname === createPageUrl('Guide');
  const [isDark, toggleDark] = useDarkMode();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1 flex items-center gap-3.5">
              <img
                src="/logo.svg"
                alt="Literature Tracker"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Literature Tracker</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <button className="feed-pulse flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors bg-blue-50/60 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Rss className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </button>
              </Link>
              <Link to={createPageUrl('Home') + '?tab=saved'}>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </button>
              </Link>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <Link to={createPageUrl('Settings')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isSettingsActive ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'}`}>
                  <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span className="hidden sm:inline">Journal Selector</span>
                </button>
              </Link>
              <Link to={createPageUrl('Guide')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                </button>
              </Link>
              <button
                onClick={toggleDark}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Guide content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-card rounded-2xl border-[1.5px] border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">User Guide</h1>
          <p className="text-muted-foreground text-sm mb-8">Everything you need to know to get started with Literature Tracker.</p>

          <p className="mb-8 leading-relaxed text-foreground">
            <span className="text-blue-600 dark:text-blue-400 font-medium">Literature Tracker is designed to help you follow your favorite scientific journals.</span>
            <br /><br />
            Select your favorite journals via <strong>Journal Selector</strong> (top-right). Choose from hundreds of journals across three fields — Chemistry, Engineering, and Materials Science — from publishers including ACS, RSC, Wiley, Elsevier, MDPI, Springer Nature, AAAS, Taylor &amp; Francis, ASME, IChemE, and IOP.
          </p>

          <Section title="Feed">
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
              <li>Articles are sorted by <span className="font-medium">journal name A&ndash;Z</span>, with the newest articles first within each journal</li>
              <li>Each article card shows a <span className="font-medium">graphical abstract</span> (when available from the publisher), title, authors, date, DOI, and journal badge</li>
              <li>Click the title or the arrow icon to open the full article on the publisher's website</li>
              <li>Use the <span className="font-medium">Save</span> button to bookmark an article for later</li>
              <li>Use the <span className="font-medium">journal dropdown</span> (top center, highlighted with a gentle pulse) to filter the feed to a single journal</li>
              <li>Use the <span className="font-medium">Reset</span> button to mark all articles as unread (blue) again</li>
              <li>A <span className="font-medium">Back to Top</span> button appears when you scroll down</li>
            </ul>
          </Section>

          <Section title="Saved Articles">
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
              <li>All your bookmarked articles in one place</li>
              <li>Select articles with checkboxes and <span className="font-medium">export</span> them as RIS (for Zotero, Mendeley, EndNote), CSV, or plain text</li>
              <li>Set up <span className="font-medium">Auto-Save Rules</span> to automatically bookmark articles matching specific keywords or authors — rules run every time the feed refreshes</li>
              <li>Unsave articles individually with the trash icon</li>
            </ul>
          </Section>

          <Section title="Filters">
            <p className="text-sm text-foreground mb-3">The Feed tab has a search and filter bar:</p>
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside mb-4">
              <li><span className="font-medium">Search by keyword</span> — filters article titles, abstracts, and authors in real time</li>
              <li><span className="font-medium">Filter by date range</span> — limit results to a specific time window</li>
              <li><span className="font-medium">Filter by journal</span> — use the dropdown above the feed to show only one journal</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              <span className="font-semibold">Persistent Filter:</span> Add keywords and/or authors that are saved in your browser and reapplied automatically every time you open the app. Toggle the filter on and off with the switch. Remove individual items by clicking the <strong>&times;</strong> on any filter badge.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">URL-based filters:</span> All active filters (journal, keyword, date range) are stored in the page URL. This means your filters <span className="font-medium">survive page refresh</span>, can be <span className="font-medium">bookmarked</span> for quick access, and work with browser back/forward navigation.
            </p>
          </Section>

          <Section title="Journal Selector">
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
              <li>Switch between <span className="font-medium">Chemistry</span>, <span className="font-medium">Engineering</span>, and <span className="font-medium">Materials Science</span> fields using the tabs at the top</li>
              <li>Browse by publisher (e.g., ACS, RSC, Wiley) or by research category (e.g., Organic Chemistry, Catalysis)</li>
              <li>Search by journal name or keyword</li>
              <li>Use <span className="font-medium">Discover Journals</span> to see suggested journals you may want to follow (click again to close)</li>
              <li>Add a <span className="font-medium">custom journal</span> by pasting its RSS feed URL</li>
              <li>Journals are listed alphabetically within each category and publisher</li>
            </ul>
          </Section>

          <Section title="Tips">
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
              <li>Articles you've scrolled past appear in <span className="text-muted-foreground font-medium">gray</span>; unread ones are <span className="text-blue-600 dark:text-blue-400 font-medium">blue</span></li>
              <li>A banner appears after 30 minutes reminding you to refresh for the latest articles</li>
              <li>Articles are cached for 20 minutes — switching tabs and back is instant</li>
              <li>The <span className="font-medium">Feed</span> button gently pulses when you're on another tab, as a reminder to return to your articles</li>
              <li>Persistent filters and auto-save rules are stored locally in your browser and persist across sessions</li>
              <li>Use the <span className="font-medium">moon/sun</span> icon in the header to toggle between dark and light mode</li>
              <li>Use the <span className="font-medium">logout</span> button (top-right) to sign out of your account</li>
            </ul>
          </Section>
        </div>

        {/* Suggestions section */}
        <div className="mt-4">
          <div className="bg-card rounded-2xl border-[1.5px] border-border shadow-sm p-3">
            <p className="text-sm text-foreground">
              To share your comments and suggestions about this app{' '}
              <a
                href="mailto:jklosin@dow.com?subject=Suggestion%20to%20improve%20Literature%20Tracker%20app"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
