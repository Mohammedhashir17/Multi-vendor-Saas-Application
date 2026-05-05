import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { img } from '../utils/img';

const AUTH_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIviaZECR-wczNYg1EmlzPBXdTJnikvqaDDmYDaQ4DXrCVZqfapWzsGj6lXaXyZ5QSythFNx0jm1zSdzasQa-FHJhpJo9nGpaIW5d0ZYCijXqL-YCFeWoI9yPuPUImCsiFGOmJe-H0PaeTXkFDbokGetIUshA4NUJ6uRvYacXhKjeVwKMjVXWtT0XtGKWlHVu8_WjVwsNEj1pLdyPr624K4FJTY0M63IUoKFeMzMMfA7JIhZOuo7epZp2LARjfAexMdPQBRZxNrM';

export default function ResetPasswordOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { api } = useAuth();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const em = email.trim().toLowerCase();
    if (!em.includes('@')) {
      setError('Enter a valid email.');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await api.confirmPasswordReset({
        email: em,
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });
      navigate('/login', { state: { message: 'Password updated. Sign in with your new password.' } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not reset password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-marketplace">
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 md:px-6 lg:px-10 xl:px-12 py-3 w-full">
          <Link to="/" className="text-2xl font-black text-brand-frame">
            Bazario
          </Link>
          <Link className="text-brand-action font-semibold hover:underline text-sm" to="/login">
            Sign in
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-stretch justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-ambient overflow-hidden border border-outline-variant/20">
          <div className="lg:w-1/2 relative min-h-[180px] lg:min-h-0 bg-[#40034F]">
            <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" src={img(AUTH_BG)} />
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end text-white bg-gradient-to-t from-[#40034F]/90 to-transparent">
              <h2 className="font-h1 text-white mb-2">Enter your code</h2>
              <p className="text-white/85 text-body-md max-w-md">
                Step 2 of 2 — use the 6-digit verification code, then choose a new password.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-6">
              <h1 className="font-h1 text-on-surface mb-2">Verify &amp; reset</h1>
              <p className="text-on-surface-variant text-body-md">Enter the code and your new password</p>
              {!initialEmail ? (
                <p className="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  If you opened this page directly, enter the same email you used to request the code.
                </p>
              ) : null}
            </div>
            {error ? (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            ) : null}
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  placeholder="you@example.com"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">6-digit code</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none tracking-widest text-lg font-mono"
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">New password</label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Confirm new password</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A951C5] hover:bg-[#8d36aa] disabled:opacity-60 text-white font-h3 py-3 rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
            <p className="mt-6 text-center text-body-sm text-on-surface-variant">
              <Link className="text-primary font-bold hover:underline" to="/forgot-password">
                Resend code
              </Link>
              {' · '}
              <Link className="text-primary font-bold hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
