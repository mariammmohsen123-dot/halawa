import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Crown, Layers, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { InquiryForm } from '../../components/public/InquiryForm';
import { RevealItem } from '../../components/public/MotionPrimitives';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, settings, services, projects, openBookingModal } = useApp();

  const service = useMemo(
    () => services.find((s) => s.slug === slug || s.id === slug),
    [services, slug]
  );

  const relatedProjects = useMemo(() => {
    if (!service) return [];
    return projects.filter((p) => p.serviceSlug === service.slug);
  }, [projects, service]);

  useDocumentSeo({
    title: service ? (lang === 'ar' ? service.titleAr : service.titleEn) : t('الخدمة', 'Service'),
    description: service ? (lang === 'ar' ? service.summaryAr : service.summaryEn) : undefined,
    lang,
    settings,
  });

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  if (!service) {
    return (
      <div className="py-24 max-w-3xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">
          {t('لم يتم العثور على الخدمة المطلوبة', 'Service Not Found')}
        </h1>
        <Link to="/services" className="btn-gold px-6 py-3 rounded-xl text-sm inline-block">
          {t('العودة لدليل الخدمات', 'Back to Services')}
        </Link>
      </div>
    );
  }

  const title = lang === 'ar' ? service.titleAr : service.titleEn;
  const solutions = lang === 'ar' ? service.solutionsAr || [] : service.solutionsEn || [];
  const deliverables = lang === 'ar' ? service.deliverablesAr || [] : service.deliverablesEn || [];

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/services" className="hover:text-gold-300">
            {t('منظومة الخدمات', 'Services')}
          </Link>
          <span>/</span>
          <span className="text-gold-300">{title}</span>
        </div>

        {/* Hero Banner */}
        <div
          className={`rounded-2xl p-8 sm:p-10 space-y-5 ${
            service.isVipTrack ? 'vip-track-surface' : 'surface-card-elevated'
          }`}
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gold-300">
            {service.isVipTrack ? <Crown className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            <span>{service.tag}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h1>
          <p className="text-base text-slate-200 leading-relaxed max-w-3xl">
            {lang === 'ar' ? service.summaryAr : service.summaryEn}
          </p>

          {(service.targetAudienceAr || service.targetAudienceEn) && (
            <div className="inline-flex items-start gap-2.5 p-4 rounded-xl bg-[#040B16]/80 border border-slate-800 text-sm text-slate-200">
              <Users className="w-5 h-5 text-gold-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gold-300">
                  {t('الجهات المستفيدة: ', 'Target Audience: ')}
                </span>
                <span>
                  {lang === 'ar' ? service.targetAudienceAr : service.targetAudienceEn}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => openBookingModal(title)}
              className="btn-gold px-7 py-3.5 rounded-xl text-sm cursor-pointer"
            >
              {t('احجز جلسة استشارية لهذا المسار', 'Schedule Consultation for This Track')}
            </button>
          </div>
        </div>

        {/* Solutions & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl surface-card p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-extrabold text-white">
              {t('نطاق الحلول والتدخلات الفنية', 'Technical Scope & Solutions')}
            </h2>
            <ul className="space-y-3">
              {solutions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl surface-card p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-extrabold text-white">
              {t('المخرجات الموثقة للتسليم', 'Verified Deliverables')}
            </h2>
            <ul className="space-y-3">
              {deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Case Studies */}
        {relatedProjects.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-extrabold text-white">
              {t('مشاريع منفذة ضمن هذا المسار', 'Executed Case Studies in This Pillar')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map((proj, idx) => (
                <RevealItem key={proj.id} index={idx}>
                  <div className="h-full rounded-2xl surface-card card-gold-glow p-6 space-y-3">
                    <div className="text-xs font-mono text-gold-300">
                      {lang === 'ar' ? proj.periodAr : proj.periodEn}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      {lang === 'ar' ? proj.titleAr : proj.titleEn}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {lang === 'ar' ? proj.clientAr : proj.clientEn}
                    </p>
                    <Link
                      to={`/projects/${proj.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:underline pt-2"
                    >
                      <span>{t('عرض دراسة الحالة', 'View Case Study')}</span>
                      <DirArrow className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </RevealItem>
              ))}
            </div>
          </div>
        )}

        {/* Preselected Inquiry Form */}
        <div className="pt-4">
          <InquiryForm preselectedService={title} />
        </div>
      </div>
    </div>
  );
}
