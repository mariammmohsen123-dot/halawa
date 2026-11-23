import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Compass, ShieldCheck, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { InteractiveSpotlightCard, RevealItem } from '../../components/public/MotionPrimitives';

export function AboutPage() {
  const { lang, t, settings, pages, openBookingModal } = useApp();
  const aboutPage = useMemo(() => pages.find((p) => p.slug === 'about'), [pages]);
  const methodologyPage = useMemo(() => pages.find((p) => p.slug === 'methodology'), [pages]);
  const whyHccPage = useMemo(() => pages.find((p) => p.slug === 'why_hcc'), [pages]);

  useDocumentSeo({
    title: t('من نحن والأذرع الثلاثة', 'About HCC & 3 Operational Arms'),
    description: lang === 'ar' ? aboutPage?.bodyAr : aboutPage?.bodyEn,
    lang,
    settings,
  });

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-extrabold uppercase text-gold-300">
            {lang === 'ar' ? aboutPage?.subtitleAr : aboutPage?.subtitleEn}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {lang === 'ar' ? aboutPage?.titleAr : aboutPage?.titleEn}
          </h1>
          <p className="text-base text-slate-200 leading-relaxed">
            {lang === 'ar' ? aboutPage?.bodyAr : aboutPage?.bodyEn}
          </p>
        </div>

        {/* Vision, Mission & Legal Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevealItem index={0}>
            <div className="h-full rounded-2xl surface-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-gold-300 font-extrabold text-sm">
                <Compass className="w-5 h-5" />
                <span>{t('الرؤية', 'Vision')}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {lang === 'ar' ? aboutPage?.visionAr : aboutPage?.visionEn}
              </p>
            </div>
          </RevealItem>

          <RevealItem index={1}>
            <div className="h-full rounded-2xl surface-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-gold-300 font-extrabold text-sm">
                <Target className="w-5 h-5" />
                <span>{t('الرسالة', 'Mission')}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {lang === 'ar' ? aboutPage?.missionAr : aboutPage?.missionEn}
              </p>
            </div>
          </RevealItem>

          <RevealItem index={2}>
            <div className="h-full rounded-2xl surface-card-elevated p-6 space-y-3">
              <div className="flex items-center gap-2 text-gold-300 font-extrabold text-sm">
                <Building2 className="w-5 h-5" />
                <span>{t('السجل القانوني الرسمي', 'Official Legal Registration')}</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono text-slate-200 tabular-nums">
                <li>UNGM Vendor ID: {settings.ungmNumber}</li>
                <li>{t('رقم الشركة المرخصة:', 'Registration ID:')} {settings.regNumber}</li>
                <li>{t('السجل التجاري:', 'Commercial Reg:')} {settings.commercialNumber}</li>
                <li>{t('عضوية الغرفة التجارية:', 'GCCI Membership:')} #{settings.gcciNumber}</li>
              </ul>
            </div>
          </RevealItem>
        </div>

        {/* 3 Operational Arms */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            {t('الأذرع التشغيلية الثلاثة للمنظومة', 'The Three Operational Arms')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(aboutPage?.items || []).map((arm, idx) => (
              <RevealItem key={arm.id} index={idx}>
                <InteractiveSpotlightCard className="h-full rounded-2xl surface-card card-gold-glow p-6 gap-4">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold text-gold-300">
                      {arm.code} • {lang === 'ar' ? arm.subtitleAr : arm.subtitleEn}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      {lang === 'ar' ? arm.titleAr : arm.titleEn}
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {lang === 'ar' ? arm.descAr : arm.descEn}
                    </p>
                    {(arm.detailsAr || arm.detailsEn) && (
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                        {lang === 'ar' ? arm.detailsAr : arm.detailsEn}
                      </p>
                    )}
                  </div>
                  {arm.relatedServiceSlug && (
                    <Link
                      to={`/services/${arm.relatedServiceSlug}`}
                      className="text-xs font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5 pt-2"
                    >
                      <span>{t('الخدمات المرتبطة', 'Related Service Track')}</span>
                      <DirArrow className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </InteractiveSpotlightCard>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* 4-Stage Methodology */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            {lang === 'ar' ? methodologyPage?.titleAr : methodologyPage?.titleEn}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(methodologyPage?.items || []).map((step, idx) => (
              <RevealItem key={step.id} index={idx}>
                <InteractiveSpotlightCard className="h-full rounded-2xl bg-[#071426] border border-slate-800 p-6 space-y-3 hover:border-gold-400/45 transition-colors">
                  <div className="space-y-3">
                    <div className="text-sm font-mono font-extrabold text-gold-300 tabular-nums">
                      {step.code}
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      {lang === 'ar' ? step.titleAr : step.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {lang === 'ar' ? step.descAr : step.descEn}
                    </p>
                  </div>
                </InteractiveSpotlightCard>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* Why HCC */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            {lang === 'ar' ? whyHccPage?.titleAr : whyHccPage?.titleEn}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(whyHccPage?.items || []).map((w, idx) => (
              <RevealItem key={w.id} index={idx}>
                <InteractiveSpotlightCard className="h-full rounded-2xl surface-card card-gold-glow p-6 space-y-2.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-gold-300 text-xs font-mono font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{w.code}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      {lang === 'ar' ? w.titleAr : w.titleEn}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {lang === 'ar' ? w.descAr : w.descEn}
                    </p>
                  </div>
                </InteractiveSpotlightCard>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl surface-card-elevated p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              {t('هل تبحث عن شريك تنفيذي واستشاري موثوق؟', 'Looking for an Executive Advisory & Delivery Partner?')}
            </h3>
            <p className="text-sm text-slate-300">
              {t('احجز جلسة تشخيص مبدئية أو أرسل ملف طلب العرض (RFP).', 'Schedule a diagnostic consultation or submit your RFP.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openBookingModal('')}
              className="btn-gold px-6 py-3 rounded-xl text-sm cursor-pointer"
            >
              {t('حجز موعد استشارة', 'Book Consultation')}
            </button>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-gold-400/40 text-gold-300 text-sm font-bold hover:bg-navy-800"
            >
              {t('نموذج التواصل', 'Contact Form')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
