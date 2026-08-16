import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@promptflow.ai');
    setPassword('demo123');
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl glow-purple">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-slate-400">Sign in to your PromptFlow AI workspace</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-indigo-400 hover:underline font-medium"
        >
          Use Demo Credentials
        </button>
        <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
          Need an account? <span className="text-indigo-400 font-medium">Register</span>
        </Link>
      </div>
    </div>
  );
};
