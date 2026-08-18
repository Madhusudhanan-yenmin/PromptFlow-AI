import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { extractErrorMessage } from '../utils/error';

interface FieldErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string => {
    if (name === 'email') {
      const cleanEmail = value.trim();
      if (!cleanEmail) return 'Email address is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) return 'Please enter a valid email address (e.g. user@example.com).';
    }

    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
    }

    return '';
  };

  const handleBlur = (field: keyof FieldErrors, value: string) => {
    const errorMsg = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleInputChange = (field: keyof FieldErrors, value: string, setter: (val: string) => void) => {
    setter(value);
    if (apiError) setApiError('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateAllFields()) {
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Invalid email address or password.');
      setApiError(msg);
      // Also highlight input fields with inline error
      setFieldErrors({
        email: 'Invalid email address or password.',
        password: 'Check your password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    const demoEmail = 'demo@promptflow.ai';
    const demoPass = 'demo123';
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
    setApiError('');
    setLoading(true);

    try {
      await login({ email: demoEmail, password: demoPass });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to sign in with demo credentials.');
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl glow-purple relative z-10">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-slate-400">Sign in to your PromptFlow AI workspace</p>
      </div>

      {/* Prominent API Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-3 shadow-lg animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Authentication Failed</p>
            <p className="leading-relaxed opacity-90">{apiError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${fieldErrors.email ? 'text-rose-400' : 'text-slate-500'}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="user@example.com"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.email
                  ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/40 text-rose-100 placeholder-rose-300/40'
                  : 'border-slate-800 focus:border-indigo-500 text-slate-100'
              } rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none transition-all`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${fieldErrors.password ? 'text-rose-400' : 'text-slate-500'}`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.password
                  ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/40 text-rose-100 placeholder-rose-300/40'
                  : 'border-slate-800 focus:border-indigo-500 text-slate-100'
              } rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder-slate-500 focus:outline-none transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
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
