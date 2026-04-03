import React, { useMemo } from 'react';
import { entities } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { ALL_JOURNALS } from '@/components/journals/JournalList';
import { BookOpen, Users, Bookmark, TrendingUp, BarChart2, Info, Rss, Settings, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#DCE8F6] dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-slate-600 dark:text-slate-400 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || '#3b82f6' }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [isDark, toggleDark] = useDarkMode();

  const { data: followedData = [], isLoading: loadingFollowed } = useQuery({
    queryKey: ['admin-followed'],
    queryFn: entities.Admin.getAllFollowedJournals,
    staleTime: 5 * 60 * 1000,
  });

  const { data: savedData = [], isLoading: loadingSaved } = useQuery({
    queryKey: ['admin-saved'],
    queryFn: entities.Admin.getAllSavedArticles,
    staleTime: 5 * 60 * 1000,
  });

  const stats = useMemo(() => {
    const uniqueUsers = new Set(followedData.map(j => j.user_id)).size;
    const uniqueUsersSaved = new Set(savedData.map(s => s.user_id)).size;
    const totalUsers = Math.max(uniqueUsers, uniqueUsersSaved);

    // Journal popularity (active follows by journal)
    const journalCounts = {};
    followedData.filter(j => j.is_active).forEach(j => {
      const key = j.journal_name || j.journal_id;
      journalCounts[key] = (journalCounts[key] || 0) + 1;
    });
    const topJournals = Object.entries(journalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Most saved journals
    const savedByJournal = {};
    savedData.forEach(s => {
      const key = s.journal_abbrev || s.journal_name || 'Unknown';
      if (!savedByJournal[key]) savedByJournal[key] = { count: 0, color: s.journal_color };
      savedByJournal[key].count++;
    });
    const topSaved = Object.entries(savedByJournal)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    // Recent activity (last 10 saves)
    const recentSaves = [...savedData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    // Activity by day (last 14 days)
    const now = Date.now();
    const dayMs = 86400000;
    const activityByDay = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      activityByDay[d.toISOString().slice(0, 10)] = 0;
    }
    savedData.forEach(s => {
      const day = s.created_at?.slice(0, 10);
      if (day && activityByDay[day] !== undefined) activityByDay[day]++;
    });
    const activityChart = Object.entries(activityByDay);

    return {
      totalUsers,
      totalActiveFollows: followedData.filter(j => j.is_active).length,
      totalSaves: savedData.length,
      topJournals,
      topSaved,
      recentSaves,
      activityChart,
    };
  }, [followedData, savedData]);

  const isLoading = loadingFollowed || loadingSaved;
  const isOwnDataOnly = stats.totalUsers <= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3.5">
              <img src="/logo.svg" alt="Literature Tracker" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Usage analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Home')}>
                <button className="flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Rss className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700">
                  <Settings className="w-4 h-4" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* RLS notice if only seeing own data */}
        {isOwnDataOnly && !isLoading && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Showing your account's data only. To see all users' statistics, enable cross-user read access in Supabase Row Level Security for <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">followed_journals</code> and <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">saved_articles</code>.</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Users" value={isLoading ? '…' : stats.totalUsers} sub="Unique accounts" color="blue" />
          <StatCard icon={BookOpen} label="Active Follows" value={isLoading ? '…' : stats.totalActiveFollows} sub="Journal subscriptions" color="purple" />
          <StatCard icon={Bookmark} label="Saved Articles" value={isLoading ? '…' : stats.totalSaves} sub="Across all users" color="amber" />
          <StatCard icon={TrendingUp} label="Total Journals" value={ALL_JOURNALS.length} sub="Available in catalog" color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most followed journals */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#DCE8F6] dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Most Followed Journals</h3>
            </div>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}</div>
            ) : stats.topJournals.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No data yet.</p>
            ) : (
              <div>
                {stats.topJournals.map(([name, count]) => (
                  <MiniBar key={name} label={name} value={count} max={stats.topJournals[0]?.[1] || 1} color="#3b82f6" />
                ))}
              </div>
            )}
          </div>

          {/* Most saved journals */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#DCE8F6] dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Most Saved Journals</h3>
            </div>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}</div>
            ) : stats.topSaved.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No saved articles yet.</p>
            ) : (
              <div>
                {stats.topSaved.map(([name, { count, color }]) => (
                  <MiniBar key={name} label={name} value={count} max={stats.topSaved[0]?.[1]?.count || 1} color={color || '#f59e0b'} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity chart — saves per day */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#DCE8F6] dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saves per Day (last 14 days)</h3>
          </div>
          {isLoading ? (
            <div className="h-16 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            <div className="flex items-end gap-1 h-16">
              {stats.activityChart.map(([day, count]) => {
                const max = Math.max(...stats.activityChart.map(([, c]) => c), 1);
                const pct = Math.max(count / max, count > 0 ? 0.05 : 0);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count} saves`}>
                    <div
                      className="w-full rounded-sm bg-green-400 dark:bg-green-500 transition-all duration-500"
                      style={{ height: `${Math.round(pct * 56)}px`, minHeight: count > 0 ? '4px' : '0' }}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 rotate-45 origin-left hidden sm:block">
                      {day.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent saves */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#DCE8F6] dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Saves</h3>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}</div>
          ) : stats.recentSaves.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No saved articles yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentSaves.map((s, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: s.journal_color || '#3b82f6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors">
                      {s.title}
                    </a>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {s.journal_abbrev || s.journal_name}
                      {s.created_at && ` · ${format(new Date(s.created_at), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
