import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Calendar, Download, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  deleteAppointmentAdmin,
  deleteAppointmentSlot,
  exportRowsToCsv,
  saveAppointmentSlot,
  updateAppointmentAdmin,
} from '../../lib/firestoreActions';
import { Appointment, AppointmentSlot, AppointmentStatus } from '../../types/cms';

export function AppointmentsAdmin() {
  const { lang, t, isAdmin } = useApp();
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // New slot form
  const [dateIso, setDateIso] = useState('2026-06-01');
  const [dayLabelAr, setDayLabelAr] = useState('الإثنين 1 يونيو');
  const [dayLabelEn, setDayLabelEn] = useState('Monday, June 1');
  const [timeLabel, setTimeLabel] = useState('11:00 AM EET');
  const [advisorAr, setAdvisorAr] = useState('أ. محمد حسن حلاوة');
  const [advisorEn, setAdvisorEn] = useState('Mohammed Hasan Halawa');
  const [creatingSlot, setCreatingSlot] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(
      collection(db, 'appointment_slots'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppointmentSlot, 'id'>) }));
        list.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
        setSlots(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'appointment_slots')
    );

    const u2 = onSnapshot(
      query(collection(db, 'appointments'), orderBy('createdAt', 'desc')),
      (snap) => {
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
    );

    return () => {
      u1();
      u2();
    };
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSlot(true);
    try {
      await saveAppointmentSlot(
        {
          id: '',
          dateIso,
          dayLabelAr,
          dayLabelEn,
          timeLabel,
          advisorAr,
          advisorEn,
          isAvailable: true,
        },
        true
      );
    } finally {
      setCreatingSlot(false);
    }
  };

  const handleToggleSlot = async (slot: AppointmentSlot) => {
    await saveAppointmentSlot({ ...slot, isAvailable: !slot.isAvailable }, false);
  };

  const handleBookingStatusChange = async (appt: Appointment, status: AppointmentStatus) => {
    await updateAppointmentAdmin(appt, { status });
  };

  const handleExport = () => {
    exportRowsToCsv(
      `hcc-appointments-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Client', 'Organization', 'Email', 'Slot', 'Topic', 'Status'],
      appointments.map((a) => [
        a.id,
        a.clientName,
        a.organization || '',
        a.clientEmail,
        a.slotLabelEn || a.slotId,
        a.topic || '',
        a.status,
      ])
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('إدارة المواعيد وحجوزات الاستشارات', 'Consultation Slots & Bookings')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'التحكم في المواعيد المتاحة للعملاء واعتماد أو جدولة طلبات الحجز الواردة.',
              'Configure available advisor time slots and manage incoming client booking requests.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-navy-800 border border-gold-400/40 text-xs font-bold text-gold-300 inline-flex items-center gap-2 cursor-pointer self-start"
        >
          <Download className="w-4 h-4" />
          <span>{t('تصدير الحجوزات CSV', 'Export Bookings CSV')}</span>
        </button>
      </div>

      {/* Add New Slot */}
      <form onSubmit={handleCreateSlot} className="rounded-2xl surface-card p-6 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-gold-300" />
          <span>{t('إضافة موعد استشارة متاح', 'Add Available Consultation Slot')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Date (YYYY-MM-DD)</label>
            <input
              type="date"
              required
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">{t('التسمية بالعربية', 'Arabic Day Label')}</label>
            <input
              type="text"
              required
              value={dayLabelAr}
              onChange={(e) => setDayLabelAr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">{t('التسمية بالإنجليزية', 'English Day Label')}</label>
            <input
              type="text"
              required
              value={dayLabelEn}
              onChange={(e) => setDayLabelEn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">{t('الوقت', 'Time Label')}</label>
            <input
              type="text"
              required
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">{t('المستشار (عربي)', 'Advisor (AR)')}</label>
            <input
              type="text"
              required
              value={advisorAr}
              onChange={(e) => setAdvisorAr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">{t('المستشار (إنجليزي)', 'Advisor (EN)')}</label>
            <input
              type="text"
              required
              value={advisorEn}
              onChange={(e) => setAdvisorEn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creatingSlot}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          {creatingSlot ? t('جارٍ الإضافة...', 'Saving...') : t('إضافة الموعد', 'Add Slot')}
        </button>
      </form>

      {/* Slots Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-white">
          {t('المواعيد المنشورة للجمهور', 'Published Advisor Slots')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="rounded-xl surface-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-gold-300 tabular-nums">{slot.dateIso}</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    slot.isAvailable
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {slot.isAvailable ? t('متاح', 'Open') : t('مغلق', 'Closed')}
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {lang === 'ar' ? slot.dayLabelAr : slot.dayLabelEn} • {slot.timeLabel}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'ar' ? slot.advisorAr : slot.advisorEn}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggleSlot(slot)}
                  className="text-xs font-bold text-gold-300 hover:underline cursor-pointer"
                >
                  {slot.isAvailable ? t('إغلاق الموعد', 'Disable Slot') : t('إعادة فتح', 'Re-open')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteAppointmentSlot(slot.id)}
                  className="p-1.5 rounded-lg text-red-300 hover:bg-red-500/15 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booked Appointments */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold-300" />
          <span>{t('طلبات الحجز الواردة', 'Client Booking Requests')}</span>
        </h2>
        {appointments.length === 0 ? (
          <div className="rounded-2xl surface-card p-8 text-center text-sm text-slate-400">
            {t('لا توجد حجوزات مواعيد حتى الآن.', 'No client bookings submitted yet.')}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const locked = !isAdmin && appt.status === 'cancelled';
              return (
                <div
                  key={appt.id}
                  className="rounded-2xl surface-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold text-white">{appt.clientName}</span>
                      {appt.organization && (
                        <span className="text-xs text-gold-300">• {appt.organization}</span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-navy-900 border border-slate-700 text-[11px] font-mono text-amber-300">
                        {appt.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex flex-wrap gap-3">
                      <span className="ltr-inline">{appt.clientEmail}</span>
                      <span>|</span>
                      <span>{lang === 'ar' ? appt.slotLabelAr : appt.slotLabelEn}</span>
                    </div>
                    {appt.topic && (
                      <p className="text-xs text-slate-400 pt-1">
                        {t('الموضوع:', 'Topic:')} {appt.topic}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!locked && (
                      <select
                        value={appt.status}
                        onChange={(e) =>
                          handleBookingStatusChange(appt, e.target.value as AppointmentStatus)
                        }
                        className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteAppointmentAdmin(appt.id, appt.clientName)}
                        className="p-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
