import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { ImpactDashboard } from '../../components/public/ImpactDashboard';
import { InteractiveSpotlightCard, RevealItem } from '../../components/public/MotionPrimitives';

export function ProjectsPage() {
  const { lang, t, settings, projects, services } = useApp();
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useDocumentSeo({
    title: t('سجل العقود والأثر الميداني', 'Projects & Verified Impact'),
    description: t(
      'سجل عقود HCC الموثق مع UNDP وPFI وMercy Corps وGSG وMedics Worldwide.',
      'HCC verified project portfolio with UNDP, PFI, Mercy Corps, GSG, and Medics Worldwide.'
    ),
    lang,
    settings,
  });

  const sectors = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => s.add(p.sector));
    return Array.from(s);
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSector = sectorFilter === 'all' || p.sector === sectorFilter;
      const matchSvc = serviceFilter === 'all' || p.serviceSlug === serviceFilter;
      return matchSector && matchSvc;
    });
  }, [projects, sectorFilter, serviceFilter]);

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-extrabold uppercase text-gold-300">
            {t('سجل العقود والمشاريع الموثقة', 'PORTFOLIO & IMPACT REPOSITORY')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('أثر مؤسسي وميداني مُثبت بالأرقام والاعتمادات', 'Verifiable Institutional & Field Impact')}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {t(
              'نماذج فعلية لعقود منفذة مع منظمات أممية، وشبكات دولية، وشركات أعمال في التعهيد والأنظمة القياسية.',
              'Real-world mandates delivered for UN agencies, international networks, and corporate clients across BPO and ISO systems.'
            )}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="rounded-2xl surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gold-300 inline-flex items-center gap-1.5 me-1">
              <Filter className="w-3.5 h-3.5" />
              {t('القطاع:', 'Sector:')}
            </span>
            <button
              type="button"
              onClick={() => setSectorFilter('all')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                sectorFilter === 'all'
                  ? 'text-[#040B16]'
                  : 'bg-[#040B16] text-slate-300 border border-slate-800 hover:border-gold-400/40'
              }`}
            >
              {sectorFilter === 'all' && (
                <motion.span
                  layoutId="projectsPageSectorPill"
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                />
              )}
              <span className="relative z-10">{t('الكل', 'All')}</span>
            </button>
            {sectors.map((sec) => {
              const active = sectorFilter === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSectorFilter(sec)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    active
                      ? 'text-[#040B16]'
                      : 'bg-[#040B16] text-slate-300 border border-slate-800 hover:border-gold-400/40'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="projectsPageSectorPill"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                    />
                  )}
                  <span className="relative z-10">{sec}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-slate-300">
              {t('المسار:', 'Service:')}
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs font-semibold text-white focus:border-gold-400 focus:outline-none"
            >
              <option value="all">{t('جميع الخدمات', 'All Services')}</option>
              {services.map((s) => (
                <option key={s.id} value={s.slug}>
                  {lang === 'ar' ? s.titleAr : s.titleEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl surface-card p-10 text-center text-slate-300">
            {t('لا توجد مشاريع مطابقة للتصفية الحالية.', 'No projects match the selected filters.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((proj, idx) => {
              const metrics = lang === 'ar' ? proj.metricsAr || [] : proj.metricsEn || [];
              return (
                <RevealItem key={proj.id} index={idx}>
                  <InteractiveSpotlightCard className="h-full rounded-2xl surface-card card-gold-glow p-6 sm:p-7">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-gold-300">{proj.sector}</span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {lang === 'ar' ? proj.periodAr : proj.periodEn}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white">
                        {lang === 'ar' ? proj.titleAr : proj.titleEn}
                      </h2>
                      <p className="text-xs font-bold text-gold-200">
                        {lang === 'ar' ? proj.clientAr : proj.clientEn}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {lang === 'ar' ? proj.roleAr : proj.roleEn}
                      </p>
                      {metrics.length > 0 && (
                        <ul className="space-y-1.5 pt-2">
                          {metrics.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-200 tabular-nums">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="pt-4 mt-5 border-t border-slate-800">
                      <Link
                        to={`/projects/${proj.slug}`}
                        className="group text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{t('عرض دراسة الحالة الكاملة', 'Read Full Case Study')}</span>
                        <DirArrow className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </Link>
                    </div>
                  </InteractiveSpotlightCard>
                </RevealItem>
              );
            })}
          </div>
        )}

        {/* Impact Dashboard */}
        <ImpactDashboard />
      </div>
    </div>
  );
}
