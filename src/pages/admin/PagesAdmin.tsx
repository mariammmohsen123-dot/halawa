import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { savePageSection } from '../../lib/firestoreActions';
import { PageSection, PublishStatus } from '../../types/cms';

export function PagesAdmin() {
  const { lang, t, pages } = useApp();
  const [selectedId, setSelectedId] = useState<string>('about');
  const [draft, setDraft] = useState<PageSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const found = pages.find((p) => p.id === selectedId) || pages[0] || null;
    setDraft(found ? JSON.parse(JSON.stringify(found)) : null);
    setSavedMsg('');
  }, [selectedId, pages]);

  const handleItemChange = (
    idx: number,
    key: 'titleAr' | 'titleEn' | 'descAr' | 'descEn' | 'detailsAr' | 'detailsEn',
    value: string
  ) => {
    setDraft((prev) => {
      if (!prev || !prev.items) return prev;
      const items = [...prev.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...prev, items };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSavedMsg('');
    try {
      await savePageSection(draft, false);
      setSavedMsg(t('تم حفظ تحديثات القسم بنجاح.', 'Page section updated in Firestore.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('تحرير أقسام الصفحات المؤسسية', 'CMS Page Sections Editor')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'إدارة محتوى من نحن (الرؤية، الرسالة، الأذرع الثلاثة)، المنهجية الرباعية، ومزايا HCC.',
              'Edit About HCC (Vision, Mission, 3 Arms), 4-Stage Methodology, and Why HCC content.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                selectedId === p.id
                  ? 'btn-gold'
                  : 'bg-navy-900 border border-slate-700 text-slate-300'
              }`}
            >
              {lang === 'ar' ? p.titleAr.split('|')[0] : p.titleEn.split('|')[0]}
            </button>
          ))}
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-xs text-emerald-200">
          {savedMsg}
        </div>
      )}

      {draft && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl surface-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono text-gold-300">slug: {draft.slug}</span>
              <div className="flex items-center gap-3">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as PublishStatus })
                  }
                  className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                >
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ القسم', 'Save Section')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Title (AR)</label>
                <input
                  type="text"
                  required
                  value={draft.titleAr}
                  onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Title (EN)</label>
                <input
                  type="text"
                  required
                  value={draft.titleEn}
                  onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            {draft.slug === 'about' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Body Overview (AR)</label>
                    <textarea
                      rows={3}
                      value={draft.bodyAr || ''}
                      onChange={(e) => setDraft({ ...draft, bodyAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Body Overview (EN)</label>
                    <textarea
                      rows={3}
                      value={draft.bodyEn || ''}
                      onChange={(e) => setDraft({ ...draft, bodyEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Vision (AR)</label>
                    <textarea
                      rows={2}
                      value={draft.visionAr || ''}
                      onChange={(e) => setDraft({ ...draft, visionAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Vision (EN)</label>
                    <textarea
                      rows={2}
                      value={draft.visionEn || ''}
                      onChange={(e) => setDraft({ ...draft, visionEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mission (AR)</label>
                    <textarea
                      rows={2}
                      value={draft.missionAr || ''}
                      onChange={(e) => setDraft({ ...draft, missionAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mission (EN)</label>
                    <textarea
                      rows={2}
                      value={draft.missionEn || ''}
                      onChange={(e) => setDraft({ ...draft, missionEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Structured Items */}
          {draft.items && draft.items.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-gold-300">
                {t('العناصر الفرعية المنظمة', 'Structured Sub-Items')}
              </h2>
              {draft.items.map((item, idx) => (
                <div key={item.id} className="rounded-2xl surface-card p-5 space-y-3">
                  <div className="text-xs font-mono text-gold-300">
                    {item.code || idx + 1} • {item.id}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.titleAr}
                      onChange={(e) => handleItemChange(idx, 'titleAr', e.target.value)}
                      placeholder="Title AR"
                      className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={item.titleEn}
                      onChange={(e) => handleItemChange(idx, 'titleEn', e.target.value)}
                      placeholder="Title EN"
                      className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                    <textarea
                      rows={2}
                      value={item.descAr}
                      onChange={(e) => handleItemChange(idx, 'descAr', e.target.value)}
                      placeholder="Description AR"
                      className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                    <textarea
                      rows={2}
                      value={item.descEn}
                      onChange={(e) => handleItemChange(idx, 'descEn', e.target.value)}
                      placeholder="Description EN"
                      className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
