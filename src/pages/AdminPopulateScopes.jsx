import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function AdminPopulateScopes() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [scopeCount, setScopeCount] = useState(null);

  const BATCH_SIZE = 5;

  const addLog = (msg) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 200));

  const loadScopeCount = async () => {
    const scopes = await base44.entities.JournalScope.list('-created_date', 500);
    setScopeCount(scopes.length);
  };

  useEffect(() => { loadScopeCount(); }, []);

  const runBatch = async (currentOffset) => {
    const res = await base44.functions.invoke('populateJournalScopes', {
      skip_existing: false,
      batch_size: BATCH_SIZE,
      offset: currentOffset,
    });
    return res.data;
  };

  const startRun = async () => {
    setRunning(true);
    setDone(false);
    setLog([]);
    let currentOffset = offset;

    try {
      while (true) {
        const data = await runBatch(currentOffset);
        if (!data) break;

        if (total === 0 || data.total_journals) setTotal(data.total_journals);

        const msg = `Offset ${data.offset}: processed ${data.processed}, skipped ${data.skipped}, errors ${data.errors}`;
        addLog(msg);
        if (data.results?.length) {
          data.results.forEach(r => addLog(`  ✓ ${r.journalName} (${r.keywordCount} keywords)`));
        }
        if (data.error_details?.length) {
          data.error_details.forEach(e => addLog(`  ✗ ${e.journalId}: ${e.error}`));
        }

        setOffset(data.next_offset || data.offset + BATCH_SIZE);

        if (!data.has_more) {
          setDone(true);
          addLog('✅ All journals processed!');
          await loadScopeCount();
          break;
        }

        currentOffset = data.next_offset;
        // Small pause between batches
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const progress = total > 0 ? Math.round((offset / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Populate Journal Scopes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visits each journal's scope page and generates AI keywords for search indexing.
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm text-slate-500">Indexed journals</p>
          <p className="text-2xl font-bold text-slate-900">{scopeCount ?? '…'}</p>
        </div>
        <div className="ml-auto">
          <p className="text-sm text-slate-500">Total journals</p>
          <p className="text-2xl font-bold text-slate-900">{total || '429'}</p>
        </div>
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{offset} / {total}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={startRun}
          disabled={running}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {running ? 'Running…' : done ? 'Run Again' : offset > 0 ? 'Resume' : 'Start Indexing All Journals'}
        </Button>
        {!running && offset > 0 && !done && (
          <Button variant="outline" onClick={() => { setOffset(0); setLog([]); }}>
            Reset
          </Button>
        )}
        <Button variant="outline" onClick={loadScopeCount} disabled={running}>
          Refresh Count
        </Button>
      </div>

      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-0.5">
          {log.map((l, i) => (
            <div key={i} className={l.includes('✓') ? 'text-green-400' : l.includes('✗') || l.includes('❌') ? 'text-red-400' : l.includes('✅') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {l}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 border border-slate-200">
        <strong>Note:</strong> This runs in batches of {BATCH_SIZE} journals. Already-indexed journals are skipped automatically. 
        You can safely stop and resume at any time. For a full run of ~429 journals expect ~15–20 minutes.
      </div>
    </div>
  );
}