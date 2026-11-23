import React, { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteTeamMember, saveTeamMember } from '../../lib/firestoreActions';
import { PublishStatus, TeamMember } from '../../types/cms';

const EMPTY_MEMBER: TeamMember = {
  id: '',
  order: 6,
  nameAr: '',
  nameEn: '',
  roleAr: '',
  roleEn: '',
  badgeCode: '',
  bioAr: '',
  bioEn: '',
  expertiseAr: [],
  expertiseEn: [],
  linkedinUrl: '',
  photoUrl: '',
  isPrimaryLeader: false,
  status: 'published',
};

export function TeamAdmin() {
  const { lang, t, teamMembers } = useApp();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await saveTeamMember(editing, isNew);
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
            {t('إدارة القيادات التنفيذية والفريق', 'Leadership Team Manager')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('تعديل بيانات الشركاء والقيادات الفنية وإرفاق روابط الصور الرسمية الحقيقية أو LinkedIn.', 'Update executive profiles, expertise tags, LinkedIn links, and optional real photo URLs.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditing({ ...EMPTY_MEMBER, order: teamMembers.length + 1 });
          }}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة قيادي', 'Add Team Member')}</span>
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl surface-card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-gold-300">
              {isNew ? t('إضافة قيادي جديد', 'New Member') : t('تعديل الملف القيادي', 'Edit Member')}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              required
              placeholder="Order"
              value={editing.order}
              onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Badge Code (e.g. FOUNDER & MD)"
              value={editing.badgeCode || ''}
              onChange={(e) => setEditing({ ...editing, badgeCode: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
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

          <label className="inline-flex items-center gap-2 text-xs font-bold text-gold-300 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.isPrimaryLeader}
              onChange={(e) => setEditing({ ...editing, isPrimaryLeader: e.target.checked })}
            />
            <span>{t('تمييز كقائد تنفيذي رئيسي', 'Highlight as Primary Leader')}</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Name (AR)"
              value={editing.nameAr}
              onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Name (EN)"
              value={editing.nameEn}
              onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Role (AR)"
              value={editing.roleAr}
              onChange={(e) => setEditing({ ...editing, roleAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Role (EN)"
              value={editing.roleEn}
              onChange={(e) => setEditing({ ...editing, roleEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={3}
              required
              placeholder="Bio (AR)"
              value={editing.bioAr}
              onChange={(e) => setEditing({ ...editing, bioAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={3}
              required
              placeholder="Bio (EN)"
              value={editing.bioEn}
              onChange={(e) => setEditing({ ...editing, bioEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={editing.linkedinUrl || ''}
              onChange={(e) => setEditing({ ...editing, linkedinUrl: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Real Photo URL (Optional)"
              value={editing.photoUrl || ''}
              onChange={(e) => setEditing({ ...editing, photoUrl: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
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
              <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ البيانات', 'Save Member')}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {teamMembers.map((tm) => (
          <div
            key={tm.id}
            className="rounded-2xl surface-card p-5 flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-xs font-mono text-gold-300">
                #{tm.order} • {tm.badgeCode || 'LEADER'}
              </div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'ar' ? tm.nameAr : tm.nameEn}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? tm.roleAr : tm.roleEn}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditing(JSON.parse(JSON.stringify(tm)));
                }}
                className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('تعديل', 'Edit')}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteTeamMember(tm.id, tm.nameAr, tm.nameEn)}
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
