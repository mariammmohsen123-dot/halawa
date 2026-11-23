import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { BarChart3, CheckCircle2, FileText, Filter, LineChart as LineIcon, AreaChart as AreaIcon, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { ProjectMetricSet } from '../../types/cms';

type ChartKind = 'bar' | 'area' | 'line';

export function ImpactDashboard() {
  const { lang, t, projectMetrics } = useApp();
  const reduceMotion = useReducedMotion();
  const { ref: dashboardRef, hasIntersected: isDashboardVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.16,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true,
  });
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string>('industrial');
  const [chartOverride, setChartOverride] = useState<ChartKind | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const uniquePeriods = useMemo(() => {
    const set = new Set<string>();
    projectMetrics.forEach((m) => {
      if (m.periodTag) set.add(m.periodTag);
    });
    return Array.from(set);
  }, [projectMetrics]);

  const filteredMetrics = useMemo(() => {
    if (periodFilter === 'all') return projectMetrics;
    return projectMetrics.filter((m) => m.periodTag === periodFilter);
  }, [projectMetrics, periodFilter]);

  const activeMetric: ProjectMetricSet | undefined = useMemo(() => {
    return (
      filteredMetrics.find((m) => m.key === selectedKey) ||
      filteredMetrics[0] ||
      projectMetrics[0]
    );
  }, [filteredMetrics, projectMetrics, selectedKey]);

  useEffect(() => {
    setChartOverride(null);
    setActiveIndex(null);
  }, [activeMetric?.key, periodFilter]);

  const chartData = useMemo(() => {
    const pts = activeMetric?.dataPoints || [];
    const total = pts.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
    const maxVal = Math.max(...pts.map((p) => Number(p.value) || 0), 1);
    return pts.map((pt, idx) => ({
      idx,
      label: lang === 'ar' ? pt.labelAr : pt.labelEn,
      value: pt.value,
      unit: pt.unit || '',
      sharePct: total > 0 ? Math.round((pt.value / total) * 100) : 0,
      relPct: Math.max(8, Math.round((pt.value / maxVal) * 100)),
    }));
  }, [activeMetric, lang]);

  if (!activeMetric) return null;

  const activeChartType: ChartKind = chartOverride || activeMetric.chartType || 'bar';

  const focusedPoint =
    activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;
  const bullets = lang === 'ar' ? activeMetric.bulletsAr || [] : activeMetric.bulletsEn || [];

  const chartKindOptions: { key: ChartKind; label: string; icon: React.ElementType }[] = [
    { key: 'bar', label: t('أعمدة', 'Bar'), icon: BarChart3 },
    { key: 'area', label: t('مساحي', 'Area'), icon: AreaIcon },
    { key: 'line', label: t('خطي', 'Line'), icon: LineIcon },
  ];

  return (
    <motion.div
      ref={dashboardRef}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={isDashboardVisible || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl surface-card-elevated p-6 sm:p-8 shadow-2xl"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold-400/15 border border-gold-400/35 flex items-center justify-center text-gold-300 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              {t('لوحة مؤشرات الأثر والبيانات الميدانية', 'Verified Field Impact & Performance Metrics')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {t(
                'بيانات كمية تفاعلية مستخرجة مباشرة من سجلات عقود HCC الموثقة مع المنظمات الدولية وقطاع الأعمال',
                'Interactive quantitative metrics backed directly by verified HCC contract records'
              )}
            </p>
          </div>
        </div>

        {/* Chart Type Switcher + Period Filter */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#040B16] border border-slate-800">
            {chartKindOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = activeChartType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setChartOverride(opt.key)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected ? 'text-[#040B16]' : 'text-slate-300 hover:text-gold-300'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="impactChartTypePill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {uniquePeriods.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-300" />
              <select
                aria-label={t('تصفية حسب الفترة', 'Filter by period')}
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs font-semibold text-slate-200 focus:border-gold-400 focus:outline-none"
              >
                <option value="all">{t('كافة الفترات الزمنية', 'All Timeframes')}</option>
                {uniquePeriods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Switcher Tabs with Sliding layoutId */}
      <div className="flex flex-wrap gap-2 py-5">
        {filteredMetrics.map((metric) => {
          const isActive = metric.key === activeMetric.key;
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => setSelectedKey(metric.key)}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'text-[#040B16]'
                  : 'bg-[#040B16] text-slate-300 border border-slate-700 hover:border-gold-400/50 hover:text-gold-300'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="impactDatasetPill"
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37] shadow-md"
                />
              )}
              <span className="relative z-10">
                {lang === 'ar' ? metric.tabLabelAr : metric.tabLabelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Grid: Chart + Interactive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Recharts Panel */}
        <div className="lg:col-span-7 rounded-xl bg-[#040B16]/90 border border-slate-800 p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-gold-300">
              {lang === 'ar'
                ? activeMetric.datasetLabelAr || activeMetric.tabLabelAr
                : activeMetric.datasetLabelEn || activeMetric.tabLabelEn}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {t('مرر أو انقر على الرسم للتحليل', 'Hover or click chart to inspect')}
              </span>
              {activeMetric.periodTag && (
                <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-navy-900 border border-slate-800 tabular-nums">
                  {activeMetric.periodTag}
                </span>
              )}
            </div>
          </div>

          <div dir="ltr" className="w-full h-72">
            {(isDashboardVisible || reduceMotion) && (
              <ResponsiveContainer width="100%" height="100%">
                {activeChartType === 'area' ? (
                  <AreaChart
                    key={`${activeMetric.key}-area-${periodFilter}`}
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
                    onMouseMove={(state) => {
                      if (typeof state?.activeTooltipIndex === 'number') {
                        setActiveIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <defs>
                      <linearGradient id="hccGoldFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8CC7D" stopOpacity={0.55} />
                        <stop offset="55%" stopColor="#D4AF37" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(212, 175, 55, 0.35)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      content={
                        <CustomMetricTooltip
                          lang={lang}
                          t={t}
                          datasetTitle={
                            lang === 'ar'
                              ? activeMetric.datasetLabelAr || activeMetric.tabLabelAr
                              : activeMetric.datasetLabelEn || activeMetric.tabLabelEn
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#E8CC7D"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#hccGoldFill)"
                      isAnimationActive={!reduceMotion}
                      animationBegin={60}
                      animationDuration={850}
                      animationEasing="ease-out"
                      activeDot={{ r: 6, fill: '#F5E7C1', stroke: '#D4AF37', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : activeChartType === 'line' ? (
                  <LineChart
                    key={`${activeMetric.key}-line-${periodFilter}`}
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
                    onMouseMove={(state) => {
                      if (typeof state?.activeTooltipIndex === 'number') {
                        setActiveIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(212, 175, 55, 0.35)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      content={
                        <CustomMetricTooltip
                          lang={lang}
                          t={t}
                          datasetTitle={
                            lang === 'ar'
                              ? activeMetric.datasetLabelAr || activeMetric.tabLabelAr
                              : activeMetric.datasetLabelEn || activeMetric.tabLabelEn
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#D4AF37"
                      strokeWidth={3}
                      isAnimationActive={!reduceMotion}
                      animationBegin={60}
                      animationDuration={850}
                      animationEasing="ease-out"
                      dot={{ r: 4.5, fill: '#E8CC7D', strokeWidth: 2, stroke: '#040B16' }}
                      activeDot={{ r: 7, fill: '#F5E7C1', stroke: '#D4AF37', strokeWidth: 2.5 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    key={`${activeMetric.key}-bar-${periodFilter}`}
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
                    onMouseMove={(state) => {
                      if (typeof state?.activeTooltipIndex === 'number') {
                        setActiveIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <defs>
                      <linearGradient id="hccBarGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8CC7D" />
                        <stop offset="100%" stopColor="#B8901F" />
                      </linearGradient>
                      <linearGradient id="hccBarGoldActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F5E7C1" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(212, 175, 55, 0.08)', radius: 8 }}
                      content={
                        <CustomMetricTooltip
                          lang={lang}
                          t={t}
                          datasetTitle={
                            lang === 'ar'
                              ? activeMetric.datasetLabelAr || activeMetric.tabLabelAr
                              : activeMetric.datasetLabelEn || activeMetric.tabLabelEn
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={54}
                      isAnimationActive={!reduceMotion}
                      animationBegin={60}
                      animationDuration={850}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, idx) => {
                        const dimmed = activeIndex !== null && activeIndex !== idx;
                        const highlighted = activeIndex === idx;
                        return (
                          <Cell
                            key={`cell-${entry.label}-${idx}`}
                            fill={
                              highlighted
                                ? 'url(#hccBarGoldActive)'
                                : dimmed
                                ? 'rgba(212, 175, 55, 0.32)'
                                : 'url(#hccBarGold)'
                            }
                            onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                            style={{ cursor: 'pointer', transition: 'fill 200ms ease, opacity 200ms ease' }}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary, Focused Point Inspector & Animated Progress Bars */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMetric.key}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="lg:col-span-5 rounded-xl bg-navy-900/90 border border-slate-800 p-5 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-white mb-1">
                  {lang === 'ar' ? activeMetric.summaryTitleAr : activeMetric.summaryTitleEn}
                </h4>
                {(activeMetric.summaryKpiAr || activeMetric.summaryKpiEn) && (
                  <p className="text-lg font-extrabold gold-gradient-text tabular-nums">
                    {lang === 'ar' ? activeMetric.summaryKpiAr : activeMetric.summaryKpiEn}
                  </p>
                )}
              </div>

              {/* Active Hovered/Clicked Bar Inspector */}
              {focusedPoint && (
                <div className="rounded-xl bg-[#040B16] border border-gold-400/45 p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-gold-300 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {focusedPoint.label}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-extrabold text-gold-300 tabular-nums shrink-0">
                    {focusedPoint.value} {focusedPoint.unit} ({focusedPoint.sharePct}%)
                  </div>
                </div>
              )}

              {/* Animated Comparative Metric Bars */}
              <div className="space-y-2.5 pt-1">
                {chartData.map((pt, idx) => {
                  const isFocused = activeIndex === idx;
                  return (
                    <div
                      key={`${pt.label}-${idx}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      className={`space-y-1 rounded-lg p-1.5 -mx-1.5 transition-colors cursor-pointer ${
                        isFocused ? 'bg-navy-800/80' : 'hover:bg-navy-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-semibold truncate">{pt.label}</span>
                        <span className="font-mono font-bold text-gold-300 tabular-nums shrink-0">
                          {pt.value} {pt.unit}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#040B16] overflow-hidden">
                        <motion.div
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={{ width: `${pt.relPct}%` }}
                          transition={{
                            duration: 0.65,
                            delay: idx * 0.07,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={`h-full rounded-full ${
                            isFocused ? 'bg-gold-300' : 'bg-gold-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                {bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(activeMetric.sourceNoteAr || activeMetric.sourceNoteEn) && (
              <div className="pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
                <FileText className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar' ? activeMetric.sourceNoteAr : activeMetric.sourceNoteEn}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload?: { label: string; value: number; unit: string; sharePct: number } }[];
  lang: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  datasetTitle?: string;
}

function CustomMetricTooltip({ active, payload, lang, t, datasetTitle }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]?.payload) return null;
  const pt = payload[0].payload;
  const formattedValue =
    typeof pt.value === 'number' ? pt.value.toLocaleString('en-US') : pt.value;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-w-[190px] max-w-[260px] rounded-xl bg-[#040B16]/95 backdrop-blur-md border border-gold-400/55 shadow-[0_12px_32px_rgba(0,0,0,0.65)] overflow-hidden"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-[#E8CC7D] via-[#D4AF37] to-transparent" />
      <div className="px-3.5 py-3 space-y-2">
        {datasetTitle && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gold-300/80 truncate">
            {datasetTitle}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.8)] shrink-0" />
          <span className="text-xs font-bold text-white leading-snug">{pt.label}</span>
        </div>

        <div className="flex items-baseline justify-between gap-3 pt-1.5 border-t border-slate-800/90">
          <div className="text-base font-mono font-extrabold text-gold-300 tabular-nums">
            {formattedValue}{' '}
            {pt.unit && <span className="text-[11px] font-sans font-semibold text-slate-300">{pt.unit}</span>}
          </div>
          <span className="px-2 py-0.5 rounded-md bg-gold-400/15 border border-gold-400/35 text-[11px] font-mono font-bold text-gold-200 tabular-nums shrink-0">
            {pt.sharePct}%
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          {t('الحصة من إجمالي بيانات هذا المؤشر', 'Share of total dataset')}
        </div>
      </div>
    </div>
  );
}
