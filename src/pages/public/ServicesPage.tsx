import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Crown, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { InteractiveSpotlightCard, RevealItem } from '../../components/public/MotionPrimitives';

export function ServicesPage() {
  const { lang, t, settings, services, openBookingModal } = useApp();
  useDocumentSeo({
    title: t('منظومة الخدمات', 'Services Ecosystem'),
    description: t(
      'خدمات HCC في ISO 9001، هندسة التعافي الاقتصادي، التعهيد عن بُعد، وحاضنة Concept Hub ومسار النخبة.',
      'HCC services across ISO 9001, economic recovery engineering, remote BPO teams, Concept Hub, and VIP executive advisory.'
    ),
    lang,
    settings,
  });

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-extrabold uppercase text-gold-300">
            {t('منظومة الخدمات الاستشارية والتنفيذية', 'CONSULTING & DELIVERY PILLARS')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('حلول مؤسسية قابلة للقياس في كل مسار', 'Measurable Enterprise & Institutional Solutions')}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {t(
              'نغطي دورة بناء الأعمال والتحول المؤسسي بالكامل: من تأهيل ISO 9001 وهندسة التعافي للمنظمات الدولية، حتى بناء الفرق السحابية وإدارة الحملات والمؤتمرات الكبرى.',
              'We cover the full lifecycle of institutional transformation—from ISO 9001 governance and industrial recovery engineering to remote BPO teams, venture incubation, and VIP strategic campaigns.'
            )}
          </p>
        </div>

        <div className="space-y-6">
          {services.map((svc, idx) => {
            const solutions = lang === 'ar' ? svc.solutionsAr || [] : svc.solutionsEn || [];
            const deliverables = lang === 'ar' ? svc.deliverablesAr || [] : svc.deliverablesEn || [];
            const title = lang === 'ar' ? svc.titleAr : svc.titleEn;

            return (
              <RevealItem key={svc.id} index={idx}>
                <InteractiveSpotlightCard
                  isVip={svc.isVipTrack}
                  className={`rounded-2xl p-6 sm:p-8 space-y-6 card-gold-glow ${
                    svc.isVipTrack ? 'vip-track-surface' : 'surface-card'
                  }`}
                >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gold-300">
                      {svc.isVipTrack ? <Crown className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      <span>{svc.tag}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">{title}</h2>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                      {lang === 'ar' ? svc.summaryAr : svc.summaryEn}
                    </p>
                    {(svc.targetAudienceAr || svc.targetAudienceEn) && (
                      <p className="text-xs text-slate-300 pt-1">
                        <strong className="text-gold-300">
                          {t('الفئة المستهدفة:', 'Target Audience:')}
                        </strong>{' '}
                        {lang === 'ar' ? svc.targetAudienceAr : svc.targetAudienceEn}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 shrink-0">
                    <Link
                      to={`/services/${svc.slug}`}
                      className="px-4 py-2.5 rounded-xl border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-bold hover:bg-navy-800 inline-flex items-center gap-1.5"
                    >
                      <span>{t('صفحة الخدمة', 'Service Details')}</span>
                      <DirArrow className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openBookingModal(title)}
                      className="btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer"
                    >
                      {t('اطلب الخدمة', 'Request Service')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-800/80">
                  <div>
                    <h3 className="text-xs font-extrabold text-gold-300 uppercase mb-3">
                      {t('الحلول والمنهجيات المقدمة', 'Core Solutions & Methodologies')}
                    </h3>
                    <ul className="space-y-2">
                      {solutions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-gold-300 uppercase mb-3">
                      {t('المخرجات المتوقعة', 'Expected Deliverables')}
                    </h3>
                    <ul className="space-y-2">
                      {deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </InteractiveSpotlightCard>
              </RevealItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}
