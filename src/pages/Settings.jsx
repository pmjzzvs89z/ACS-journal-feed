import React, { useState } from 'react';
import { entities } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Rss, Bookmark, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import JournalSelector from '@/components/journals/JournalSelector';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function Settings() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const isGuideActive = location.pathname === createPageUrl('Guide');
  const [isDark, toggleDark] = useDarkMode();

  const { data: followedJournals = [], isLoading } = useQuery({
    queryKey: ['followedJournals'],
    queryFn: () => entities.FollowedJournal.list(),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedJournals'] }),
  });

  const activeCount = followedJournals.filter(j => j.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.svg"
                alt="Literature Tracker"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Literature Tracker</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home') + '?tab=feed'}>
                <button className="flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Rss className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </button>
              </Link>
              <Link to={createPageUrl('Home') + '?tab=saved'}>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                <SettingsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Journal Selector</span>
              </button>
              <Link to={createPageUrl('Guide')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' : 'bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                </button>
              </Link>
              <button
                onClick={toggleDark}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div style={{ width: '620px' }} className="flex-shrink-0">
            <div className="bg-card rounded-2xl border-[1.5px] border-border shadow-sm overflow-hidden">
              {/* Box header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground">Journals Selector</h2>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? 'Loading…' : `${activeCount} journal${activeCount !== 1 ? 's' : ''} selected`}
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-160px)]">
                <div className="p-4">
                  <JournalSelector
                    followedJournals={followedJournals}
                    onToggleJournal={(journal) => toggleJournalMutation.mutate(journal)}
                    onCustomJournalAdded={() => queryClient.invalidateQueries({ queryKey: ['followedJournals'] })}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Suggestions section */}
        <div className="flex justify-center mt-4">
          <div style={{ width: '620px' }} className="flex-shrink-0">
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
    </div>
  );
}
