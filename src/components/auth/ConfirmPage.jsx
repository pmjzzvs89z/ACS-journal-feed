import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

export default function ConfirmPage() {
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    // Supabase appends token_hash & type as URL hash fragments or query params.
    // The JS client picks them up automatically via onAuthStateChange.
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    // If there's an error in the hash, fail immediately
    if (hash && hash.includes('error')) {
      setStatus('error');
      return;
    }

    // If redirected with query params (token_hash flow), verify explicitly
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        .then(({ error }) => setStatus(error ? 'error' : 'success'))
        .catch(() => setStatus('error'));
      return;
    }

    // For hash-fragment flows (#access_token=...), Supabase auto-processes
    // the hash on init. Listen for the resulting auth state change to
    // confirm success rather than using a blind timeout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success');
      }
    });

    // If Supabase never fires an event (e.g. the link was already consumed
    // or the hash is malformed), show an error after a generous timeout
    // rather than spinning forever.
    const timer = setTimeout(() => {
      setStatus(prev => prev === 'verifying' ? 'error' : prev);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Literature Tracker</h1>
        </div>

        {/* Confirmation card */}
        <div className="bg-card rounded-2xl border-container border-border shadow-sm p-8">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-foreground font-medium">Verifying your email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Your email has been confirmed</h2>
              <p className="text-sm text-muted-foreground mb-6">Now you can log in to Literature Tracker</p>
              <a
                href="/"
                className="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center"
              >
                Go to Login
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">!</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Confirmation failed</h2>
              <p className="text-sm text-muted-foreground mb-6">The link may have expired. Please try signing up again.</p>
              <a
                href="/"
                className="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center"
              >
                Go to Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
