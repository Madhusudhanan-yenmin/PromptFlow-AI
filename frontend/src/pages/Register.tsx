import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { extractErrorMessage } from '../utils/error';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-indigo-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const validateField = (fieldName: string, value: string): string => {
    if (fieldName === 'name') {
      const cleanName = value.trim();
      if (!cleanName) return 'Full name is required.';
      if (cleanName.length < 2) return 'Full name must be at least 2 characters.';
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(cleanName)) return 'Full name should only contain letters and spaces.';
    }

    if (fieldName === 'email') {
      const cleanEmail = value.trim();
      if (!cleanEmail) return 'Email address is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) return 'Please enter a valid email address (e.g. user@example.com).';
    }

    if (fieldName === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
    }

    if (fieldName === 'confirmPassword') {
      if (!value) return 'Please confirm your password.';
      if (value !== password) return 'Passwords do not match.';
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

    // Dynamically re-check confirm password if password changes
    if (field === 'password' && confirmPassword) {
      if (confirmPassword !== value) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    setFieldErrors(errors);
    return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateAllFields()) {
      return;
    }

    setLoading(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to create account. Please check your inputs.');
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl glow-purple">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-sm text-slate-400">Join PromptFlow AI platform</p>
      </div>

      {apiError && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value, setName)}
              onBlur={(e) => handleBlur('name', e.target.value)}
              placeholder="Jane Doe"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.name ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors`}
            />
          </div>
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.name}</span>
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="jane@example.com"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.email ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              placeholder="At least 6 characters"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.password ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors`}
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
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}

          {/* Password Strength Indicator */}
          {password && !fieldErrors.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Password Strength</span>
                <span className="text-slate-200">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value, setConfirmPassword)}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              className={`w-full bg-slate-900/80 border ${
                fieldErrors.confirmPassword
                  ? 'border-rose-500/60 focus:border-rose-500'
                  : confirmPassword && !fieldErrors.confirmPassword
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors`}
            />
            {confirmPassword && !fieldErrors.confirmPassword && (
              <Check className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
            )}
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.confirmPassword}</span>
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs">
        <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
          Already have an account? <span className="text-indigo-400 font-medium">Sign in</span>
        </Link>
      </div>
    </div>
  );
};
