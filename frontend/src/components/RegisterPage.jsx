import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MaterialIcon, PasswordField } from '../common/shared';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { img } from '../utils/img';

const AUTH_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIviaZECR-wczNYg1EmlzPBXdTJnikvqaDDmYDaQ4DXrCVZqfapWzsGj6lXaXyZ5QSythFNx0jm1zSdzasQa-FHJhpJo9nGpaIW5d0ZYCijXqL-YCFeWoI9yPuPUImCsiFGOmJe-H0PaeTXkFDbokGetIUshA4NUJ6uRvYacXhKjeVwKMjVXWtT0XtGKWlHVu8_WjVwsNEj1pLdyPr624K4FJTY0M63IUoKFeMzMMfA7JIhZOuo7epZp2LARjfAexMdPQBRZxNrM';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const digitsOnly = mobile.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Enter a valid mobile number (at least 10 digits).');
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await register({ name, email: normalizedEmail, mobile, password, confirmPassword, role: 'customer' });
      navigate('/register/verify', {
        state: {
          email: normalizedEmail,
          message: res.data?.message || 'We sent a verification code to your email.',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
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
            <Link className="text-brand-action font-semibold hover:underline text-sm md:text-base" to="/login">
              Sign in
            </Link>
            <Link to="/cart" className="text-brand-action" aria-label="Cart">
              <MaterialIcon name="shopping_cart" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-stretch justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-ambient overflow-hidden border border-outline-variant/20">
          <div className="lg:w-1/2 relative min-h-[200px] lg:min-h-0 bg-brand-frame">
            <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" src={img(AUTH_BG)} />
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end text-white bg-gradient-to-t from-black/50 to-transparent">
              <MaterialIcon name="shopping_bag" className="text-5xl mb-4 opacity-80" />
              <h2 className="font-h1 text-white mb-4">Shop smarter in one platform</h2>
              <p className="text-white/90 font-body-lg max-w-md mb-8">
                Save addresses, sync your cart, track orders, and check out faster across all your devices.
              </p>
              <div className="flex flex-wrap gap-6 opacity-75">
                <div>
                  <p className="text-3xl font-bold">Fast</p>
                  <p className="text-sm">Checkout</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">Secure</p>
                  <p className="text-sm">Payments</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="font-h1 text-on-surface font-black text-4xl md:text-5xl leading-tight mb-2">Create Account</h1>
              <p className="text-on-surface-variant text-body-md">Join Bazario today and start shopping from your place.</p>
            </div>
            {error ? (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            ) : null}
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Your name"
                  type="text"
                  required
                />
              </div>
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
                <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Mobile number</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. 9876543210 or +91 98765 43210"
                  type="tel"
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Password</label>
                  <PasswordField
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputClassName="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-bold text-on-surface-variant uppercase tracking-tight">Confirm password</label>
                  <PasswordField
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    inputClassName="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input className="mt-1 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" required />
                <p className="text-body-sm text-on-surface-variant">
                  I agree to the{' '}
                  <a className="text-primary font-semibold hover:underline" href="#terms">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a className="text-primary font-semibold hover:underline" href="#privacy">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container hover:bg-primary disabled:opacity-60 text-white font-h3 py-4 rounded-xl shadow-lg transition-all active:scale-[0.99]"
              >
                {loading ? 'Sending OTP…' : 'Create account'}
              </button>
              <p className="text-center text-on-surface-variant text-body-sm">
                Already have an account?{' '}
                <Link className="text-primary font-bold hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
