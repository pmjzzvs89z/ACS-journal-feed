import React, { useRef } from 'react';
import { entities } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Rss, Bookmark, Settings as SettingsIcon, Moon, Sun, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import JournalSelector from '@/components/journals/JournalSelector';
import Tooltip from '@/components/ui/Tooltip';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';

export default function Settings() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const isGuideActive = location.pathname === createPageUrl('Guide');
  const [isDark, toggleDark] = useDarkMode();
  const { logout, user } = useAuth();
  const userId = user?.id;
  const journalCardRef = useRef(null);
  const journalSelectorRef = useRef(null);

  // Clicking anywhere outside the Journal Selector card (e.g. the blue page
  // background) has the same effect as pressing the blue "Close" button in
  // the filters row — clears All Publishers / All Categories dropdowns and
  // collapses any expanded publisher/category accordion.
  const handlePageMouseDown = (e) => {
    if (journalCardRef.current && !journalCardRef.current.contains(e.target)) {
      journalSelectorRef.current?.clearAll?.();
    }
  };

  const { data: followedJournals = [], isPending: isLoading } = useQuery({
    queryKey: ['followedJournals', userId],
    queryFn: () => entities.FollowedJournal.list(),
    enabled: !!userId,
  });

  const { data: savedArticles = [] } = useQuery({
    queryKey: ['savedArticles', userId],
    queryFn: () => entities.SavedArticle.list(),
    enabled: !!userId,
  });

  const toggleJournalMutation = useMutation({
    mutationFn: async (journal) => {
      const existing = followedJournals.find(j => j.journal_id === journal.id);
      if (existing) {
        return entities.FollowedJournal.update(existing.id, { is_active: !existing.is_active });
      } else {
        return entities.FollowedJournal.create({
          journal_id: journal.id,
          journal_name: journal.name,
          rss_url: journal.rss_url,
          is_active: true
        });
      }
    },
    // Optimistic update — flip the UI instantly, reconcile on server response.
    onMutate: async (journal) => {
      await queryClient.cancelQueries({ queryKey: ['followedJournals', userId] });
      const previous = queryClient.getQueryData(['followedJournals', userId]) || [];
      const existing = previous.find(j => j.journal_id === journal.id);
      let next;
      if (existing) {
        next = previous.map(j =>
          j.journal_id === journal.id ? { ...j, is_active: !j.is_active } : j
        );
      } else {
        next = [
          ...previous,
          {
            id: `temp-${journal.id}-${Date.now()}`,
            journal_id: journal.id,
            journal_name: journal.name,
            rss_url: journal.rss_url,
            is_active: true,
            __optimistic: true,
          },
        ];
      }
      queryClient.setQueryData(['followedJournals', userId], next);
      return { previous };
    },
    onError: (_err, _journal, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['followedJournals', userId], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['followedJournals'] }),
  });

  const activeCount = followedJournals.filter(j => j.is_active).length;

  return (
    <div onMouseDown={handlePageMouseDown} className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
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

            {/* Tab nav */}
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home') + '?tab=feed'}>
                <button className="feed-pulse flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-slate-300/80 dark:hover:bg-blue-900/40">
                  <Rss className="w-4 h-4 feed-pulse-inner" />
                  <span className="hidden sm:inline feed-pulse-inner">Feed</span>
                </button>
              </Link>
              <Link to={createPageUrl('Home') + '?tab=saved'}>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                  {savedArticles.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{savedArticles.length}</span>
                  )}
                </button>
              </Link>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                <SettingsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Journal Selector</span>
              </button>
              <Tooltip label="User Guide" delay={500}>
                <Link to={createPageUrl('Guide')}>
                  <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'}`}>
                    <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  </button>
                </Link>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
                <button
                  onClick={toggleDark}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </button>
              </Tooltip>
              <Tooltip label="Log out" delay={500}>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex justify-center">
          <div ref={journalCardRef} style={{ maxWidth: '620px' }} className="w-full">
            <div className="bg-card rounded-2xl border-container border-border shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 162px)' }}>
              {/* Box header — always visible */}
              <div className="flex-shrink-0 flex items-center gap-3 px-4 py-[0.225rem] border-b border-border bg-muted">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-normal text-slate-900 dark:text-white">
                    {isLoading ? 'Loading…' : `${activeCount} journal${activeCount !== 1 ? 's' : ''} selected`}
                  </h2>
                </div>
              </div>

              {/* Journal list — JournalSelector manages its own fixed header + scrollable body */}
              <div className="flex-1 min-h-0 flex flex-col">
                <JournalSelector
                  ref={journalSelectorRef}
                  followedJournals={followedJournals}
                  onToggleJournal={(journal) => toggleJournalMutation.mutate(journal)}
                  onCustomJournalAdded={() => queryClient.invalidateQueries({ queryKey: ['followedJournals'] })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions section */}
        <div className="flex justify-center mt-4">
          <div style={{ maxWidth: '620px' }} className="w-full">
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
        </div>
      </div>
    </div>
  );
}
