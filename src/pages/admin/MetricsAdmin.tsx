import React, { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteMetricSet, saveMetricSet, slugifySafeId } from '../../lib/firestoreActions';
import { MetricDataPoint, ProjectMetricSet, PublishStatus } from '../../types/cms';

export function MetricsAdmin() {
  const { lang, t, projectMetrics } = useApp();
  const [editing, setEditing] = useState<ProjectMetricSet | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setIsNew(true);
    setEditing({
      id: '',
      key: '',
      order: projectMetrics.length + 1,
      chartType: 'bar',
      tabLabelAr: 'مؤشر جديد',
      tabLabelEn: 'New Metric Set',
      datasetLabelAr: '',
      datasetLabelEn: '',
      summaryTitleAr: '',
      summaryTitleEn: '',
      summaryKpiAr: '',
      summaryKpiEn: '',
      sourceNoteAr: '',
      sourceNoteEn: '',
      periodTag: '2026',
      bulletsAr: [],
      bulletsEn: [],
      dataPoints: [{ labelAr: 'نقطة 1', labelEn: 'Point 1', value: 10, unit: '' }],
      status: 'published',
    });
  };

  const startEdit = (m: ProjectMetricSet) => {
    setIsNew(false);
    setEditing(JSON.parse(JSON.stringify(m)));
  };

  const updatePoint = (idx: number, patch: Partial<MetricDataPoint>) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const pts = [...prev.dataPoints];
      pts[idx] = { ...pts[idx], ...patch };
      return { ...prev, dataPoints: pts };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const cleanKey = slugifySafeId(editing.key || editing.tabLabelEn, 'metric');
      await saveMetricSet({ ...editing, id: editing.id || cleanKey, key: cleanKey }, isNew);
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
            {t('إدارة لوحة مؤشرات الأثر والرسوم البيانية', 'Impact Metrics & Chart Datasets')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('تعديل بيانات Recharts في الواجهة العامة وإضافة نقاط قياس ومصادر التحقق.', 'Manage Recharts datasets, chart types, data points, and verification notes.')}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة مجموعة مؤشرات', 'Add Dataset')}</span>
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl surface-card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-gold-300">
              {isNew ? t('مجموعة مؤشرات جديدة', 'New Dataset') : t('تعديل المؤشرات', 'Edit Dataset')}
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
              placeholder="dataset-key"
              value={editing.key}
              onChange={(e) => setEditing({ ...editing, key: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white disabled:opacity-60"
            />
            <select
              value={editing.chartType}
              onChange={(e) =>
                setEditing({ ...editing, chartType: e.target.value as 'bar' | 'area' | 'line' })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
              <option value="line">Line Chart</option>
            </select>
            <input
              type="text"
              placeholder="Period Tag (e.g. 2025-2026)"
              value={editing.periodTag || ''}
              onChange={(e) => setEditing({ ...editing, periodTag: e.target.value })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Tab Label (AR)"
              value={editing.tabLabelAr}
              onChange={(e) => setEditing({ ...editing, tabLabelAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Tab Label (EN)"
              value={editing.tabLabelEn}
              onChange={(e) => setEditing({ ...editing, tabLabelEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Summary Title (AR)"
              value={editing.summaryTitleAr}
              onChange={(e) => setEditing({ ...editing, summaryTitleAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Summary Title (EN)"
              value={editing.summaryTitleEn}
              onChange={(e) => setEditing({ ...editing, summaryTitleEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Headline KPI (AR)"
              value={editing.summaryKpiAr || ''}
              onChange={(e) => setEditing({ ...editing, summaryKpiAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Headline KPI (EN)"
              value={editing.summaryKpiEn || ''}
              onChange={(e) => setEditing({ ...editing, summaryKpiEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>

          {/* Data Points */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gold-300">
                {t('نقاط البيانات في الرسم البياني', 'Chart Data Points')}
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    dataPoints: [
                      ...editing.dataPoints,
                      { labelAr: '', labelEn: '', value: 0, unit: '' },
                    ],
                  })
                }
                className="text-xs font-bold text-gold-300 hover:underline cursor-pointer"
              >
                + {t('إضافة نقطة', 'Add Point')}
              </button>
            </div>
            {editing.dataPoints.map((pt, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Label AR"
                  value={pt.labelAr}
                  onChange={(e) => updatePoint(idx, { labelAr: e.target.value })}
                  className="sm:col-span-4 px-2.5 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Label EN"
                  value={pt.labelEn}
                  onChange={(e) => updatePoint(idx, { labelEn: e.target.value })}
                  className="sm:col-span-4 px-2.5 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                />
                <input
                  type="number"
                  step="any"
                  value={pt.value}
                  onChange={(e) => updatePoint(idx, { value: Number(e.target.value) })}
                  className="sm:col-span-2 px-2.5 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      dataPoints: editing.dataPoints.filter((_, i) => i !== idx),
                    })
                  }
                  className="sm:col-span-2 p-2 rounded-lg text-red-300 hover:bg-red-500/15 text-xs cursor-pointer"
                >
                  {t('حذف', 'Remove')}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ المؤشرات', 'Save Dataset')}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {projectMetrics.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-gold-300">{m.key} • {m.chartType}</span>
                <span className="text-slate-400">• {m.dataPoints.length} points</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'ar' ? m.tabLabelAr : m.tabLabelEn}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? m.summaryKpiAr : m.summaryKpiEn}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEdit(m)}
                className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('تعديل', 'Edit')}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteMetricSet(m.id, m.tabLabelAr, m.tabLabelEn)}
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
