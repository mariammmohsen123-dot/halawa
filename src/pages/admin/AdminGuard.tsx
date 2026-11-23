import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const {
    lang,
    toggleLang,
    t,
    user,
    authReady,
    isStaff,
    userRole,
    signInWithGoogle,
    signInWithEmail,
    signOutUser,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const DirArrow = lang === 'ar' ? ArrowRight : ArrowLeft;

  const handleGoogleLogin = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : t('تعذر تسجيل الدخول عبر Google.', 'Google Sign-In failed.')
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setAuthError(
          t(
            'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
            'Invalid email address or password.'
          )
        );
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError(
          t(
            'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل بعد في إعدادات Firebase Authentication.',
            'Email/Password sign-in is not enabled yet in Firebase Authentication.'
          )
        );
      } else {
        setAuthError(
          err instanceof Error
            ? err.message
            : t('تعذر تسجيل الدخول بالبريد الإلكتروني.', 'Email sign-in failed.')
        );
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setSendingVerification(true);
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : t('تعذر إرسال رابط التفعيل.', 'Failed to send verification email.')
      );
    } finally {
      setSendingVerification(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#040B16] flex items-center justify-center p-6 text-slate-300 text-sm">
        {t('جارٍ التحقق من الجلسة والصلاحيات...', 'Verifying executive session & permissions...')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040B16] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl surface-card-elevated p-8 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-gold-300 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              {t('بوابة الإدارة والتحكم المؤسسي', 'HCC Executive Admin Console')}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t(
                'سجّل الدخول بالبريد الإلكتروني المعتمد أو حساب Google لإدارة المحتوى، الطلبات، المواعيد، ومؤشرات الأثر.',
                'Sign in with an authorized email or Google account to manage CMS content, inquiries, slots, and metrics.'
              )}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/35 text-xs text-red-200 text-start">
              {authError}
            </div>
          )}

          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3 text-start">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t('البريد الإلكتروني', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="w-full ps-10 pe-3.5 py-2.5 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t('كلمة المرور', 'Password')}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-3.5 py-2.5 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full btn-gold py-3 px-6 rounded-xl text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-1"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {signingIn
                  ? t('جارٍ المصادقة...', 'Signing in...')
                  : t('دخول بالبريد الإلكتروني', 'Sign in with Email')}
              </span>
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-800" />
            <span className="shrink mx-3 text-[11px] font-bold text-slate-400">
              {t('أو', 'OR')}
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="w-full py-3 px-6 rounded-xl border border-gold-400/45 bg-navy-900 text-gold-300 hover:bg-navy-800 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>
              {signingIn
                ? t('جارٍ المصادقة...', 'Signing in...')
                : t('تسجيل الدخول عبر Google', 'Sign in with Google')}
            </span>
          </button>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <Link
              to="/"
              className="text-slate-300 hover:text-gold-300 inline-flex items-center gap-1.5"
            >
              <DirArrow className="w-3.5 h-3.5" />
              <span>{t('العودة للموقع العام', 'Return to Public Site')}</span>
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="text-gold-300 font-bold hover:underline cursor-pointer"
            >
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    const unverifiedEmail = Boolean(user && !user.emailVerified);

    return (
      <div className="min-h-screen bg-[#040B16] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-[#071426] border border-red-400/40 p-8 space-y-5 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-400/35 flex items-center justify-center text-red-300 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white">
            {unverifiedEmail
              ? t('البريد الإلكتروني غير مُفعّل بعد', 'Email Verification Required')
              : t('حساب غير مصرح له بالدخول الإداري', 'Access Restricted')}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {unverifiedEmail
              ? t(
                  `تم تسجيل الدخول بالحساب (${user.email})، لكن قواعد أمان قاعدة البيانات تتطلب أن تكون حالة التحقق من البريد (email_verified) مفعلة قبل منح صلاحيات الإدارة.`,
                  `Signed in as (${user.email}), but Firestore security rules require email_verified to be true before granting admin access.`
                )
              : t(
                  `تم تسجيل الدخول بالحساب (${user.email})، لكنه لا يملك صلاحية Admin أو Editor مفعلة في قاعدة البيانات.`,
                  `Signed in as (${user.email}), but this account does not have an active Admin or Editor role.`
                )}
          </p>

          {unverifiedEmail && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={sendingVerification || verificationSent}
                className="w-full py-2.5 px-4 rounded-xl bg-gold-400/15 border border-gold-400/40 text-xs font-bold text-gold-300 hover:bg-gold-400/25 disabled:opacity-60 cursor-pointer"
              >
                {verificationSent
                  ? t('تم إرسال رابط التفعيل إلى بريدك', 'Verification Email Sent')
                  : sendingVerification
                  ? t('جارٍ الإرسال...', 'Sending...')
                  : t('إرسال رابط تفعيل البريد الإلكتروني', 'Send Verification Email')}
              </button>
              {authError && (
                <p className="text-xs text-red-300">{authError}</p>
              )}
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#040B16] border border-slate-800 text-xs font-mono text-slate-400">
            UID: {user.uid}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={signOutUser}
              className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-bold hover:bg-red-500/30 inline-flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('تسجيل الخروج', 'Sign Out')}</span>
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-200 text-xs font-bold hover:bg-navy-800"
            >
              {t('الموقع العام', 'Public Website')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-role={userRole || 'staff'}>
      {children}
    </div>
  );
}
