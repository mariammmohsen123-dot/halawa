import React, { useState } from 'react';
import { Edit2, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteProjectItem, saveProjectItem, slugifySafeId } from '../../lib/firestoreActions';
import { ProjectItem, PublishStatus } from '../../types/cms';

const EMPTY_PROJECT: ProjectItem = {
  id: '',
  slug: '',
  order: 5,
  isFlagship: false,
  sector: 'Economic Recovery',
  serviceSlug: 'clusters-recovery',
  periodAr: '2026',
  periodEn: '2026',
  clientAr: '',
  clientEn: '',
  titleAr: '',
  titleEn: '',
  challengeAr: '',
  challengeEn: '',
  roleAr: '',
  roleEn: '',
  solutionsAr: '',
  solutionsEn: '',
  metricsAr: [],
  metricsEn: [],
  status: 'published',
};

export function ProjectsAdmin() {
  const { lang, t, projects, services } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      p.titleAr.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.clientAr.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q)
    );
  });

  const startNew = () => {
    setIsNew(true);
    setEditing({ ...EMPTY_PROJECT, order: projects.length + 1 });
  };

  const startEdit = (p: ProjectItem) => {
    setIsNew(false);
    setEditing(JSON.parse(JSON.stringify(p)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const cleanSlug = slugifySafeId(editing.slug || editing.titleEn, 'proj');
      await saveProjectItem(
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
            {t('إدارة سجل العقود والمشاريع', 'Portfolio & Case Studies Manager')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('إدارة دراسات الحالة، مؤشرات الأثر، والربط بالخدمات.', 'Manage project case studies, field metrics, and service associations.')}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة مشروع', 'Add Project')}</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('بحث باسم المشروع أو الشريك أو القطاع...', 'Search project, client, or sector...')}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#071426] border border-slate-700 text-sm text-white"
        />
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl surface-card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-gold-300">
              {isNew ? t('إضافة مشروع جديد', 'New Case Study') : t('تعديل المشروع', 'Edit Case Study')}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              required
              disabled={!isNew}
              placeholder="slug-id"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white disabled:opacity-60"
            />
            <input
              type="text"
              required
              placeholder="Sector (e.g. BPO & Remote)"
              value={editing.sector}
              onChange={(e) => setEditing({ ...editing, sector: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <select
              value={editing.serviceSlug}
              onChange={(e) => setEditing({ ...editing, serviceSlug: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.slug}
                </option>
              ))}
            </select>
            <select
              value={editing.status}
              onChange={(e) =>
                setEditing({ ...editing, status: e.target.value as PublishStatus })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
              type="text"
              required
              placeholder="Period (AR)"
              value={editing.periodAr}
              onChange={(e) => setEditing({ ...editing, periodAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Period (EN)"
              value={editing.periodEn}
              onChange={(e) => setEditing({ ...editing, periodEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <label className="inline-flex items-center gap-2 text-xs font-bold text-gold-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isFlagship}
                onChange={(e) => setEditing({ ...editing, isFlagship: e.target.checked })}
              />
              <span>{t('عقد رئيسي مميز (Flagship)', 'Flagship Mandate')}</span>
            </label>
          </div>

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
            <input
              type="text"
              required
              placeholder="Client / Donor (AR)"
              value={editing.clientAr}
              onChange={(e) => setEditing({ ...editing, clientAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Client / Donor (EN)"
              value={editing.clientEn}
              onChange={(e) => setEditing({ ...editing, clientEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={2}
              placeholder="Challenge (AR)"
              value={editing.challengeAr || ''}
              onChange={(e) => setEditing({ ...editing, challengeAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="Challenge (EN)"
              value={editing.challengeEn || ''}
              onChange={(e) => setEditing({ ...editing, challengeEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="HCC Role (AR)"
              value={editing.roleAr || ''}
              onChange={(e) => setEditing({ ...editing, roleAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="HCC Role (EN)"
              value={editing.roleEn || ''}
              onChange={(e) => setEditing({ ...editing, roleEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="Metrics AR (one per line)"
              value={(editing.metricsAr || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  metricsAr: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="Metrics EN (one per line)"
              value={(editing.metricsEn || []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  metricsEn: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
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
              <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ المشروع', 'Save Project')}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-gold-300">{p.sector}</span>
                <span className="text-slate-400">• {lang === 'ar' ? p.periodAr : p.periodEn}</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono ${
                    p.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'ar' ? p.titleAr : p.titleEn}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? p.clientAr : p.clientEn}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('تعديل', 'Edit')}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteProjectItem(p.id, p.titleAr, p.titleEn)}
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
