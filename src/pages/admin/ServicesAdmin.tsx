import React, { useState } from 'react';
import { Edit2, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteServiceItem, saveServiceItem, slugifySafeId } from '../../lib/firestoreActions';
import { PublishStatus, ServiceItem } from '../../types/cms';

const EMPTY_SERVICE: ServiceItem = {
  id: '',
  slug: '',
  order: 6,
  isVipTrack: false,
  tag: 'PILLAR 05',
  titleAr: '',
  titleEn: '',
  summaryAr: '',
  summaryEn: '',
  targetAudienceAr: '',
  targetAudienceEn: '',
  solutionsAr: [],
  solutionsEn: [],
  deliverablesAr: [],
  deliverablesEn: [],
  status: 'published',
};

export function ServicesAdmin() {
  const { lang, t, services } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = services.filter((s) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      s.titleAr.toLowerCase().includes(q) ||
      s.titleEn.toLowerCase().includes(q) ||
      s.tag.toLowerCase().includes(q)
    );
  });

  const startNew = () => {
    setIsNew(true);
    setEditing({ ...EMPTY_SERVICE, order: services.length + 1 });
  };

  const startEdit = (svc: ServiceItem) => {
    setIsNew(false);
    setEditing(JSON.parse(JSON.stringify(svc)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const cleanSlug = slugifySafeId(editing.slug || editing.titleEn, 'svc');
      await saveServiceItem(
        {
          ...editing,
          id: editing.id || cleanSlug,
          slug: cleanSlug,
        },
        isNew
      );
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('إدارة الخدمات والمسارات الاستشارية', 'Services & Pillars Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('إضافة وتعديل وترتيب محاور الخدمات ومسار النخبة وحالة النشر.', 'Create, edit, reorder, and toggle draft/published status for services.')}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة خدمة جديدة', 'Add Service')}</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('بحث في الخدمات...', 'Search services...')}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#071426] border border-slate-700 text-sm text-white"
        />
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl surface-card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-gold-300">
              {isNew ? t('إضافة خدمة جديدة', 'New Service') : t('تعديل الخدمة', 'Edit Service')}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Slug (EN)</label>
              <input
                type="text"
                required
                disabled={!isNew}
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="sme-iso-9001"
                className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Tag</label>
              <input
                type="text"
                required
                value={editing.tag}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Order</label>
              <input
                type="number"
                required
                value={editing.order}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as PublishStatus })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-bold text-gold-300 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.isVipTrack}
              onChange={(e) => setEditing({ ...editing, isVipTrack: e.target.checked })}
            />
            <span>{t('تفعيل تنسيق جناح النخبة VIP Track', 'Highlight as VIP Executive Track')}</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Title (AR)"
              value={editing.titleAr}
              onChange={(e) => setEditing({ ...editing, titleAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Title (EN)"
              value={editing.titleEn}
              onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={3}
              required
              placeholder="Summary (AR)"
              value={editing.summaryAr}
              onChange={(e) => setEditing({ ...editing, summaryAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={3}
              required
              placeholder="Summary (EN)"
              value={editing.summaryEn}
              onChange={(e) => setEditing({ ...editing, summaryEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={3}
              placeholder="Solutions AR (one per line)"
              value={(editing.solutionsAr || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  solutionsAr: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={3}
              placeholder="Solutions EN (one per line)"
              value={(editing.solutionsEn || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  solutionsEn: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={3}
              placeholder="Deliverables AR (one per line)"
              value={(editing.deliverablesAr || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  deliverablesAr: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={3}
              placeholder="Deliverables EN (one per line)"
              value={(editing.deliverablesEn || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  deliverablesEn: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 cursor-pointer"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gold px-5 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الخدمة', 'Save Service')}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((svc) => (
          <div
            key={svc.id}
            className="rounded-2xl surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-gold-300">#{svc.order} • {svc.tag}</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono ${
                    svc.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {svc.status}
                </span>
                {svc.isVipTrack && (
                  <span className="px-2 py-0.5 rounded bg-gold-400/20 text-gold-300 font-bold">
                    VIP
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'ar' ? svc.titleAr : svc.titleEn}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {lang === 'ar' ? svc.summaryAr : svc.summaryEn}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(svc)}
                className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('تعديل', 'Edit')}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteServiceItem(svc.id, svc.titleAr, svc.titleEn)}
                className="p-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
