import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { img } from '../utils/img';

const AUTH_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIviaZECR-wczNYg1EmlzPBXdTJnikvqaDDmYDaQ4DXrCVZqfapWzsGj6lXaXyZ5QSythFNx0jm1zSdzasQa-FHJhpJo9nGpaIW5d0ZYCijXqL-YCFeWoI9yPuPUImCsiFGOmJe-H0PaeTXkFDbokGetIUshA4NUJ6uRvYacXhKjeVwKMjVXWtT0XtGKWlHVu8_WjVwsNEj1pLdyPr624K4FJTY0M63IUoKFeMzMMfA7JIhZOuo7epZp2LARjfAexMdPQBRZxNrM';
const OTP_LENGTH = 6;

export default function RegisterOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyRegistrationOtp, api } = useAuth();
  const initialEmail = String(location.state?.email || '').trim().toLowerCase();
  const flash = location.state?.message || '';
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const otp = otpDigits.join('');

  function focusInput(index) {
    inputRefs.current[index]?.focus();
  }

  function updateOtpDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      focusInput(index - 1);
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handleOtpPaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setOtpDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH) - 1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (!initialEmail.includes('@')) {
      setError('Open this page from the register page so we know which email to verify.');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyRegistrationOtp({ email: initialEmail, otp });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not verify OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError('');
    setStatus('');
    if (!initialEmail.includes('@')) {
      setError('Open this page from the register page before requesting a new OTP.');
      return;
    }

    setResending(true);
    try {
      const res = await api.resendRegistrationOtp({ email: initialEmail });
      setStatus(res.data?.message || 'A new OTP has been sent.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not resend OTP';
      setError(msg);
    } finally {
      setResending(false);
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
              <h2 className="font-h1 text-white mb-2">Verify your email</h2>
              <p className="text-white/85 text-body-md max-w-md">Step 2 of 2. Enter the 6-digit OTP sent to your email to finish creating your account.</p>
            </div>
          </div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-6">
              <h1 className="font-h1 text-on-surface mb-2">Enter OTP</h1>
              <p className="text-on-surface-variant text-body-md">
                Confirm your email and activate your Bazario account.
                {initialEmail ? ` OTP sent to ${initialEmail}.` : ''}
              </p>
            </div>
            {flash ? (
              <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2" role="status">
                {flash}
              </p>
            ) : null}
            {status ? (
              <p className="mb-4 text-sm text-sky-800 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2" role="status">
                {status}
              </p>
            ) : null}
            {error ? (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            ) : null}
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <div className="flex gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      value={digit}
                      onChange={(e) => updateOtpDigit(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary outline-none text-center text-lg sm:text-xl font-mono"
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      aria-label={`OTP digit ${index + 1}`}
                      required
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A951C5] hover:bg-[#8d36aa] disabled:opacity-60 text-white font-h3 py-3 rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Verifying…' : 'Verify account'}
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="w-full border border-outline-variant hover:border-primary disabled:opacity-60 text-on-surface font-semibold py-3 rounded-xl transition-all"
              >
                {resending ? 'Resending…' : 'Resend OTP'}
              </button>
            </form>
            <p className="mt-6 text-center text-body-sm text-on-surface-variant">
              Already verified?{' '}
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
