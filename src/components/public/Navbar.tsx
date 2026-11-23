import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Globe, Menu, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Navbar() {
  const { lang, toggleLang, t, settings, openBookingModal, isStaff } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('الرئيسية', 'Home') },
    { to: '/about', label: t('من نحن', 'About') },
    { to: '/#why-hcc', label: t('ما يميزنا', 'Why HCC'), isHash: true },
    { to: '/services', label: t('منظومة الخدمات', 'Services') },
    { to: '/projects', label: t('العقود والأثر', 'Projects & Impact') },
    { to: '/partners', label: t('الشركاء والاعتمادات', 'Partners') },
    { to: '/leadership', label: t('القيادة', 'Leadership') },
    { to: '/contact', label: t('تواصل معنا', 'Contact') },
  ];

  const handleHashClick = (to: string) => {
    setMobileOpen(false);
    if (to === '/#why-hcc' && location.pathname === '/') {
      const el = document.getElementById('why-hcc');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#040B16]/90 backdrop-blur-md border-b border-gold-300/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 shrink-0 group focus:outline-none"
        >
          <div className="bg-white/95 rounded-lg p-1.5 shadow-sm flex items-center justify-center h-11 w-auto shrink-0">
            <img
              src={settings.logoNavUrl}
              alt={settings.brandNameEn}
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-extrabold text-white tracking-tight whitespace-nowrap">
              {lang === 'ar' ? 'HCC – كونسبت' : 'HCC – Concept'}
            </span>
            <span className="text-[11px] font-medium text-gold-300 whitespace-nowrap">
              {t('شركة محمد حسن حلاوة وشركاؤه', 'Halawa Consultancy Co.')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label={t('القائمة الرئيسية', 'Main Navigation')}
          className="hidden xl:flex items-center gap-1"
        >
          {navLinks.map((item) =>
            item.isHash ? (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleHashClick(item.to)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-gold-300 hover:bg-navy-800/70 transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-gold-300 bg-navy-800/90 border border-gold-400/25'
                      : 'text-slate-200 hover:text-gold-300 hover:bg-navy-800/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t('تبديل اللغة إلى الإنجليزية', 'Switch language to Arabic')}
            className="px-3 py-2 rounded-lg border border-gold-300/25 bg-navy-900 text-xs font-bold text-slate-100 hover:border-gold-400/60 hover:text-gold-300 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-gold-300" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {isStaff && (
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('لوحة الإدارة', 'Admin')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => openBookingModal('')}
            className="btn-gold px-4 py-2.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('احجز استشارة', 'Book Consultation')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t('فتح القائمة', 'Toggle menu')}
            aria-expanded={mobileOpen}
            className="xl:hidden p-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-navy-800 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#071426] border-t border-gold-300/15 px-4 py-5 space-y-2 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleHashClick(item.to)}
                className="px-4 py-3 rounded-lg text-sm font-semibold text-slate-100 bg-navy-800/60 hover:bg-navy-800 hover:text-gold-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:border-gold-400/40 inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-gold-300" />
              <span>{t('بوابة الإدارة والموظفين', 'Staff & Admin Console')}</span>
            </Link>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              UNGM: {settings.ungmNumber}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
