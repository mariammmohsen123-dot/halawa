import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, ShieldAlert, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, settings, projects, services, openBookingModal } = useApp();

  const project = useMemo(
    () => projects.find((p) => p.slug === slug || p.id === slug),
    [projects, slug]
  );

  const relatedService = useMemo(
    () => (project ? services.find((s) => s.slug === project.serviceSlug) : undefined),
    [services, project]
  );

  useDocumentSeo({
    title: project ? (lang === 'ar' ? project.titleAr : project.titleEn) : t('مشروع', 'Project'),
    description: project ? (lang === 'ar' ? project.roleAr : project.roleEn) : undefined,
    lang,
    settings,
  });

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  if (!project) {
    return (
      <div className="py-24 max-w-3xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">
          {t('المشروع غير موجود', 'Case Study Not Found')}
        </h1>
        <Link to="/projects" className="btn-gold px-6 py-3 rounded-xl text-sm inline-block">
          {t('العودة لسجل المشاريع', 'Back to Portfolio')}
        </Link>
      </div>
    );
  }

  const metrics = lang === 'ar' ? project.metricsAr || [] : project.metricsEn || [];

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/projects" className="hover:text-gold-300">
            {t('سجل العقود والأثر', 'Projects & Impact')}
          </Link>
          <span>/</span>
          <span className="text-gold-300">{project.sector}</span>
        </div>

        {/* Header */}
        <div className="rounded-2xl surface-card-elevated p-7 sm:p-9 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="px-3 py-1 rounded-md bg-gold-400/15 border border-gold-400/35 text-gold-300 font-bold">
              {project.sector}
            </span>
            <span className="font-mono text-slate-300 tabular-nums">
              {lang === 'ar' ? project.periodAr : project.periodEn}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-snug">
            {lang === 'ar' ? project.titleAr : project.titleEn}
          </h1>
          <p className="text-sm sm:text-base font-bold text-gold-200">
            {t('الجهة المستفيدة / الشريك:', 'Client / Contracting Partner:')}{' '}
            {lang === 'ar' ? project.clientAr : project.clientEn}
          </p>
          {relatedService && (
            <Link
              to={`/services/${relatedService.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:underline pt-1"
            >
              <span>
                {t('المسار التشغيلي:', 'Service Track:')}{' '}
                {lang === 'ar' ? relatedService.titleAr : relatedService.titleEn}
              </span>
              <DirArrow className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Challenge, Role, Solutions */}
        <div className="grid grid-cols-1 gap-6">
          {(project.challengeAr || project.challengeEn) && (
            <div className="rounded-2xl surface-card p-6 sm:p-7 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-extrabold">
                <ShieldAlert className="w-5 h-5" />
                <span>{t('التحدي والسياق الميداني', 'Field Challenge & Context')}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {lang === 'ar' ? project.challengeAr : project.challengeEn}
              </p>
            </div>
          )}

          {(project.roleAr || project.roleEn) && (
            <div className="rounded-2xl surface-card p-6 sm:p-7 space-y-2.5">
              <div className="flex items-center gap-2 text-gold-300 text-sm font-extrabold">
                <FileCheck2 className="w-5 h-5" />
                <span>{t('دور شركة HCC في التنفيذ', 'HCC Execution Role')}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {lang === 'ar' ? project.roleAr : project.roleEn}
              </p>
            </div>
          )}

          {(project.solutionsAr || project.solutionsEn) && (
            <div className="rounded-2xl surface-card p-6 sm:p-7 space-y-2.5">
              <div className="flex items-center gap-2 text-gold-300 text-sm font-extrabold">
                <Wrench className="w-5 h-5" />
                <span>{t('الحلول الهندسية والرقمية المعتمدة', 'Engineered & Digital Solutions')}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {lang === 'ar' ? project.solutionsAr : project.solutionsEn}
              </p>
            </div>
          )}
        </div>

        {/* Verified Metrics */}
        {metrics.length > 0 && (
          <div className="rounded-2xl bg-[#071426] border border-gold-400/35 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-extrabold text-white">
              {t('النتائج والمؤشرات القابلة للتحقق', 'Verified Outcomes & Metrics')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-4 rounded-xl bg-[#040B16] border border-slate-800 text-sm text-slate-100 font-semibold tabular-nums"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Readiness Banner */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">
              {t(
                'الجاهزية الفنية والتكامل التعاقدي (Technical Readiness)',
                'Technical Readiness & Contracting Compliance'
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {t(
                'الشركة مسجلة على UNGM (1290555) وتعمل بإعفاء ضريبي Zero-VAT ومعايير AAP / PSEA.',
                'Registered on UNGM (1290555) operating with Zero-VAT status and full AAP / PSEA compliance.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal(lang === 'ar' ? project.titleAr : project.titleEn)}
            className="btn-gold px-5 py-3 rounded-xl text-xs sm:text-sm shrink-0 cursor-pointer"
          >
            {t('طلب عرض فني مماثل', 'Request Similar Mandate')}
          </button>
        </div>
      </div>
    </div>
  );
}
