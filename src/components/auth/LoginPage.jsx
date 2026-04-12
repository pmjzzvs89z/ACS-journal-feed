import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Loader2, BookOpen, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDark, toggleDark] = useDarkMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Password reset email sent! Check your inbox and follow the link to reset your password.');
        setIsForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/confirm` },
        });
        if (error) throw error;
        setMessage('Account created! Please check your email to confirm your account, then log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setIsLogin(mode === 'login');
    setIsForgotPassword(mode === 'forgot');
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="fixed top-4 right-4 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-card/80 border-border text-muted-foreground hover:bg-accent"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
      </button>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Literature Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow your favorite journals</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            {isForgotPassword ? 'Reset your password' : isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>
            )}

            {message && (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg">{message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {!isForgotPassword && (
              <button
                onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                className="block w-full text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
            {isLogin && !isForgotPassword && (
              <button
                onClick={() => switchMode('forgot')}
                className="block w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
              >
                Forgot your password?
              </button>
            )}
            {isForgotPassword && (
              <button
                onClick={() => switchMode('login')}
                className="block w-full text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
