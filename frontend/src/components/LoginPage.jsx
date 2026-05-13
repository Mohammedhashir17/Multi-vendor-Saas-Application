import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MaterialIcon, PasswordField } from '../common/shared';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { img } from '../utils/img';

const AUTH_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIviaZECR-wczNYg1EmlzPBXdTJnikvqaDDmYDaQ4DXrCVZqfapWzsGj6lXaXyZ5QSythFNx0jm1zSdzasQa-FHJhpJo9nGpaIW5d0ZYCijXqL-YCFeWoI9yPuPUImCsiFGOmJe-H0PaeTXkFDbokGetIUshA4NUJ6uRvYacXhKjeVwKMjVXWtT0XtGKWlHVu8_WjVwsNEj1pLdyPr624K4FJTY0M63IUoKFeMzMMfA7JIhZOuo7epZp2LARjfAexMdPQBRZxNrM';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const flash = location.state?.message || '';
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current) return undefined;

    let cancelled = false;
    const el = googleBtnRef.current;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      el.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError('');
            if (!response?.credential) return;
            await googleLogin(response.credential);
            navigate('/');
          } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Google sign-in failed';
            setError(msg);
          }
        },
      });
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        width: Math.min(el.offsetWidth || 360, 400),
        text: 'continue_with',
        locale: 'en',
      });
    };

    document.body.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [googleLogin, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(emailOrMobile.trim(), password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
    }
  }

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-marketplace">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-10 xl:px-12 py-3 w-full font-['Plus_Jakarta_Sans'] antialiased">
          <Link to="/" className="text-2xl font-black text-brand-frame dark:text-purple-300">
            Bazario
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              className="text-brand-neutral font-medium hover:text-brand-frame transition-colors"
              to="/register"
            >
              Sign up
            </Link>
            <Link to="/cart" className="text-brand-action" aria-label="Cart">
              <MaterialIcon name="shopping_cart" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-stretch justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-ambient border border-outline-variant/20">
          <div className="lg:w-1/2 relative min-h-[200px] lg:min-h-0 bg-[#40034F]">
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              src={img(AUTH_BG)}
            />
            <div className="relative z-10 p-8 lg:p-12 h-full min-h-[200px] lg:min-h-[min(520px,65vh)] flex flex-col justify-end text-white bg-gradient-to-t from-[#40034F] via-transparent to-transparent">
              <h2 className="font-h1 text-h1 text-white mb-md">Welcome back</h2>
              <p className="font-body-lg text-body-lg text-white/80">
                Sign in with your email or mobile and password, or use Google.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="font-h1 text-h1 text-on-surface mb-2">Login</h1>
              <p className="font-body-md text-body-md text-brand-neutral">Sign in to your Bazario account to continue shopping, manage orders, and track deliveries.</p>
            </div>
            {flash ? (
              <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2" role="status">
                {flash}
              </p>
            ) : null}
            {error ? (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            ) : null}
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                  Email or mobile number
                </label>
                <input
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md"
                  placeholder="name@example.com or 9876543210"
                  type="text"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Password</label>
                  <Link
                    to="/forgot-password"
                    className="font-label-md text-label-md text-brand-action hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputClassName="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="pt-sm">
                <button
                  type="submit"
                  className="w-full bg-[#A951C5] hover:bg-[#8d36aa] text-white font-h3 py-md rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  Login
                </button>
              </div>
              <div className="relative flex items-center py-sm">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="flex-shrink mx-md font-label-md text-brand-neutral">OR</span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>
              <div className="w-full flex justify-center min-h-[44px]">
                {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
                  <div ref={googleBtnRef} className="w-full flex justify-stretch [&>div]:w-full" />
                ) : (
                  <p className="text-center text-sm text-on-surface-variant">
                    Google sign-in: add <code className="text-xs bg-slate-100 px-1 rounded">REACT_APP_GOOGLE_CLIENT_ID</code> and matching{' '}
                    <code className="text-xs bg-slate-100 px-1 rounded">GOOGLE_CLIENT_ID</code> on the API.
                  </p>
                )}
              </div>
            </form>
            <p className="mt-8 text-center font-body-md text-on-surface">
              New to Bazario?{' '}
              <Link className="text-[#A951C5] font-bold hover:underline" to="/register">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
