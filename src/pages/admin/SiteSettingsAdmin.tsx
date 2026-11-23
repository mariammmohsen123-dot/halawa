import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { saveSiteSettings } from '../../lib/firestoreActions';
import { SiteSettings } from '../../types/cms';

export function SiteSettingsAdmin() {
  const { t, settings, isAdmin } = useApp();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl surface-card p-8 text-center text-sm text-amber-200">
        {t(
          'تعديل الإعدادات العامة وSEO مقتصر على صلاحية المدير العام (Admin) فقط.',
          'Global site settings & SEO configuration are restricted to Admins.'
        )}
      </div>
    );
  }

  const handleChange = (key: keyof SiteSettings, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await saveSiteSettings(form);
      setSavedMsg(t('تم حفظ الإعدادات وتحديث SEO بنجاح.', 'Site settings and SEO metadata updated.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('الإعدادات العامة والهوية وSEO', 'Corporate Site Settings & SEO')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'تحديث الهوية المؤسسية، أرقام الاعتماد القانونية، بيانات التواصل، ونصوص الصفحة الرئيسية.',
              'Update institutional identity, registration IDs, contact details, hero messaging, and SEO.'
            )}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-gold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer self-start"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save Settings')}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-xs text-emerald-200">
          {savedMsg}
        </div>
      )}

      {/* Identity & Hero */}
      <div className="rounded-2xl surface-card p-6 space-y-4">
        <h2 className="text-base font-extrabold text-gold-300">
          {t('الهوية والنص الرئيسي (Hero)', 'Brand Identity & Hero Copy')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Brand Name (AR)" value={form.brandNameAr} onChange={(v) => handleChange('brandNameAr', v)} />
          <Field label="Brand Name (EN)" value={form.brandNameEn} onChange={(v) => handleChange('brandNameEn', v)} />
          <Field label="Hero Slogan (AR)" value={form.heroTitleAr} onChange={(v) => handleChange('heroTitleAr', v)} />
          <Field label="Hero Slogan (EN)" value={form.heroTitleEn} onChange={(v) => handleChange('heroTitleEn', v)} />
          <Field label="Hero Badge (AR)" value={form.heroBadgeAr} onChange={(v) => handleChange('heroBadgeAr', v)} />
          <Field label="Hero Badge (EN)" value={form.heroBadgeEn} onChange={(v) => handleChange('heroBadgeEn', v)} />
          <TextArea label="Hero Description (AR)" value={form.heroDescAr} onChange={(v) => handleChange('heroDescAr', v)} />
          <TextArea label="Hero Description (EN)" value={form.heroDescEn} onChange={(v) => handleChange('heroDescEn', v)} />
        </div>
      </div>

      {/* Contacts & Legal IDs */}
      <div className="rounded-2xl surface-card p-6 space-y-4">
        <h2 className="text-base font-extrabold text-gold-300">
          {t('التواصل والاعتمادات القانونية', 'Contacts & Legal Numbers')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Official Email" value={form.email} onChange={(v) => handleChange('email', v)} />
          <Field label="Phone" value={form.phone} onChange={(v) => handleChange('phone', v)} />
          <Field label="WhatsApp URL" value={form.whatsappUrl} onChange={(v) => handleChange('whatsappUrl', v)} />
          <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={(v) => handleChange('linkedinUrl', v)} />
          <Field label="UNGM ID" value={form.ungmNumber} onChange={(v) => handleChange('ungmNumber', v)} />
          <Field label="Registration No." value={form.regNumber} onChange={(v) => handleChange('regNumber', v)} />
          <Field label="Commercial Reg" value={form.commercialNumber} onChange={(v) => handleChange('commercialNumber', v)} />
          <Field label="GCCI No." value={form.gcciNumber} onChange={(v) => handleChange('gcciNumber', v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Address (AR)" value={form.addressAr} onChange={(v) => handleChange('addressAr', v)} />
          <Field label="Address (EN)" value={form.addressEn} onChange={(v) => handleChange('addressEn', v)} />
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-2xl surface-card p-6 space-y-4">
        <h2 className="text-base font-extrabold text-gold-300">
          {t('إعدادات محركات البحث (SEO & OpenGraph)', 'SEO & Metadata')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="SEO Title (AR)" value={form.seoTitleAr} onChange={(v) => handleChange('seoTitleAr', v)} />
          <Field label="SEO Title (EN)" value={form.seoTitleEn} onChange={(v) => handleChange('seoTitleEn', v)} />
          <TextArea label="SEO Description (AR)" value={form.seoDescriptionAr} onChange={(v) => handleChange('seoDescriptionAr', v)} />
          <TextArea label="SEO Description (EN)" value={form.seoDescriptionEn} onChange={(v) => handleChange('seoDescriptionEn', v)} />
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
      <textarea
        rows={3}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
      />
    </div>
  );
}
