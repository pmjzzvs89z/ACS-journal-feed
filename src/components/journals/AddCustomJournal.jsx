import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';

export default function AddCustomJournal({ onJournalAdded }) {
  const [rssUrl, setRssUrl] = useState('');
  const [journalName, setJournalName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddJournal = async (e) => {
    e.preventDefault();
    setError('');

    if (!rssUrl.trim() || !journalName.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setIsLoading(true);
    try {
      const customId = `custom_${Date.now()}`;
      
      await entities.FollowedJournal.create({
        journal_id: customId,
        journal_name: journalName.trim(),
        rss_url: rssUrl.trim(),
        is_active: true,
      });

      setRssUrl('');
      setJournalName('');
      setIsExpanded(false);
      
      if (onJournalAdded) {
        onJournalAdded({
          id: customId,
          journal_id: customId,
          journal_name: journalName.trim(),
          name: journalName.trim(),
          abbrev: journalName.trim().substring(0, 20),
          rss_url: rssUrl.trim(),
          color: '#6c757d',
          category: 'Custom',
        });
      }
    } catch (err) {
      setError('Failed to add journal. Please check the RSS feed URL.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-2 bg-secondary hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0 bg-muted-foreground/40" />
        <span className="font-normal text-foreground text-sm">Add Custom RSS</span>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-4 bg-card">
          <form onSubmit={handleAddJournal} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Journal Name</label>
              <input
                type="text"
                value={journalName}
                onChange={e => setJournalName(e.target.value)}
                placeholder="e.g. My Research Journal"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">RSS Feed URL</label>
              <input
                type="url"
                value={rssUrl}
                onChange={e => setRssUrl(e.target.value)}
                placeholder="https://example.com/feed.rss"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1.5 rounded">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Add Journal
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}