import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeExternalUrl } from '../../types/cms';

export function Footer() {
  const { lang, t, settings } = useApp();
  const safeLinkedin = sanitizeExternalUrl(settings.linkedinUrl);
  const safeWhatsapp = sanitizeExternalUrl(settings.whatsappUrl);

  return (
    <footer className="bg-[#040B16] border-t border-gold-300/15 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 rounded-lg p-1.5 h-11 flex items-center justify-center shrink-0">
                <img
                  src={settings.logoNavUrl}
                  alt={settings.brandNameEn}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ar' ? settings.brandNameAr : settings.brandNameEn}
                </h3>
                <p className="text-xs text-gold-300 font-semibold">
                  {lang === 'ar' ? settings.trademarkAr : settings.trademarkEn}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {lang === 'ar' ? settings.heroDescAr : settings.heroDescEn}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300 tabular-nums pt-1">
              <span className="px-2.5 py-1 rounded bg-navy-900 border border-slate-800">
                UNGM: {settings.ungmNumber}
              </span>
              <span className="px-2.5 py-1 rounded bg-navy-900 border border-slate-800">
                {t('مرخصة:', 'Reg:')} {settings.regNumber}
              </span>
              <span className="px-2.5 py-1 rounded bg-navy-900 border border-slate-800">
                {t('سجل تجاري:', 'Commercial:')} {settings.commercialNumber}
              </span>
              <span className="px-2.5 py-1 rounded bg-navy-900 border border-slate-800">
                GCCI: #{settings.gcciNumber}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-extrabold text-gold-300 mb-4">
              {t('خريطة المنصة', 'Platform Navigation')}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/about" className="hover:text-gold-300 transition-colors">
                  {t('من نحن والأذرع الثلاثة', 'About & 3 Operational Arms')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gold-300 transition-colors">
                  {t('منظومة الخدمات الاستشارية', 'Consulting Services')}
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-gold-300 transition-colors">
                  {t('سجل العقود والأثر الموثق', 'Projects & Verified Impact')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-gold-300 transition-colors">
                  {t('الشركاء والاعتمادات الدولية', 'Partners & Accreditations')}
                </Link>
              </li>
              <li>
                <Link to="/leadership" className="hover:text-gold-300 transition-colors">
                  {t('القيادة التنفيذية والحوكمة', 'Executive Leadership')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-300 transition-colors">
                  {t('تواصل معنا وطلب استشارة', 'Contact & Consultation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-gold-300 mb-4">
              {t('القنوات الرسمية', 'Official Channels')}
            </h4>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-gold-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-gold-300 shrink-0" />
              <span className="ltr-inline">{settings.email}</span>
            </a>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-gold-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-gold-300 shrink-0" />
              <span className="ltr-inline tabular-nums">{settings.phone}</span>
            </a>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-gold-300 shrink-0 mt-1" />
              <span>{lang === 'ar' ? settings.addressAr : settings.addressEn}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {safeLinkedin && (
                <a
                  href={safeLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:border-gold-400/50 hover:text-gold-300 inline-flex items-center gap-1.5"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {safeWhatsapp && (
                <a
                  href={safeWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:border-gold-400/50 hover:text-gold-300 inline-flex items-center gap-1.5"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()}{' '}
            {lang === 'ar'
              ? 'شركة محمد حسن حلاوة وشركاؤه (HCC – Concept Ecosystem). جميع الحقوق محفوظة.'
              : 'Mohammed Hasan Halawa & Partners Co. (HCC – Concept Ecosystem). All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-gold-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('لوحة التحكم الإدارية', 'Admin Console')}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
