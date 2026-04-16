import React, { useEffect } from 'react';
import { Settings, Bookmark, Rss, BookOpen, Moon, Sun, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { entities } from '@/api/entities';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';
import Tooltip from '@/components/ui/Tooltip';

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
  const { logout, user } = useAuth();
  const userId = user?.id;

  useEffect(() => { document.title = 'User Guide — Literature Tracker'; }, []);

  const { data: savedArticles = [] } = useQuery({
    queryKey: ['savedArticles', userId],
    queryFn: () => entities.SavedArticle.list(),
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
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
              <Link to={createPageUrl('Home')} className="feed-pulse flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-semibold transition-colors bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-slate-300/80 dark:hover:bg-blue-900/40">
                <Rss className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </Link>
              <Link to={createPageUrl('Home') + '?tab=saved'} className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
                {savedArticles.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{savedArticles.length}</span>
                )}
              </Link>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <Link to={createPageUrl('Settings')} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isSettingsActive ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'}`}>
                <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Journal Selector</span>
              </Link>
              <Tooltip label="User Guide" delay={500}>
                <Link to={createPageUrl('Guide')} aria-label="User Guide" className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                </Link>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
                <button
                  onClick={toggleDark}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </button>
              </Tooltip>
              <Tooltip label="Log out" delay={500}>
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Guide content */}
      <main id="main-content" className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-[620px] sm:max-w-[806px]">
        <div className="bg-card rounded-2xl border-container border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">User Guide</h1>
          <p className="text-muted-foreground text-sm mb-8">Everything you need to know to get started with Literature Tracker.</p>

          <p className="mb-8 leading-relaxed text-foreground">
            <span className="text-blue-600 dark:text-blue-400 font-medium">Literature Tracker is designed to help you follow your favorite scientific journals.</span>
            <br /><br />
            Select your favorite journals via <strong>Journal Selector</strong> (top-right). Choose from hundreds of journals across three fields — Chemistry, Engineering, and Materials Science — from publishers including ACS, RSC, Wiley, Elsevier, MDPI, Springer Nature, AAAS, Taylor &amp; Francis, ASME, IChemE, and IOP.
          </p>

          <Section title="Feed">
            <ul className="space-y-1 text-sm text-foreground list-disc list-inside">
              <li>Articles are sorted by <span className="font-medium">journal name A&ndash;Z</span>, with the newest articles first within each journal</li>
              <li>Each article card shows a <span className="font-medium">graphical abstract</span> (when available from the publisher), title, authors, date, DOI, and journal badge</li>
              <li><span className="font-medium">Unread articles</span> are marked with a <span className="text-blue-600 dark:text-blue-400 font-medium">blue vertical bar</span> on the left edge of the card and a blue title; once you scroll past an article, it becomes &ldquo;read&rdquo; — the bar disappears and the title turns gray</li>
              <li>Click the title or the arrow icon to open the full article on the publisher's website</li>
              <li>Use the <span className="font-medium">Save</span> button to bookmark an article for later</li>
              <li>Use the <span className="font-medium">Share</span> button to share an article via <span className="font-medium">Email</span>, <span className="font-medium">Microsoft Teams</span>, or export a citation to <span className="font-medium">ReadCube Papers</span> (downloads a .ris file)</li>
              <li>Use the <span className="font-medium">journal dropdown</span> (top center, highlighted with a gentle pulse) to filter the feed to a single journal or publisher group</li>
              <li>Use the <span className="font-medium">Reset</span> button to mark all articles as unread (blue) again</li>
              <li>A <span className="font-medium">Back to Top</span> button appears when you scroll down; a floating <span className="font-medium">up-arrow</span> sits to the right of the feed for quick jumps</li>
            </ul>
          </Section>

          <Section title="Saved Articles">
            <ul className="space-y-1 text-sm text-foreground list-disc list-inside">
              <li>All your bookmarked articles in one place</li>
              <li>Select articles with checkboxes and <span className="font-medium">export</span> them as RIS (for ReadCube Papers, EndNote, etc.), CSV, or plain text</li>
              <li>Use <span className="font-medium">Remove Selected</span> to bulk-delete multiple saved articles at once</li>
              <li>Set up <span className="font-medium">Auto-Save Rules</span> to automatically bookmark articles matching specific keywords or authors — rules run every time the feed refreshes</li>
              <li>A <span className="text-green-600 dark:text-green-400 font-medium">green dot</span> appears on the Saved tab when auto-save rules are active</li>
              <li>Auto-saved articles show the <span className="font-medium">matching reason</span> (keyword or author) on each card so you know why they were saved</li>
              <li>Auto-save rules are <span className="font-medium">synced across devices</span> via your account — set them up once and they work everywhere you log in</li>
              <li>Unsave articles individually with the trash icon</li>
            </ul>
          </Section>

          <Section title="Search & Filter">
            <ul className="space-y-1 text-sm text-foreground list-disc list-inside mb-4">
              <li><span className="font-medium">Search bar</span> — filters article titles, abstracts, and authors in real time. A blue <span className="font-medium">Clear</span> link appears next to the input once you start typing</li>
              <li><span className="font-medium">Filter by journal</span> — use the dropdown above the feed to show only one journal. This selection is independent of the search bar</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">URL-based filters:</span> The active search term and journal selection are stored in the page URL. This means your filters <span className="font-medium">survive page refresh</span>, can be <span className="font-medium">bookmarked</span> for quick access, and work with browser back/forward navigation. They are also remembered when you leave the Feed tab and come back.
            </p>
          </Section>

          <Section title="Journal Selector">
            <ul className="space-y-1 text-sm text-foreground list-disc list-inside">
              <li>Switch between <span className="font-medium">Chemistry</span>, <span className="font-medium">Engineering</span>, and <span className="font-medium">Materials Science</span> fields using the tabs at the top</li>
              <li>Browse by publisher (e.g., ACS, RSC, Wiley) or by research category (e.g., Organic Chemistry, Catalysis)</li>
              <li>Use <span className="font-medium">Search Journals</span> to find journals by name or keyword — results appear in the main body grouped by publisher, with no limit on matches</li>
              <li>Click the <span className="font-medium">&ldquo;X journals selected&rdquo;</span> panel to view all your active journals in one place — you can unselect journals directly from this view or use <span className="font-medium">Unselect All</span></li>
              <li>Clicking outside the search results or selected-journals panel closes it automatically</li>
              <li>Journals that appear in multiple fields (e.g., a catalysis journal in both Chemistry and Engineering) are <span className="font-medium">synced automatically</span> — toggling one toggles the other</li>
              <li>Use <span className="font-medium">Discover Journals</span> to see suggested journals you may want to follow (click again to close)</li>
              <li>Add a <span className="font-medium">custom journal</span> by pasting its RSS feed URL</li>
              <li>Journals are listed alphabetically within each category and publisher</li>
            </ul>
          </Section>

          <Section title="Tips">
            <ul className="space-y-1 text-sm text-foreground list-disc list-inside">
              <li>Read articles have a <span className="text-muted-foreground font-medium">gray</span> title with no left bar; unread ones have a <span className="text-blue-600 dark:text-blue-400 font-medium">blue</span> title with a blue left bar</li>
              <li>A banner appears after 90 minutes reminding you to refresh for the latest articles</li>
              <li>Articles are cached for 20 minutes — switching tabs and back is instant</li>
              <li>The <span className="font-medium">Feed</span> button gently pulses when you're on another tab, as a reminder to return to your articles</li>
              <li>Hover over the <span className="font-medium">User Guide</span>, <span className="font-medium">theme toggle</span>, <span className="font-medium">Log out</span>, or <span className="font-medium">Reset</span> buttons for a short reminder tooltip</li>
              <li>Auto-save rules and read/unread history are stored <span className="font-medium">per account</span> — switching accounts on the same browser keeps everything separate</li>
              <li>Use the <span className="font-medium">moon/sun</span> icon in the header to toggle between dark and light mode</li>
              <li>Use the <span className="font-medium">logout</span> button (top-right) to sign out of your account</li>
              <li>The app is available at <a href="https://literature-tracker.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">literature-tracker.com</a></li>
            </ul>
          </Section>
        </div>

        {/* Suggestions section */}
        <div className="mt-4">
          <div className="bg-card rounded-2xl border-container border-border shadow-sm px-3 py-[0.525rem]">
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
      </main>
    </div>
  );
}
