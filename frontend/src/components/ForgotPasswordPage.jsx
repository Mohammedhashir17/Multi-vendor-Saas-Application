import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { img } from '../utils/img';

const AUTH_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIviaZECR-wczNYg1EmlzPBXdTJnikvqaDDmYDaQ4DXrCVZqfapWzsGj6lXaXyZ5QSythFNx0jm1zSdzasQa-FHJhpJo9nGpaIW5d0ZYCijXqL-YCFeWoI9yPuPUImCsiFGOmJe-H0PaeTXkFDbokGetIUshA4NUJ6uRvYacXhKjeVwKMjVXWtT0XtGKWlHVu8_WjVwsNEj1pLdyPr624K4FJTY0M63IUoKFeMzMMfA7JIhZOuo7epZp2LARjfAexMdPQBRZxNrM';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.requestPasswordResetOtp({ email: email.trim() });
      navigate('/reset-password/verify', { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
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
          <div className="flex items-center gap-4 md:gap-6">
            <Link className="text-brand-action font-semibold hover:underline text-sm" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-stretch justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-ambient overflow-hidden border border-outline-variant/20">
          <div className="lg:w-1/2 relative min-h-[180px] lg:min-h-0 bg-[#40034F]">
            <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" src={img(AUTH_BG)} />
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end text-white bg-gradient-to-t from-[#40034F]/90 to-transparent">
              <h2 className="font-h1 text-white mb-2">Reset password</h2>
              <p className="text-white/85 text-body-md max-w-md">
                Enter the email for your account. We’ll issue a one-time code. In local development, set{' '}
                <code className="text-xs bg-white/10 px-1 rounded">LOG_RESET_OTP=true</code> on the API to print the code in the
                terminal.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-6">
              <h1 className="font-h1 text-on-surface mb-2">Forgot password</h1>
              <p className="text-on-surface-variant text-body-md">Step 1 of 2 — your email</p>
            </div>
            {error ? (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            ) : null}
            <form className="space-y-6" onSubmit={onSubmit}>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A951C5] hover:bg-[#8d36aa] disabled:opacity-60 text-white font-h3 py-3 rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Sending…' : 'Send verification code'}
              </button>
            </form>
            <p className="mt-6 text-center text-body-sm text-on-surface-variant">
              <Link className="text-primary font-bold hover:underline" to="/login">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
