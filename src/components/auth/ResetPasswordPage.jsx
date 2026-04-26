// Password reset page reached via the link in the "Forgot your password"
// email. Supabase processes the recovery hash (#access_token=...&type=recovery)
// in the URL and establishes a recovery session, after which the user can
// call updateUser({ password }) to set a new one.
//
// Lives OUTSIDE the auth gate (see App.jsx) because the recovery session is
// not the user's normal logged-in session — landing here should always show
// the new-password form, never the app shell.
//
// Visual design intentionally mirrors LoginPage.jsx — same gradient
// background, logo block, card style, inputs, buttons, dark-mode toggle —
// so users perceive a single unified auth flow.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      if (updateErr) {
        // Supabase blocks "same password as old" by default. This is a
        // low-friction app — treat that case as success so a user who
        // forgot the password and re-types the original isn't stuck.
        const isSamePassword = /same(\s+|_)?password|different from the old/i.test(updateErr.message || '');
        if (!isSamePassword) throw updateErr;
      }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Dark mode toggle — same position/style as LoginPage */}
      <div className="fixed top-4 right-4">
        <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-card/80 border-border text-muted-foreground hover:bg-accent"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>
        </Tooltip>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo block — same as LoginPage */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.svg"
            alt="Literature Tracker"
            className="w-16 h-16 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Literature Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Reset your password</p>
        </div>

        {/* Card — same as LoginPage */}
        <div className="bg-card rounded-2xl border-container border-border shadow-sm p-6">
          {checkingSession ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-sm text-muted-foreground">Verifying reset link…</p>
            </div>
          ) : !hasRecoverySession ? (
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Link invalid or expired</h2>
              <p className="text-sm text-muted-foreground">
                This reset link is no longer valid. Please request a new one from the login page.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
              <h2 className="text-lg font-semibold text-foreground">Password updated</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting you to sign in with your new password…
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                Choose a new password
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
