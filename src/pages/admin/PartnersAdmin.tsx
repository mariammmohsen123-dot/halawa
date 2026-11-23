import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  CheckCircle2,
  Edit2,
  FolderOpen,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { deletePartnerItem, savePartnerItem, slugifySafeId } from '../../lib/firestoreActions';
import { uploadPartnerLogoFile } from '../../lib/mediaUpload';
import { MediaAsset, PartnerCategory, PartnerItem, PublishStatus } from '../../types/cms';

const EMPTY_PARTNER: PartnerItem = {
  id: '',
  slug: '',
  order: 16,
  category: 'consortium',
  abbr: '',
  nameAr: '',
  nameEn: '',
  relationshipAr: '',
  relationshipEn: '',
  detailsAr: '',
  detailsEn: '',
  colorLogoUrl: '',
  watermarkLogoUrl: '',
  websiteUrl: '',
  status: 'published',
};

function isSafeLogoSrc(val?: string): boolean {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  );
}

export function PartnersAdmin() {
  const { lang, t, partners, user } = useApp();
  const [editing, setEditing] = useState<PartnerItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [pickerTarget, setPickerTarget] = useState<'colorLogoUrl' | 'watermarkLogoUrl' | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'media'), orderBy('createdAt', 'desc')),
      (snap) => {
        setMediaAssets(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) }))
            .filter((a) => a.mimeType !== 'application/pdf')
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'media')
    );
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFeedback(null);

    if (!isSafeLogoSrc(editing.colorLogoUrl) || !isSafeLogoSrc(editing.watermarkLogoUrl)) {
      setFeedback({
        type: 'error',
        text: t(
          'رابط الشعار غير صالح. استخدم رابط HTTPS أو ارفع صورة مباشرة.',
          'Invalid logo URL. Use HTTPS or upload an image file directly.'
        ),
      });
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slugifySafeId(editing.slug || editing.abbr || editing.nameEn, 'partner');
      await savePartnerItem({ ...editing, id: editing.id || cleanSlug, slug: cleanSlug }, isNew);
      setEditing(null);
      setPickerTarget(null);
      setFeedback({
        type: 'success',
        text: t('تم حفظ بيانات وصورة الشريك بنجاح.', 'Partner details and logo saved successfully.'),
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : t('تعذر حفظ الشريك.', 'Failed to save partner.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormLogoUpload = async (
    field: 'colorLogoUrl' | 'watermarkLogoUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editing || !user) return;
    setFeedback(null);
    setUploadingTarget(`form-${field}`);

    try {
      const url = await uploadPartnerLogoFile({
        file,
        label: `${editing.abbr || editing.nameEn || 'partner'}-${field === 'colorLogoUrl' ? 'color' : 'gold'}`,
        userUid: user.uid,
      });
      setEditing((prev) => (prev ? { ...prev, [field]: url } : prev));
      setFeedback({
        type: 'success',
        text: t(
          'تم رفع الصورة وتجهيزها — اضغط «حفظ الشريك» لاعتمادها.',
          'Logo uploaded and ready — click Save Partner to apply.'
        ),
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : t('تعذر رفع الصورة.', 'Image upload failed.'),
      });
    } finally {
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const handleQuickCardLogoUpload = async (
    partner: PartnerItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFeedback(null);
    setUploadingTarget(`card-${partner.id}`);

    try {
      const url = await uploadPartnerLogoFile({
        file,
        label: `${partner.abbr || partner.nameEn}-logo`,
        userUid: user.uid,
      });
      await savePartnerItem({ ...partner, colorLogoUrl: url }, false);
      if (editing && editing.id === partner.id) {
        setEditing((prev) => (prev ? { ...prev, colorLogoUrl: url } : prev));
      }
      setFeedback({
        type: 'success',
        text: t(
          `تم تحديث شعار (${partner.nameAr}) بنجاح.`,
          `Updated logo for (${partner.nameEn}) successfully.`
        ),
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : t('تعذر تحديث الشعار.', 'Failed to update logo.'),
      });
    } finally {
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const openEditorForPartner = (pt: PartnerItem) => {
    setIsNew(false);
    setEditing(JSON.parse(JSON.stringify(pt)));
    setPickerTarget(null);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('إدارة الشركاء والاعتمادات الدولية', 'Partners & Accreditations Manager')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'ارفع الصورة المناسبة لكل شركة مباشرة أو اخترها من مكتبة الوسائط، وعدّل التصنيفات وروابط التحقق.',
              'Upload the official logo for each partner directly or choose from the Media Library.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditing({ ...EMPTY_PARTNER, order: partners.length + 1 });
            setPickerTarget(null);
            setFeedback(null);
          }}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة شريك', 'Add Partner')}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
              : 'bg-red-500/15 border-red-400/35 text-red-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl surface-card-elevated p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-gold-300">
              {isNew ? t('إضافة شريك/اعتماد', 'New Partner') : t('تعديل بيانات وشعار الشريك', 'Edit Partner & Logo')}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setPickerTarget(null);
              }}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              placeholder="Abbreviation (e.g. UNDP)"
              value={editing.abbr}
              onChange={(e) => setEditing({ ...editing, abbr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <select
              value={editing.category}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value as PartnerCategory })
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            >
              <option value="accreditation">accreditation</option>
              <option value="trusted_seal">trusted_seal</option>
              <option value="consortium">consortium</option>
              <option value="digital_infra">digital_infra</option>
              <option value="clients_ecosystem">clients_ecosystem</option>
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
            <input
              type="number"
              min={0}
              max={999}
              placeholder="Order"
              value={editing.order}
              onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) || 0 })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder={t('اسم الشركة / الجهة (عربي)', 'Name (AR)')}
              value={editing.nameAr}
              onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder={t('اسم الشركة / الجهة (إنجليزي)', 'Name (EN)')}
              value={editing.nameEn}
              onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder={t('صفة العلاقة التعاقدية (عربي)', 'Relationship Label (AR)')}
              value={editing.relationshipAr}
              onChange={(e) => setEditing({ ...editing, relationshipAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder={t('صفة العلاقة التعاقدية (إنجليزي)', 'Relationship Label (EN)')}
              value={editing.relationshipEn}
              onChange={(e) => setEditing({ ...editing, relationshipEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={2}
              placeholder={t('وصف تفصيلي للشراكة (عربي)', 'Partnership Details (AR)')}
              value={editing.detailsAr || ''}
              onChange={(e) => setEditing({ ...editing, detailsAr: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <textarea
              rows={2}
              placeholder={t('وصف تفصيلي للشراكة (إنجليزي)', 'Partnership Details (EN)')}
              value={editing.detailsEn || ''}
              onChange={(e) => setEditing({ ...editing, detailsEn: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              dir="ltr"
              placeholder="Website URL (https://...)"
              value={editing.websiteUrl || ''}
              onChange={(e) => setEditing({ ...editing, websiteUrl: e.target.value })}
              className="md:col-span-2 px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
          </div>

          {/* Dedicated Partner Logo Upload & Preview Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gold-300 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                <span>{t('شعارات وصور الشركة', 'Company Logos & Visual Assets')}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {t('PNG / JPG / WEBP / SVG — يتم تحسين الحجم تلقائياً', 'PNG / JPG / WEBP / SVG — Auto-optimized')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(['colorLogoUrl', 'watermarkLogoUrl'] as const).map((field) => {
                const isColor = field === 'colorLogoUrl';
                const currentVal = editing[field] || '';
                const isUploading = uploadingTarget === `form-${field}`;

                return (
                  <div
                    key={field}
                    className="rounded-xl bg-[#040B16] border border-slate-800 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {isColor
                          ? t('الشعار الرسمي (ملون)', 'Official Color Logo')
                          : t('الشعار الذهبي / المائي (اختياري)', 'Gold / Watermark Logo (Optional)')}
                      </span>
                      {currentVal && (
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, [field]: '' })}
                          className="text-[11px] text-red-300 hover:underline cursor-pointer"
                        >
                          {t('مسح الصورة', 'Clear')}
                        </button>
                      )}
                    </div>

                    <div className="h-24 rounded-lg bg-[#071426] border border-slate-800/80 flex items-center justify-center p-3 overflow-hidden">
                      {currentVal ? (
                        <img
                          src={currentVal}
                          alt={editing.nameEn || 'Partner Logo'}
                          className="max-h-20 w-auto object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                          <ImagePlus className="w-5 h-5" />
                          <span>{t('لا توجد صورة مرفوعة', 'No image selected')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-gold-400/15 border border-gold-400/40 text-xs font-bold text-gold-300 hover:bg-gold-400/25 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isUploading
                            ? t('جارٍ الرفع...', 'Uploading...')
                            : t('رفع صورة من الجهاز', 'Upload Image')}
                        </span>
                        <input
                          type="file"
                          disabled={Boolean(uploadingTarget)}
                          accept=".png,.jpg,.jpeg,.webp,.svg"
                          onChange={(e) => handleFormLogoUpload(field, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setPickerTarget(pickerTarget === field ? null : field)}
                        className="px-3 py-2 rounded-lg bg-navy-900 border border-slate-700 text-xs font-bold text-slate-200 hover:border-gold-400/45 hover:text-gold-300 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{t('مكتبة الوسائط', 'Media Library')}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      dir="ltr"
                      placeholder={t('أو الصق رابط الصورة (https://...)', 'Or paste image URL (https://...)')}
                      value={currentVal}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#071426] border border-slate-800 text-xs text-slate-200"
                    />
                  </div>
                );
              })}
            </div>

            {/* Inline Media Library Picker */}
            {pickerTarget && (
              <div className="rounded-xl bg-[#040B16] border border-gold-400/45 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-300">
                    {t(
                      'اختر صورة من مكتبة الوسائط لتعيينها للشريك',
                      'Select an image from Media Library'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerTarget(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {mediaAssets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {t(
                      'لا توجد صور في مكتبة الوسائط بعد. يمكنك الرفع مباشرة من الزر أعلاه.',
                      'No images in Media Library yet. Use the Upload button above.'
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-1">
                    {mediaAssets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          setEditing({ ...editing, [pickerTarget]: asset.url });
                          setPickerTarget(null);
                        }}
                        className="group rounded-lg bg-[#071426] border border-slate-800 hover:border-gold-400 p-2 text-center space-y-1.5 cursor-pointer transition-colors"
                      >
                        <div className="h-12 flex items-center justify-center overflow-hidden">
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="max-h-11 w-auto object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">{asset.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setPickerTarget(null);
              }}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 cursor-pointer"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || Boolean(uploadingTarget)}
              className="btn-gold px-5 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الشريك', 'Save Partner')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Partner Cards Grid with Thumbnail & Quick Image Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partners.map((pt) => {
          const previewSrc = pt.colorLogoUrl || pt.watermarkLogoUrl;
          const isCardUploading = uploadingTarget === `card-${pt.id}`;

          return (
            <div
              key={pt.id}
              className="rounded-2xl surface-card card-gold-glow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-16 rounded-xl bg-[#040B16] border border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={lang === 'ar' ? pt.nameAr : pt.nameEn}
                      className="max-h-12 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="w-4 h-4 text-slate-500 mx-auto" />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {pt.abbr}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-gold-300">
                    <span>{pt.abbr} • {pt.category}</span>
                    {pt.status === 'draft' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                        draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-white truncate">
                    {lang === 'ar' ? pt.nameAr : pt.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {lang === 'ar' ? pt.relationshipAr : pt.relationshipEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <label
                  title={t('رفع صورة للشركة مباشرة', 'Upload logo directly')}
                  className="px-3 py-2 rounded-lg bg-gold-400/15 border border-gold-400/40 text-gold-300 hover:bg-gold-400/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isCardUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{t('رفع صورة', 'Logo')}</span>
                  <input
                    type="file"
                    disabled={Boolean(uploadingTarget)}
                    accept=".png,.jpg,.jpeg,.webp,.svg"
                    onChange={(e) => handleQuickCardLogoUpload(pt, e)}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  title={t('تعديل بيانات الشريك', 'Edit Partner')}
                  onClick={() => openEditorForPartner(pt)}
                  className="p-2 rounded-lg bg-navy-800 border border-gold-400/35 text-gold-300 hover:border-gold-400 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title={t('حذف الشريك', 'Delete Partner')}
                  onClick={() => deletePartnerItem(pt.id, pt.nameAr, pt.nameEn)}
                  className="p-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
