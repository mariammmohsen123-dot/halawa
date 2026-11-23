import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { PartnerLogoGrid } from '../../components/public/PartnerLogoGrid';

export function PartnersPage() {
  const { lang, t, settings, openBookingModal } = useApp();

  useDocumentSeo({
    title: t('الاعتمادات والشركاء', 'Partners & Accreditations'),
    description: t(
      'سجل الاعتمادات الرسمية لدى UNGM وPNGO والغرفة التجارية وشبكة التحالفات الدولية.',
      'Official accreditations (UNGM, PNGO, GCCI) and consortium partners of Halawa Consultancy Co.'
    ),
    lang,
    settings,
  });

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-gold-300">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('الاعتمادات والشركاء الرسميون', 'VERIFIED ACCREDITATIONS & PARTNERS')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {t('منظومة الثقة الدولية والائتلافات المهنية', 'International Trust Seals & Strategic Alliances')}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              {t(
                'تعمل شركة HCC بشفافية تعاقدية موثقة مع هيئات الأمم المتحدة والمانحين الأوروبيين واتحادات القطاع الخاص والبنية التحتية السحابية.',
                'HCC operates with verifiable contractual standing alongside UN agencies, European donors, private-sector federations, and digital infrastructure providers.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal(t('شراكة أو ائتلاف مشروع', 'Consortium / Partnership Inquiry'))}
            className="btn-gold px-6 py-3 rounded-xl text-sm shrink-0 cursor-pointer self-start lg:self-auto"
          >
            {t('مناقشة شراكة أو ائتلاف', 'Discuss a Consortium Partnership')}
          </button>
        </div>

        <PartnerLogoGrid />
      </div>
    </div>
  );
}
