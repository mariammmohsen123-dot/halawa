import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, UserCheck, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { bookPublicAppointment } from '../../lib/firestoreActions';
import { AppointmentSlot, BLUEPRINT_LIMITS } from '../../types/cms';

export function BookingModal() {
  const {
    lang,
    t,
    isBookingOpen,
    closeBookingModal,
    bookingTopic,
    appointmentSlots,
    hasFirestoreSeeded,
  } = useApp();

  const availableSlots = appointmentSlots.filter((s) => s.isAvailable);

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    if (isBookingOpen) {
      setTopic(bookingTopic || '');
      setErrorMsg('');
      setConfirmedId(null);
      if (availableSlots.length > 0 && !availableSlots.some((s) => s.id === selectedSlotId)) {
        setSelectedSlotId(availableSlots[0].id);
      }
    }
  }, [isBookingOpen, bookingTopic]);

  if (!isBookingOpen) return null;

  const selectedSlot: AppointmentSlot | undefined = availableSlots.find(
    (s) => s.id === selectedSlotId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasFirestoreSeeded) {
      setErrorMsg(
        t(
          'مواعيد الجدولة الفورية قيد التفعيل من قبل مسؤول النظام. يرجى استخدام نموذج التواصل المباشر أدناه وسيتم الرد عليك رسمياً.',
          'Live slot scheduling is pending activation by the administrator. Please submit via the direct consultation form instead.'
        )
      );
      return;
    }

    if (!selectedSlot) {
      setErrorMsg(t('يرجى اختيار موعد متاح من القائمة.', 'Please select an available slot.'));
      return;
    }

    if (clientName.trim().length < 2) {
      setErrorMsg(t('يرجى إدخال الاسم الكامل.', 'Please enter your full name.'));
      return;
    }

    if (!BLUEPRINT_LIMITS.emailPattern.test(clientEmail.trim())) {
      setErrorMsg(t('يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.'));
      return;
    }

    setSubmitting(true);
    try {
      const id = await bookPublicAppointment({
        slot: selectedSlot,
        clientName,
        organization,
        clientEmail,
        topic,
      });
      setConfirmedId(id);
      setClientName('');
      setOrganization('');
      setClientEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(
        msg.toLowerCase().includes('permission')
          ? t(
              'تعذر حجز هذا الموعد حالياً (ربما تم تحديث حالته). يرجى تجربة موعد آخر أو التواصل عبر النموذج.',
              'This slot could not be booked right now. Please select another slot or use the contact form.'
            )
          : t('حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مجدداً.', 'Failed to save booking. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B16]/85 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#071426] border border-gold-400/35 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#0D213D]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="booking-modal-title" className="text-lg font-extrabold text-white">
                {t('حجز جلسة استشارية تنفيذية', 'Schedule Executive Consultation')}
              </h2>
              <p className="text-xs text-slate-300">
                {t(
                  'اختر أحد المواعيد المتاحة ليتم تثبيت طلبك ومراجعته من فريق القيادة',
                  'Select an available slot to submit a formal consultation request'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBookingModal}
            aria-label={t('إغلاق النافذة', 'Close modal')}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {confirmedId ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-extrabold text-white">
                {t('تم استلام طلب حجز الموعد بنجاح', 'Consultation Slot Request Recorded')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t(
                  'تم تسجيل طلبك في قاعدة بيانات الشركة بحالة (قيد التأكيد - Pending). سيقوم المستشار المختص بالتواصل معك لتأكيد الجلسة وإرسال تفاصيل الانضمام.',
                  'Your request has been saved to our system with status (Pending). Our advisor will reach out directly to confirm the session details.'
                )}
              </p>
              <div className="inline-block px-3 py-1.5 rounded-lg bg-[#040B16] border border-slate-800 text-xs font-mono text-gold-300 tabular-nums">
                {t('المرجع:', 'Ref:')} {confirmedId}
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="btn-gold px-6 py-2.5 rounded-lg text-sm cursor-pointer"
                >
                  {t('إغلاق', 'Done')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!hasFirestoreSeeded && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 flex items-start gap-3 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      {t('تذكير: المواعيد المفعلة تظهر بعد تهيئة النظام', 'Notice: Live slots require initial admin seed')}
                    </p>
                    <p>
                      {t(
                        'يمكنك إرسال طلبك مباشرة عبر صفحة التواصل وسيصل فوراً لفريقنا.',
                        'You can submit your inquiry via our Contact page directly.'
                      )}{' '}
                      <Link
                        to="/contact"
                        onClick={closeBookingModal}
                        className="underline font-bold text-gold-300"
                      >
                        {t('انتقل لنموذج التواصل', 'Go to Contact Form')}
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Available Slots */}
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-2">
                  {t('1. اختر الموعد المناسب', '1. Select an Available Slot')}
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-400 p-4 rounded-xl bg-navy-900 border border-slate-800">
                    {t(
                      'لا توجد مواعيد شاغرة حالياً. يرجى إرسال طلب عبر صفحة التواصل.',
                      'No open slots at the moment. Please submit an inquiry via Contact.'
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSlots.map((slot) => {
                      const active = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`text-start p-3.5 rounded-xl border transition-colors cursor-pointer ${
                            active
                              ? 'bg-navy-800 border-gold-400 text-white'
                              : 'bg-navy-900/70 border-slate-800 text-slate-300 hover:border-gold-300/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-white">
                              {lang === 'ar' ? slot.dayLabelAr : slot.dayLabelEn}
                            </span>
                            <span className="text-xs font-mono text-gold-300 tabular-nums ltr-inline">
                              {slot.dateIso}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                            <Clock className="w-3.5 h-3.5 text-gold-300" />
                            <span className="ltr-inline">{slot.timeLabel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <UserCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                            <span className="truncate">
                              {lang === 'ar' ? slot.advisorAr : slot.advisorEn}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Client Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('الاسم الكامل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={t('أحمد محمود', 'Full Name')}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('البريد الإلكتروني *', 'Work Email *')}
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none ltr-inline text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('الشركة / المنظمة', 'Organization / Entity')}
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={t('اسم الشركة أو الجهة', 'Company or NGO name')}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('موضوع الاستشارة', 'Consultation Topic')}
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('مثال: تأهيل ISO 9001 أو تعهيد فريق', 'e.g. ISO 9001 or BPO Team')}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-400/35 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableSlots.length === 0}
                  className="btn-gold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? t('جارٍ التسجيل...', 'Submitting...')
                    : t('تثبيت طلب الموعد', 'Submit Slot Request')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
