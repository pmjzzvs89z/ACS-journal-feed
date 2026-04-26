// Password reset page reached via the link in the "Forgot your password"
// email. Supabase processes the recovery hash (#access_token=...&type=recovery)
// in the URL and establishes a recovery session, after which the user can
// call updateUser({ password }) to set a new one.
//
// Lives OUTSIDE the auth gate (see App.jsx) because the recovery session is
// not the user's normal logged-in session — landing here should always show
// the new-password form, never the app shell.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Loader2, Moon, Sun, CheckCircle } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import Tooltip from '@/components/ui/Tooltip';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isDark, toggleDark] = useDarkMode();

  // Detect that we landed here from a recovery email. Supabase fires a
  // PASSWORD_RECOVERY event after processing the URL hash, and there will
  // be an active session we can use for updateUser({ password }).
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setHasRecoverySession(!!session);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasRecoverySession(true);
        setCheckingSession(false);
      }
    });

    // Safety net: if no event arrives within 8s, stop showing the spinner
    const timeout = setTimeout(() => {
      if (!cancelled) setCheckingSession(false);
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      setSuccess(true);
      // Sign out so the user explicitly logs in with the new password —
      // otherwise the recovery session would just drop them straight into
      // the app, defeating the verification.
      await supabase.auth.signOut();
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err?.message || 'Could not update password. The reset link may have expired — request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute top-4 right-4">
        <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
          <button
            onClick={toggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-10 h-10 rounded-lg border bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700"
          >
            {isDark ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
          </button>
        </Tooltip>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Literature Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400">Reset your password</p>
        </div>

        <div className="bg-card border-container border-border rounded-2xl p-8 shadow-lg">
          {checkingSession ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Verifying reset link…</p>
            </div>
          ) : !hasRecoverySession ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Link invalid or expired</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This reset link is no longer valid. Please request a new one from the login page.
              </p>
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Password updated</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Redirecting you to sign in with your new password…
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
                Choose a new password
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
