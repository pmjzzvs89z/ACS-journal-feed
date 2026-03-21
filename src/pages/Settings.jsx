import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Check, Rss, Bookmark, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import JournalSelector from '@/components/journals/JournalSelector';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Settings() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const location = useLocation();
  const isGuideActive = location.pathname === createPageUrl('Guide');

  const { data: followedJournals = [], isLoading } = useQuery({
    queryKey: ['followedJournals'],
    queryFn: () => base44.entities.FollowedJournal.list(),
  });

  const toggleJournalMutation = useMutation({
    mutationFn: async (journal) => {
      const existing = followedJournals.find(j => j.journal_id === journal.id);
      if (existing) {
        return base44.entities.FollowedJournal.update(existing.id, { is_active: !existing.is_active });
      } else {
        return base44.entities.FollowedJournal.create({
          journal_id: journal.id,
          journal_name: journal.name,
          rss_url: journal.rss_url,
          is_active: true
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedJournals'] }),
  });

  const handleSave = async () => {
    // Settings auto-save on toggle, so this just gives user feedback
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activeCount = followedJournals.filter(j => j.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3.5">
              <img src="https://media.base44.com/images/public/6999e9b080715094c0e4fdd7/c11d32ff5_Screenshot2026-03-07at95434PM.png" alt="Logo" className="w-13 h-13 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Literature Tracker</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            {/* Tab nav — matches Home page exactly */}
             <div className="flex items-center gap-4">
               <Link to={createPageUrl('Home') + '?tab=feed'}>
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
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 text-blue-600 border-blue-200">
                <SettingsIcon className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Journal Selector</span>
              </button>
              <Link to={createPageUrl('Guide')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600' : ''}`} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div style={{ width: '620px' }} className="flex-shrink-0">
            {/* Box with header and Save button */}
            <div className="bg-white rounded-2xl border-[1.5px] border-[#DCE8F6] shadow-sm overflow-hidden">
              {/* Box header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-slate-900">Journals Selector</h2>
                  <p className="text-xs text-slate-500">
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
    </div>
  );
}