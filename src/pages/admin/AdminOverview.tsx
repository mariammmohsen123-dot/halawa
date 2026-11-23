import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  Briefcase,
  Calendar,
  Database,
  Layers,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { seedBaselineDatabase } from '../../lib/seedFirestore';
import { ActivityLog, Appointment, Inquiry } from '../../types/cms';

export function AdminOverview() {
  const { lang, t, services, projects, hasFirestoreSeeded, isAdmin } = useApp();
  const reduceMotion = useReducedMotion();
  const { ref: chartCardRef, hasIntersected: isChartVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.15,
    triggerOnce: true,
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedFeedback, setSeedFeedback] = useState('');
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  useEffect(() => {
    const u1 = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries')
    );

    const u2 = onSnapshot(
      query(collection(db, 'appointments'), orderBy('createdAt', 'desc')),
      (snap) => {
        setAppointments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
    );

    const u3 = onSnapshot(
      query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'), limit(10)),
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'activity_logs')
    );

    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const newInquiriesCount = useMemo(
    () => inquiries.filter((i) => i.status === 'new').length,
    [inquiries]
  );
  const pendingBookingsCount = useMemo(
    () => appointments.filter((a) => a.status === 'pending').length,
    [appointments]
  );

  const serviceDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    inquiries.forEach((inq) => {
      const key = inq.serviceInterest || 'General';
      const shortKey = key.length > 26 ? key.slice(0, 24) + '…' : key;
      counts.set(shortKey, (counts.get(shortKey) || 0) + 1);
    });
    if (counts.size === 0) {
      return [{ name: t('لا توجد طلبات بعد', 'No Inquiries Yet'), count: 0 }];
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [inquiries, lang]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedFeedback('');
    try {
      const res = await seedBaselineDatabase(true);
      setSeedFeedback(
        t(
          `تمت مزامنة ${res.count} سجل مؤسسي في قاعدة البيانات بنجاح.`,
          `Synchronized ${res.count} official corporate records to Firestore.`
        )
      );
    } catch (err) {
      setSeedFeedback(err instanceof Error ? err.message : 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('ملخص الأداء التنفيذي', 'Executive Admin Overview')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'مراقبة فورية لطلبات الاستشارة، حجوزات المواعيد، وحالة المحتوى المؤسسي',
              'Real-time monitoring of client inquiries, consultation bookings, and CMS content'
            )}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-navy-800 border border-gold-400/40 text-xs font-bold text-gold-300 hover:bg-navy-700 inline-flex items-center gap-2 cursor-pointer self-start"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>
              {hasFirestoreSeeded
                ? t('إعادة مزامنة البيانات التأسيسية', 'Resync Baseline Data')
                : t('تهيئة قاعدة البيانات الآن', 'Seed Database Now')}
            </span>
          </button>
        )}
      </div>

      {seedFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200 flex items-center gap-2">
          <Database className="w-4 h-4 shrink-0" />
          <span>{seedFeedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/inquiries"
          className="rounded-2xl surface-card p-5 hover:border-gold-400/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('طلبات الاستشارة', 'Client Inquiries')}</span>
            <MessageSquare className="w-4 h-4 text-gold-300" />
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{inquiries.length}</div>
          <div className="text-xs font-bold text-emerald-300 mt-1 tabular-nums">
            {newInquiriesCount} {t('طلب جديد بانتظار المراجعة', 'new pending review')}
          </div>
        </Link>

        <Link
          to="/admin/appointments"
          className="rounded-2xl surface-card p-5 hover:border-gold-400/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('حجوزات المواعيد', 'Consultations')}</span>
            <Calendar className="w-4 h-4 text-gold-300" />
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{appointments.length}</div>
          <div className="text-xs font-bold text-amber-300 mt-1 tabular-nums">
            {pendingBookingsCount} {t('حجز قيد التأكيد', 'pending confirmation')}
          </div>
        </Link>

        <Link
          to="/admin/projects"
          className="rounded-2xl surface-card p-5 hover:border-gold-400/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('المشاريع والعقود', 'Published Projects')}</span>
            <Briefcase className="w-4 h-4 text-gold-300" />
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">
            {projects.filter((p) => p.status === 'published').length}
          </div>
          <div className="text-xs text-slate-400 mt-1 tabular-nums">
            {t('من أصل', 'out of')} {projects.length}
          </div>
        </Link>

        <Link
          to="/admin/services"
          className="rounded-2xl surface-card p-5 hover:border-gold-400/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('محاور الخدمات النشطة', 'Active Services')}</span>
            <Layers className="w-4 h-4 text-gold-300" />
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">
            {services.filter((s) => s.status === 'published').length}
          </div>
          <div className="text-xs text-slate-400 mt-1 tabular-nums">
            {t('شاملة جناح النخبة VIP', 'Includes VIP Track')}
          </div>
        </Link>
      </div>

      {/* Chart + Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          ref={chartCardRef}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={isChartVisible || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 rounded-2xl surface-card p-6 space-y-4"
        >
          <h2 className="text-base font-extrabold text-white">
            {t('توزيع الطلبات حسب المسار الاستشاري', 'Inquiries Distribution by Service')}
          </h2>
          <div dir="ltr" className="w-full h-64">
            {(isChartVisible || reduceMotion) && (
              <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceDistribution}
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                onMouseMove={(state) => {
                  if (typeof state?.activeTooltipIndex === 'number') {
                    setActiveBarIndex(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                <defs>
                  <linearGradient id="adminBarGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8CC7D" />
                    <stop offset="100%" stopColor="#B8901F" />
                  </linearGradient>
                  <linearGradient id="adminBarGoldActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5E7C1" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(212, 175, 55, 0.08)', radius: 8 }}
                  content={<AdminChartTooltip lang={lang} t={t} total={inquiries.length} />}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive={!reduceMotion}
                  animationBegin={60}
                  animationDuration={850}
                  animationEasing="ease-out"
                >
                  {serviceDistribution.map((entry, idx) => {
                    const dimmed = activeBarIndex !== null && activeBarIndex !== idx;
                    const highlighted = activeBarIndex === idx;
                    return (
                      <Cell
                        key={`admin-cell-${entry.name}-${idx}`}
                        fill={
                          highlighted
                            ? 'url(#adminBarGoldActive)'
                            : dimmed
                            ? 'rgba(212, 175, 55, 0.32)'
                            : 'url(#adminBarGold)'
                        }
                        style={{ transition: 'fill 200ms ease' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <div className="lg:col-span-5 rounded-2xl surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold-300" />
              <span>{t('آخر العمليات الإدارية', 'Recent Audit Logs')}</span>
            </h2>
            {isAdmin && (
              <Link to="/admin/users" className="text-xs font-bold text-gold-300 hover:underline">
                {t('السجل الكامل', 'View All')}
              </Link>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-400">
              {t('لا توجد عمليات مسجلة بعد.', 'No activity logs recorded yet.')}
            </p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="p-3 rounded-xl bg-[#040B16] border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-gold-300">
                    <span>{log.action}</span>
                    <span className="text-slate-400 truncate max-w-[160px]">{log.actorEmail}</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    {lang === 'ar' ? log.summaryAr : log.summaryEn}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminTooltipProps {
  active?: boolean;
  payload?: { payload?: { name: string; count: number } }[];
  lang: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  total: number;
}

function AdminChartTooltip({ active, payload, lang, t, total }: AdminTooltipProps) {
  if (!active || !payload || !payload[0]?.payload) return null;
  const pt = payload[0].payload;
  const share = total > 0 ? Math.round((pt.count / total) * 100) : 0;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-w-[180px] max-w-[250px] rounded-xl bg-[#040B16]/95 backdrop-blur-md border border-gold-400/55 shadow-[0_12px_32px_rgba(0,0,0,0.65)] overflow-hidden"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-[#E8CC7D] via-[#D4AF37] to-transparent" />
      <div className="px-3.5 py-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.8)] shrink-0" />
          <span className="text-xs font-bold text-white leading-snug">{pt.name}</span>
        </div>

        <div className="flex items-baseline justify-between gap-3 pt-1.5 border-t border-slate-800/90">
          <div className="text-base font-mono font-extrabold text-gold-300 tabular-nums">
            {pt.count}{' '}
            <span className="text-[11px] font-sans font-semibold text-slate-300">
              {t('طلب', 'inquiries')}
            </span>
          </div>
          {total > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-gold-400/15 border border-gold-400/35 text-[11px] font-mono font-bold text-gold-200 tabular-nums shrink-0">
              {share}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
