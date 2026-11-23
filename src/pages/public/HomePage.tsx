import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Crown,
  ExternalLink,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { ImpactDashboard } from '../../components/public/ImpactDashboard';
import { InquiryForm } from '../../components/public/InquiryForm';
import { LeaderCrest } from '../../components/public/LeaderCrest';
import {
  AnimatedCounter,
  InteractiveSpotlightCard,
  RevealItem,
} from '../../components/public/MotionPrimitives';
import { PartnerLogoGrid } from '../../components/public/PartnerLogoGrid';
import { sanitizeExternalUrl } from '../../types/cms';

export function HomePage() {
  const {
    lang,
    t,
    settings,
    pages,
    services,
    projects,
    teamMembers,
    openBookingModal,
  } = useApp();

  useDocumentSeo({ lang, settings });

  const aboutPage = useMemo(() => pages.find((p) => p.slug === 'about'), [pages]);
  const methodologyPage = useMemo(() => pages.find((p) => p.slug === 'methodology'), [pages]);
  const whyHccPage = useMemo(() => pages.find((p) => p.slug === 'why_hcc'), [pages]);

  const [activeArmId, setActiveArmId] = useState<string>('arm-consultancy');
  const [projectSectorFilter, setProjectSectorFilter] = useState<string>('all');

  const coreServices = useMemo(() => services.filter((s) => !s.isVipTrack), [services]);
  const vipServices = useMemo(() => services.filter((s) => s.isVipTrack), [services]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.sector) set.add(p.sector);
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (projectSectorFilter === 'all') return projects;
    return projects.filter((p) => p.sector === projectSectorFilter);
  }, [projects, projectSectorFilter]);

  const reduceMotion = useReducedMotion();
  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  const kpis = [
    {
      num: 15,
      prefix: '+',
      label: t('سنة خبرة قيادية ومؤسسية', 'Years Leadership & Advisory'),
      note: t('تحول مؤسسي وأنظمة ISO 9001', 'Corporate transformation & ISO 9001'),
    },
    {
      num: 53,
      prefix: '+',
      label: t('منشأة صناعية وشركة مقيّمة', 'Industrial Facilities Assessed'),
      note: t('ضمن برامج UNDP وPFI', 'Under UNDP & PFI recovery programs'),
    },
    {
      num: 159,
      prefix: '+',
      label: t('رائد أعمال وكادر تقني', 'Entrepreneurs & Tech Specialists'),
      note: t('عبر حاضنة Concept Hub وElevate', 'Via Concept Hub & Elevate 2025'),
    },
    {
      num: 40,
      prefix: '+',
      label: t('كادر تعهيد عن بُعد في 6 دول', 'Remote BPO Staff Across 6 Countries'),
      note: t('بنسبة جودة تتجاوز 95%', 'Delivering > 95% QA compliance'),
    },
  ];

  const arms = aboutPage?.items || [];
  const selectedArm = arms.find((a) => a.id === activeArmId) || arms[0];

  return (
    <div className="divide-y divide-slate-800/60">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#040B16] pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(circle at 80% 18%, rgba(212,175,55,0.14) 0%, transparent 45%), radial-gradient(circle at 12% 75%, rgba(21,50,90,0.45) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-navy-800/90 border border-gold-400/35 text-xs font-bold text-gold-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{lang === 'ar' ? settings.heroBadgeAr : settings.heroBadgeEn}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.22] tracking-tight">
                {lang === 'ar' ? settings.heroTitleAr : settings.heroTitleEn}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                {lang === 'ar' ? settings.heroDescAr : settings.heroDescEn}
              </p>

              {/* Legal Credentials Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300 tabular-nums">
                <span className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800">
                  UNGM: <strong className="text-gold-300">{settings.ungmNumber}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800">
                  GCCI: <strong className="text-gold-300">#{settings.gcciNumber}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800">
                  {t('ضريبة القيمة المضافة:', 'VAT Status:')}{' '}
                  <strong className="text-emerald-300">{t('معفى (Zero-VAT)', 'Zero-VAT')}</strong>
                </span>
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => openBookingModal('')}
                  className="btn-gold px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('اطلب استشارة', 'Request Consultation')}</span>
                </button>
                <Link
                  to="/projects"
                  className="px-7 py-3.5 rounded-xl text-sm font-bold text-slate-100 bg-navy-800/80 border border-gold-300/30 hover:border-gold-400 hover:text-gold-300 transition-colors inline-flex items-center gap-2"
                >
                  <span>{t('استكشف مشاريعنا', 'Explore Our Projects')}</span>
                  <DirArrow className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Hero Institutional Trust Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl surface-card-elevated p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="bg-white rounded-xl p-2.5 h-16 flex items-center justify-center shrink-0">
                    <img
                      src={settings.logoHeroUrl}
                      alt={settings.brandNameEn}
                      className="h-11 w-auto object-contain"
                    />
                  </div>
                  <div className="text-end">
                    <span className="text-xs font-bold text-gold-300 block">
                      {t('منذ 2019 | تضامن مسجل', 'Est. 2019 | Registered Co.')}
                    </span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      Reg: {settings.regNumber}
                    </span>
                  </div>
                </div>

                {/* Trusted Service Provider Seal */}
                <div className="rounded-xl bg-[#040B16] border border-gold-400/25 p-4 flex items-center gap-4">
                  <img
                    src={settings.trustedBadgeUrl}
                    alt="Trusted Service Provider Seal"
                    className="w-16 h-16 object-contain shrink-0 rounded-lg bg-white/95 p-1"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-gold-300">
                      {t('مزوّد خدمة معتمد (Trusted Provider)', 'Trusted Service Provider')}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t(
                        'معتمد لدى منظومة الأمم المتحدة (UNGM)، شبكة PNGO، الغرفة التجارية، ومقيم لبرنامج UNICEF.',
                        'Verified on UNGM, PNGO Network, Gaza Chamber of Commerce, and UNICEF assessment rosters.'
                      )}
                    </p>
                  </div>
                </div>

                {/* 3 Arms Quick Summary */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                    <div className="text-xs font-extrabold text-gold-300">HCC</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {t('الاستشارات', 'Consulting')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                    <div className="text-xs font-extrabold text-gold-300">Concept Hub</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {t('الحاضنة', 'Incubation')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                    <div className="text-xs font-extrabold text-gold-300">Concept BPO</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {t('التعهيد', 'Remote BPO')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4 Verified KPIs */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <RevealItem key={idx} index={idx}>
                <InteractiveSpotlightCard className="h-full rounded-2xl surface-card p-5 hover:border-gold-400/45 transition-colors">
                  <div className="space-y-2">
                    <div className="text-3xl font-extrabold gold-gradient-text w-fit">
                      <AnimatedCounter target={kpi.num} prefix={kpi.prefix} />
                    </div>
                    <div className="text-sm font-bold text-white">{kpi.label}</div>
                    <div className="text-xs text-slate-400">{kpi.note}</div>
                  </div>
                </InteractiveSpotlightCard>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ABOUT HCC & 3 OPERATIONAL ARMS & METHODOLOGY */}
      <section className="py-20 bg-[#071426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-extrabold tracking-wider uppercase text-gold-300">
                {t('من نحن • الهوية المؤسسية', 'ABOUT HCC • CORPORATE IDENTITY')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lang === 'ar'
                  ? aboutPage?.titleAr || 'من نحن | منظومة الأذرع الثلاثة'
                  : aboutPage?.titleEn || 'About Us | 3 Operational Arms'}
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {lang === 'ar' ? aboutPage?.bodyAr : aboutPage?.bodyEn}
              </p>

              {/* Vision & Mission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl bg-[#040B16]/90 border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-gold-300 text-xs font-extrabold">
                    <Compass className="w-4 h-4" />
                    <span>{t('الرؤية المؤسسية', 'Our Vision')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {lang === 'ar' ? aboutPage?.visionAr : aboutPage?.visionEn}
                  </p>
                </div>
                <div className="rounded-xl bg-[#040B16]/90 border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-gold-300 text-xs font-extrabold">
                    <Target className="w-4 h-4" />
                    <span>{t('الرسالة التشغيلية', 'Our Mission')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {lang === 'ar' ? aboutPage?.missionAr : aboutPage?.missionEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive 3 Operational Arms */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">
                  {t('الأذرع التشغيلية المتكاملة (3 Arms)', 'Integrated Operational Arms')}
                </h3>
                <Link
                  to="/about"
                  className="text-xs font-bold text-gold-300 hover:underline inline-flex items-center gap-1"
                >
                  <span>{t('الملف المؤسسي الكامل', 'Full Profile')}</span>
                  <DirArrow className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {arms.map((arm) => {
                  const isActive = selectedArm?.id === arm.id;
                  return (
                    <div
                      key={arm.id}
                      className={`rounded-2xl border transition-colors ${
                        isActive
                          ? 'bg-navy-800/90 border-gold-400/55 shadow-lg'
                          : 'bg-navy-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveArmId(arm.id)}
                        className="w-full text-start p-5 flex items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gold-300 tabular-nums">
                              {arm.code}
                            </span>
                            <span className="text-base font-extrabold text-white">
                              {lang === 'ar' ? arm.titleAr : arm.titleEn}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {lang === 'ar' ? arm.descAr : arm.descEn}
                          </p>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isActive && (arm.detailsAr || arm.detailsEn) && (
                          <motion.div
                            key={`${arm.id}-details`}
                            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 space-y-3">
                              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                {lang === 'ar' ? arm.detailsAr : arm.detailsEn}
                              </p>
                              {arm.relatedServiceSlug && (
                                <Link
                                  to={`/services/${arm.relatedServiceSlug}`}
                                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:underline"
                                >
                                  <span>{t('استعراض الخدمات ضمن هذا الذراع', 'Explore Arm Services')}</span>
                                  <DirArrow className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4-Stage Methodology Timeline */}
          {methodologyPage?.items && methodologyPage.items.length > 0 && (
            <div className="pt-10 border-t border-slate-800/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-gold-300 uppercase">
                    {t('منهجية التنفيذ', 'EXECUTION METHODOLOGY')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    {lang === 'ar' ? methodologyPage.titleAr : methodologyPage.titleEn}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {methodologyPage.items.map((step, idx) => (
                  <RevealItem key={step.id} index={idx}>
                    <InteractiveSpotlightCard className="h-full rounded-2xl bg-[#040B16]/90 border border-slate-800 p-5 hover:border-gold-400/40 transition-colors">
                      <div className="space-y-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gold-400/15 border border-gold-400/35 flex items-center justify-center text-xs font-mono font-extrabold text-gold-300 tabular-nums">
                          {step.code}
                        </div>
                        <h4 className="text-base font-extrabold text-white">
                          {lang === 'ar' ? step.titleAr : step.titleEn}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {lang === 'ar' ? step.descAr : step.descEn}
                        </p>
                      </div>
                    </InteractiveSpotlightCard>
                  </RevealItem>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY HCC */}
      <section id="why-hcc" className="py-20 bg-[#040B16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-extrabold tracking-wider uppercase text-gold-300">
              {t('ما يميزنا • القيمة التنافسية', 'WHY HCC • COMPETITIVE ADVANTAGE')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'ar'
                ? whyHccPage?.titleAr || 'لماذا يختارنا الشركاء الدوليون والقطاع الخاص؟'
                : whyHccPage?.titleEn || 'Why International Donors & Enterprises Choose HCC'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              {lang === 'ar' ? whyHccPage?.subtitleAr : whyHccPage?.subtitleEn}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(whyHccPage?.items || []).map((item, idx) => (
              <RevealItem key={item.id} index={idx}>
                <InteractiveSpotlightCard className="h-full rounded-2xl surface-card p-6 hover:border-gold-400/45 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-gold-300 tabular-nums">
                        {item.code}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-gold-400" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      {lang === 'ar' ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {lang === 'ar' ? item.descAr : item.descEn}
                    </p>
                  </div>
                </InteractiveSpotlightCard>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICES ECOSYSTEM + VIP TRACK */}
      <section className="py-20 bg-[#071426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase text-gold-300">
                {t('منظومة الخدمات المتكاملة', 'SERVICES ECOSYSTEM')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t(
                  'أربعة محاور تشغيلية متخصصة ومسار تنفيذي للنخبة والهيئات',
                  'Four Core Operational Pillars & Executive Institutional Track'
                )}
              </h2>
            </div>
            <Link
              to="/services"
              className="text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5 shrink-0"
            >
              <span>{t('عرض دليل الخدمات التفصيلي', 'View All Services')}</span>
              <DirArrow className="w-4 h-4" />
            </Link>
          </div>

          {/* Core 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreServices.map((svc, idx) => {
              const solutions = lang === 'ar' ? svc.solutionsAr || [] : svc.solutionsEn || [];
              return (
                <RevealItem key={svc.id} index={idx}>
                  <InteractiveSpotlightCard className="h-full rounded-2xl surface-card card-gold-glow p-6 sm:p-7 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-gold-300">
                          {svc.tag}
                        </span>
                        <Layers className="w-4 h-4 text-gold-400" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white">
                        {lang === 'ar' ? svc.titleAr : svc.titleEn}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {lang === 'ar' ? svc.summaryAr : svc.summaryEn}
                      </p>
                      {solutions.length > 0 && (
                        <ul className="space-y-2 pt-2">
                          {solutions.slice(0, 3).map((sol, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                              <span>{sol}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <Link
                        to={`/services/${svc.slug}`}
                        className="group text-xs sm:text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{t('التفاصيل والمخرجات', 'Scope & Deliverables')}</span>
                        <DirArrow className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openBookingModal(lang === 'ar' ? svc.titleAr : svc.titleEn)}
                        className="px-4 py-2 rounded-lg bg-navy-900 border border-gold-400/35 text-xs font-bold text-white hover:border-gold-400 hover:text-gold-300 transition-colors cursor-pointer"
                      >
                        {t('اطلب الخدمة', 'Request Service')}
                      </button>
                    </div>
                  </InteractiveSpotlightCard>
                </RevealItem>
              );
            })}
          </div>

          {/* VIP Track */}
          {vipServices.map((vip) => {
            const solutions = lang === 'ar' ? vip.solutionsAr || [] : vip.solutionsEn || [];
            return (
              <RevealItem key={vip.id} index={1}>
                <InteractiveSpotlightCard
                  isVip
                  className="rounded-2xl vip-track-surface p-7 sm:p-9 shadow-2xl space-y-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      <div className="inline-flex items-center gap-2 text-xs font-extrabold text-gold-300">
                        <Crown className="w-4 h-4" />
                        <span>{vip.tag}</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white">
                        {lang === 'ar' ? vip.titleAr : vip.titleEn}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                        {lang === 'ar' ? vip.summaryAr : vip.summaryEn}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                      <Link
                        to={`/services/${vip.slug}`}
                        className="group px-5 py-3 rounded-xl border border-gold-400/45 text-xs sm:text-sm font-bold text-gold-300 hover:bg-navy-800 transition-colors inline-flex items-center gap-2"
                      >
                        <span>{t('تفاصيل المسار الخاص', 'View Advisory Track')}</span>
                        <DirArrow className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openBookingModal(lang === 'ar' ? vip.titleAr : vip.titleEn)}
                        className="btn-gold px-6 py-3 rounded-xl text-xs sm:text-sm cursor-pointer"
                      >
                        {t('حجز إحاطة تنفيذية سرية', 'Request Executive Briefing')}
                      </button>
                    </div>
                  </div>

                  {solutions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 mt-6 border-t border-gold-400/20">
                      {solutions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 bg-[#040B16]/60 rounded-xl p-3.5 border border-slate-800"
                        >
                          <Sparkles className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </InteractiveSpotlightCard>
              </RevealItem>
            );
          })}
        </div>
      </section>

      {/* 5. PROJECTS PORTFOLIO + RECHARTS IMPACT DASHBOARD */}
      <section className="py-20 bg-[#040B16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase text-gold-300">
                {t('سجل العقود والأثر الميداني', 'PORTFOLIO & IMPACT RECORD')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t('عقود منفذة ومؤشرات أثر قابلة للتحقق', 'Executed Mandates & Verifiable Field Impact')}
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('تصفح سجل المشاريع الكامل', 'Browse Full Portfolio')}</span>
              <DirArrow className="w-4 h-4" />
            </Link>
          </div>

          {/* Sector Filters with Sliding layoutId */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setProjectSectorFilter('all')}
              className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                projectSectorFilter === 'all'
                  ? 'text-[#040B16]'
                  : 'bg-navy-900 text-slate-300 border border-slate-800 hover:border-gold-400/40'
              }`}
            >
              {projectSectorFilter === 'all' && (
                <motion.span
                  layoutId="homeProjectSectorPill"
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                />
              )}
              <span className="relative z-10">{t('كافة القطاعات', 'All Sectors')}</span>
            </button>
            {sectors.map((sec) => {
              const active = projectSectorFilter === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setProjectSectorFilter(sec)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'text-[#040B16]'
                      : 'bg-navy-900 text-slate-300 border border-slate-800 hover:border-gold-400/40'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="homeProjectSectorPill"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                    />
                  )}
                  <span className="relative z-10">{sec}</span>
                </button>
              );
            })}
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj, idx) => {
              const metrics = lang === 'ar' ? proj.metricsAr || [] : proj.metricsEn || [];
              return (
                <RevealItem key={proj.id} index={idx}>
                  <InteractiveSpotlightCard className="h-full rounded-2xl surface-card card-gold-glow p-6 sm:p-7">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-bold text-gold-300">
                          {proj.sector}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {lang === 'ar' ? proj.periodAr : proj.periodEn}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                        {lang === 'ar' ? proj.titleAr : proj.titleEn}
                      </h3>

                      <p className="text-xs font-bold text-slate-300">
                        {t('الجهة:', 'Client:')}{' '}
                        <span className="text-gold-200">
                          {lang === 'ar' ? proj.clientAr : proj.clientEn}
                        </span>
                      </p>

                      {(proj.roleAr || proj.roleEn) && (
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                          {lang === 'ar' ? proj.roleAr : proj.roleEn}
                        </p>
                      )}

                      {metrics.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {metrics.slice(0, 4).map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="rounded-lg bg-[#040B16] border border-slate-800 px-3 py-2 text-xs text-slate-200 font-semibold tabular-nums"
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/projects/${proj.slug}`}
                        className="group text-xs sm:text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{t('دراسة الحالة والنتائج', 'Full Case Study')}</span>
                        <DirArrow className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </Link>
                      {proj.isFlagship && (
                        <span className="text-[11px] font-bold text-emerald-300">
                          {t('عقد رئيسي موثق', 'Flagship Mandate')}
                        </span>
                      )}
                    </div>
                  </InteractiveSpotlightCard>
                </RevealItem>
              );
            })}
          </div>

          {/* Interactive Recharts Dashboard */}
          <ImpactDashboard />
        </div>
      </section>

      {/* 6. PARTNERS & OFFICIAL ACCREDITATIONS */}
      <section className="py-20 bg-[#071426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase text-gold-300">
                {t('الاعتمادات الدولية والشركاء', 'ACCREDITATIONS & ECOSYSTEM')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t(
                  'سجل الموثوقية مع الوكالات الدولية وشبكة التحالفات',
                  'Verified Accreditations, UN Rosters & Partner Network'
                )}
              </h2>
            </div>
            <Link
              to="/partners"
              className="text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('عرض صفحة الشركاء الكاملة', 'View Full Partners Directory')}</span>
              <DirArrow className="w-4 h-4" />
            </Link>
          </div>

          <PartnerLogoGrid compact />
        </div>
      </section>

      {/* 7. LEADERSHIP & ZERO-VAT GOVERNANCE */}
      <section className="py-20 bg-[#040B16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase text-gold-300">
                {t('القيادة التنفيذية والحوكمة', 'EXECUTIVE LEADERSHIP & GOVERNANCE')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t('مجلس الشركاء والقيادات الفنية المتخصصة', 'Managing Partners & Technical Leads')}
              </h2>
            </div>
            <Link
              to="/leadership"
              className="text-sm font-bold text-gold-300 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('السير الذاتية والحوكمة', 'Leadership & Governance')}</span>
              <DirArrow className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => {
              const expertise = lang === 'ar' ? member.expertiseAr || [] : member.expertiseEn || [];
              const safeLinkedin = sanitizeExternalUrl(member.linkedinUrl);
              return (
                <RevealItem key={member.id} index={idx}>
                  <InteractiveSpotlightCard
                    className={`h-full rounded-2xl p-6 ${
                      member.isPrimaryLeader ? 'surface-card-elevated' : 'surface-card'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <LeaderCrest
                          nameAr={member.nameAr}
                          nameEn={member.nameEn}
                          photoUrl={member.photoUrl}
                          isPrimary={member.isPrimaryLeader}
                        />
                        <div className="space-y-1">
                          {member.badgeCode && (
                            <span className="text-[11px] font-mono font-bold text-gold-300 block">
                              {member.badgeCode}
                            </span>
                          )}
                          <h3 className="text-base font-extrabold text-white leading-snug">
                            {lang === 'ar' ? member.nameAr : member.nameEn}
                          </h3>
                          <p className="text-xs font-semibold text-gold-200">
                            {lang === 'ar' ? member.roleAr : member.roleEn}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {lang === 'ar' ? member.bioAr : member.bioEn}
                      </p>

                      {expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {expertise.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-md bg-[#040B16] border border-slate-800 text-[11px] text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {safeLinkedin && (
                      <div className="pt-3 mt-5 border-t border-slate-800">
                        <a
                          href={safeLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:underline"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </InteractiveSpotlightCard>
                </RevealItem>
              );
            })}

            {/* Governance & Zero-VAT Card */}
            <RevealItem index={teamMembers.length}>
              <InteractiveSpotlightCard className="h-full rounded-2xl bg-gradient-to-br from-[#0D213D] to-[#071426] border border-gold-400/40 p-6">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-gold-400/15 border border-gold-400/35 flex items-center justify-center text-gold-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {t('الحوكمة القانونية وميزة الإعفاء الضريبي', 'Corporate Governance & Zero-VAT Advantage')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {t(
                      'كيان تضامني مرخص ومسجل رسمياً (563499664)، يتمتع بحالة إعفاء ضريبي (Zero-VAT) على العقود التنموية والدولية؛ مما يوفر على الجهات المانحة 16% مباشرة من ميزانيات المشاريع مع التزام كامل بسياسات النزاهة AAP وPSEA.',
                      'Licensed general partnership (Reg: 563499664) operating with Zero-VAT status for international & humanitarian mandates—saving donor programs 16% directly while maintaining full AAP & PSEA compliance.'
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 tabular-nums pt-3 mt-4 border-t border-slate-800">
                  <div>UNGM: {settings.ungmNumber}</div>
                  <div>GCCI: #{settings.gcciNumber}</div>
                  <div>Reg: {settings.regNumber}</div>
                  <div>Comm: {settings.commercialNumber}</div>
                </div>
              </InteractiveSpotlightCard>
            </RevealItem>
          </div>
        </div>
      </section>

      {/* 8. CONTACT & CONSULTATION */}
      <section id="contact" className="py-20 bg-[#071426]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-extrabold uppercase text-gold-300">
                {t('تواصل معنا', 'CONTACT & CONSULTATIONS')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t('ابدأ مسار التحول أو اطلب عرضاً فنياً ومالياً', 'Initiate Your Engagement or Request an RFP')}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t(
                  'نرحب باستفسارات الشركات الخاصة، المؤسسات الدولية، وبرامج التعافي الاقتصادي وتعهيد الفرق السحابية.',
                  'We welcome inquiries from private enterprises, international agencies, economic recovery programs, and organizations seeking remote BPO teams.'
                )}
              </p>

              <div className="space-y-4 pt-2">
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-[#040B16] border border-slate-800 hover:border-gold-400/45 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gold-300 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">{t('البريد الإلكتروني الرسمي', 'Official Email')}</div>
                    <div className="text-sm font-bold text-white ltr-inline">{settings.email}</div>
                  </div>
                </a>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-[#040B16] border border-slate-800 hover:border-gold-400/45 transition-colors"
                >
                  <Phone className="w-5 h-5 text-gold-300 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">{t('الهاتف المباشر / واتساب', 'Direct Phone / WhatsApp')}</div>
                    <div className="text-sm font-bold text-white ltr-inline tabular-nums">{settings.phone}</div>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#040B16] border border-slate-800">
                  <MapPin className="w-5 h-5 text-gold-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400">{t('المقر الرئيسي والتغطية', 'Headquarters & Reach')}</div>
                    <div className="text-sm font-semibold text-white">
                      {lang === 'ar' ? settings.addressAr : settings.addressEn}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openBookingModal('')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gold-400/45 text-gold-300 text-sm font-bold hover:bg-navy-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('أو اختر موعداً فورياً للقاء المستشار', 'Or Select a Consultation Time Slot')}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
