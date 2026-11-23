import React, { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { submitPublicInquiry } from '../../lib/firestoreActions';
import { BLUEPRINT_LIMITS } from '../../types/cms';

interface InquiryFormProps {
  preselectedService?: string;
}

export function InquiryForm({ preselectedService = '' }: InquiryFormProps) {
  const { lang, t, services } = useApp();

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [serviceInterest, setServiceInterest] = useState(preselectedService);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setServiceInterest(preselectedService);
    } else if (!serviceInterest && services.length > 0) {
      setServiceInterest(lang === 'ar' ? services[0].titleAr : services[0].titleEn);
    }
  }, [preselectedService, services, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (fullName.trim().length < 2) {
      setErrorMsg(t('يرجى إدخال الاسم الكامل (حرفين على الأقل).', 'Please enter your full name.'));
      return;
    }
    if (organization.trim().length < 2) {
      setErrorMsg(t('يرجى إدخال اسم الشركة أو المنظمة.', 'Please enter your company or organization name.'));
      return;
    }
    if (!BLUEPRINT_LIMITS.emailPattern.test(email.trim())) {
      setErrorMsg(t('يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.'));
      return;
    }
    if (message.trim().length < 5) {
      setErrorMsg(
        t('يرجى كتابة تفاصيل الطلب أو المشروع (5 أحرف على الأقل).', 'Please describe your request or project scope.')
      );
      return;
    }

    setSubmitting(true);
    try {
      const refId = await submitPublicInquiry({
        fullName,
        organization,
        email,
        serviceInterest:
          serviceInterest || (lang === 'ar' ? 'استشارة مؤسسية عامة' : 'General Corporate Advisory'),
        message,
        language: lang,
      });
      setSubmittedRef(refId);
      setFullName('');
      setOrganization('');
      setEmail('');
      setMessage('');
    } catch {
      setErrorMsg(
        t(
          'تعذر إرسال الطلب في الوقت الحالي. يرجى التحقق من المدخلات أو مراسلتنا عبر البريد الرسمي.',
          'Unable to submit inquiry right now. Please check your inputs or email us directly.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="rounded-2xl surface-card-elevated p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-white">
          {t('تم استلام طلب الاستشارة بنجاح', 'Your Advisory Request Has Been Recorded')}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
          {t(
            'تم حفظ طلبكم رسمياً في سجل المتابعة لدى فريق HCC القيادي، وسيقوم المستشار المختص بمراجعته والتواصل معكم عبر البريد الإلكتروني المسجل.',
            'Your request has been saved to HCC’s executive intake system. Our advisory team will review your brief and follow up via your registered email.'
          )}
        </p>
        <div className="inline-block px-4 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs font-mono text-gold-300 tabular-nums">
          {t('رقم المرجع:', 'Reference ID:')} {submittedRef}
        </div>
        <div>
          <button
            type="button"
            onClick={() => setSubmittedRef(null)}
            className="mt-2 px-5 py-2.5 rounded-lg border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors cursor-pointer"
          >
            {t('إرسال طلب جديد', 'Submit Another Request')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl surface-card-elevated p-6 sm:p-8 space-y-5 shadow-2xl"
    >
      <div>
        <h3 className="text-xl font-extrabold text-white">
          {t('نموذج طلب الاستشارة وعروض الأسعار (RFP)', 'Consultation & RFP Request Form')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {t(
            'أدخل بيانات مؤسستك ونطاق العمل المطلوب ليتم توجيه الطلب للمسار المختص',
            'Provide your organization details and scope so we route your inquiry to the appropriate practice lead'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            {t('الاسم الكامل *', 'Full Name *')}
          </label>
          <input
            type="text"
            required
            maxLength={140}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('الاسم واللقب', 'Your full name')}
            className="w-full px-4 py-3 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            {t('الشركة / المؤسسة / المنظمة *', 'Organization / Company *')}
          </label>
          <input
            type="text"
            required
            maxLength={180}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder={t('اسم الجهة الطالبة', 'Entity or agency name')}
            className="w-full px-4 py-3 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            {t('البريد الإلكتروني الرسمي *', 'Official Email *')}
          </label>
          <input
            type="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-4 py-3 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none ltr-inline text-start"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            {t('نطاق الخدمة المطلوب *', 'Service Track *')}
          </label>
          <select
            value={serviceInterest}
            onChange={(e) => setServiceInterest(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
          >
            {services.map((s) => {
              const label = lang === 'ar' ? s.titleAr : s.titleEn;
              return (
                <option key={s.id} value={label}>
                  {label}
                </option>
              );
            })}
            <option value={t('استشارة مؤسسية عامة / RFP دولي', 'General Institutional Advisory / UN RFP')}>
              {t('استشارة مؤسسية عامة / RFP دولي', 'General Institutional Advisory / UN RFP')}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
          {t('تفاصيل الاحتياج أو المشروع *', 'Project Scope & Requirements *')}
        </label>
        <textarea
          required
          rows={4}
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t(
            'اذكر باختصار التحدي الحالي، الأهداف المطلوبة، أو تفاصيل المناقصة/العقد...',
            'Briefly outline your current challenge, target outcomes, or tender/BPO team requirements...'
          )}
          className="w-full px-4 py-3 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none resize-y"
        />
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400/35 text-xs text-red-200">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full btn-gold py-3.5 px-6 rounded-xl text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>
          {submitting
            ? t('جارٍ حفظ وإرسال الطلب...', 'Submitting Request...')
            : t('إرسال الطلب وحفظه رسمياً', 'Submit Official Request')}
        </span>
      </button>
    </form>
  );
}
