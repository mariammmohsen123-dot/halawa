import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AdminLayout() {
  const { lang, toggleLang, t, user, userRole, isAdmin, signOutUser, settings } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: t('نظرة عامة', 'Overview') },
    { to: '/admin/inquiries', icon: MessageSquare, label: t('طلبات الاستشارة (CRM)', 'Inquiries (CRM)') },
    { to: '/admin/appointments', icon: Calendar, label: t('المواعيد والحجوزات', 'Slots & Bookings') },
    { to: '/admin/services', icon: Layers, label: t('الخدمات الاستشارية', 'Services') },
    { to: '/admin/projects', icon: Briefcase, label: t('المشاريع والأثر', 'Projects') },
    { to: '/admin/metrics', icon: BarChart3, label: t('لوحة الإحصاءات', 'Impact Metrics') },
    { to: '/admin/pages', icon: FileText, label: t('أقسام المحتوى', 'Page Sections') },
    { to: '/admin/partners', icon: Shield, label: t('الشركاء والاعتمادات', 'Partners & Badges') },
    { to: '/admin/team', icon: Users, label: t('القيادة التنفيذية', 'Leadership Team') },
    { to: '/admin/media', icon: ImageIcon, label: t('مكتبة الوسائط', 'Media Library') },
    ...(isAdmin
      ? [
          { to: '/admin/settings', icon: Settings, label: t('الإعدادات وSEO', 'Site Settings & SEO') },
          { to: '/admin/users', icon: Shield, label: t('الصلاحيات والسجل', 'Users & Audit Logs') },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#040B16] text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Desktop / Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 z-40 w-72 bg-[#071426] border-e border-gold-300/15 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : lang === 'ar'
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 px-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1 h-9 flex items-center justify-center shrink-0">
              <img src={settings.logoNavUrl} alt="HCC" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">HCC Admin</div>
              <div className="text-[11px] font-mono text-gold-300 uppercase">
                {userRole === 'admin' ? t('مدير عام (Admin)', 'Super Admin') : t('محرر محتوى (Editor)', 'Editor')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-navy-800 text-gold-300 border border-gold-400/35'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          <button
            type="button"
            onClick={signOutUser}
            className="w-full px-3.5 py-2.5 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 text-xs font-bold hover:bg-red-500/20 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-[#071426]/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-700 text-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-white">
              {t('لوحة التحكم المؤسسية — HCC Concept Ecosystem', 'HCC Corporate Management Console')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleLang}
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-200 hover:border-gold-400/50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-gold-300" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <Link
              to="/"
              className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 hover:bg-navy-700 inline-flex items-center gap-1.5"
            >
              <span>{t('معاينة الموقع', 'Live Site')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
