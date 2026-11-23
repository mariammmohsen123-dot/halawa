import React from 'react';
import { Calendar, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { InquiryForm } from '../../components/public/InquiryForm';
import { sanitizeExternalUrl } from '../../types/cms';

export function ContactPage() {
  const { lang, t, settings, openBookingModal } = useApp();
  const safeWhatsapp = sanitizeExternalUrl(settings.whatsappUrl);
  const safeLinkedin = sanitizeExternalUrl(settings.linkedinUrl);

  useDocumentSeo({
    title: t('تواصل معنا وطلب استشارة', 'Contact & Consultation'),
    description: t(
      'تواصل مع شركة محمد حسن حلاوة وشركاؤه (HCC) لحجز استشارة أو طلب عرض فني ومالي.',
      'Contact Halawa Consultancy Co. (HCC) to book an executive consultation or request an RFP proposal.'
    ),
    lang,
    settings,
  });

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-extrabold uppercase text-gold-300">
            {t('التواصل المؤسسي وحجز الاستشارات', 'CONTACT & EXECUTIVE INTAKE')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('تواصل مباشرة مع فريق القيادة في HCC', 'Connect Directly with HCC Advisory Leadership')}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {t(
              'سواء كنت تمثل شركة خاصة، منظمة دولية، أو مشروعاً ريادياً، يتم حفظ وتوثيق جميع الطلبات مباشرة في نظام المتابعة التنفيذي.',
              'Whether you represent a private enterprise, international organization, or high-growth venture, all submissions are tracked directly in our executive intake pipeline.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl surface-card p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-white">
                {t('قنوات الاتصال الرسمية', 'Official Contact Channels')}
              </h2>

              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#040B16] border border-slate-800 hover:border-gold-400/50 transition-colors"
              >
                <Mail className="w-5 h-5 text-gold-300 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">{t('البريد الإلكتروني', 'Email')}</div>
                  <div className="text-sm font-bold text-white ltr-inline">{settings.email}</div>
                </div>
              </a>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#040B16] border border-slate-800 hover:border-gold-400/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-gold-300 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">{t('الهاتف المباشر', 'Direct Phone')}</div>
                  <div className="text-sm font-bold text-white ltr-inline tabular-nums">{settings.phone}</div>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#040B16] border border-slate-800">
                <MapPin className="w-5 h-5 text-gold-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">{t('العنوان والتغطية', 'Locations')}</div>
                  <div className="text-sm font-semibold text-white">
                    {lang === 'ar' ? settings.addressAr : settings.addressEn}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {safeWhatsapp && (
                  <a
                    href={safeWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs font-bold text-slate-200 hover:border-gold-400/50 hover:text-gold-300 inline-flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {safeLinkedin && (
                  <a
                    href={safeLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs font-bold text-slate-200 hover:border-gold-400/50 hover:text-gold-300 inline-flex items-center gap-1.5"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-2xl surface-card-elevated p-6 space-y-3">
              <h3 className="text-base font-extrabold text-white">
                {t('حجز موعد استشارة محدد', 'Book a Scheduled Slot')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t(
                  'تصفح المواعيد المتاحة لأعضاء مجلس القيادة لتحديد جلسة تعريفية أو تشخيصية مباشرة.',
                  'Browse live available slots with our executive advisors for an introductory or diagnostic session.'
                )}
              </p>
              <button
                type="button"
                onClick={() => openBookingModal('')}
                className="w-full btn-gold py-3 px-5 rounded-xl text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('فتح جدول المواعيد المتاحة', 'Open Consultation Scheduler')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <InquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
