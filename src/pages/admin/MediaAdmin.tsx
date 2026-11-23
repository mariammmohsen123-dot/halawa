import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Copy, Plus, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, handleFirestoreError, OperationType, storage } from '../../lib/firebase';
import { createMediaAsset, deleteMediaAsset } from '../../lib/firestoreActions';
import { BLUEPRINT_LIMITS, MediaAsset, sanitizeExternalUrl } from '../../types/cms';

export function MediaAdmin() {
  const { t, user } = useApp();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'logo' | 'project' | 'document' | 'badge'>('logo');
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'media'), orderBy('createdAt', 'desc')),
      (snap) => {
        setAssets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'media')
    );
    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFeedback('');

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFeedback(t('صيغة الملف غير مدعومة (PNG/JPG/WEBP/SVG/PDF فقط).', 'Unsupported MIME type.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback(t('الحد الأقصى لحجم الملف 5 ميجابايت.', 'Maximum file size is 5 MB.'));
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `hcc-media/${Date.now()}_${safeName}`;
      let downloadUrl = '';
      let usedStoragePath: string | undefined = undefined;

      try {
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file, { contentType: file.type });
        downloadUrl = await getDownloadURL(storageRef);
        usedStoragePath = storagePath;
      } catch {
        // Fallback for environments where Storage bucket CORS isn't enabled yet:
        if (file.size <= 280000) {
          downloadUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
          });
        } else {
          throw new Error(
            t(
              'تعذر الرفع إلى Storage. استخدم ملفاً أصغر من 280KB أو أضف رابطاً خارجياً موثوقاً.',
              'Storage upload unavailable. Use a file under 280KB or register a verified HTTPS URL.'
            )
          );
        }
      }

      if (downloadUrl.length > BLUEPRINT_LIMITS.mediaUrlMax) {
        throw new Error(t('طول رابط الملف يتجاوز الحد المسموح.', 'Encoded URL exceeds limit.'));
      }

      await createMediaAsset({
        name: (name.trim() || file.name).slice(0, 160),
        category,
        mimeType: file.type,
        url: downloadUrl,
        storagePath: usedStoragePath,
        uploadedByUid: user.uid,
      });

      setName('');
      setFeedback(t('تم رفع وتسجيل الملف بنجاح.', 'Media asset uploaded and registered.'));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRegisterExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFeedback('');
    const safe = sanitizeExternalUrl(externalUrl);
    if (!safe) {
      setFeedback(t('يرجى إدخال رابط HTTPS صالح.', 'Please enter a valid HTTPS URL.'));
      return;
    }

    setUploading(true);
    try {
      await createMediaAsset({
        name: (name.trim() || 'External Media Asset').slice(0, 160),
        category,
        mimeType: 'image/url',
        url: safe,
        uploadedByUid: user.uid,
      });
      setName('');
      setExternalUrl('');
      setFeedback(t('تم تسجيل الرابط في مكتبة الوسائط بنجاح.', 'External asset registered.'));
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (asset.storagePath) {
      try {
        await deleteObject(ref(storage, asset.storagePath));
      } catch {
        // Ignore if already removed in Storage
      }
    }
    await deleteMediaAsset(asset.id, asset.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          {t('مكتبة الوسائط والشعارات', 'Media & Assets Library')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {t(
            'رفع الشعارات الرسمية وصور المشاريع أو تسجيل روابط الصور المعتمدة لربطها بالخدمات والفريق والشركاء.',
            'Upload official logos and project assets or register verified URLs for CMS reuse.'
          )}
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-navy-800 border border-gold-400/35 text-xs text-gold-200">
          {feedback}
        </div>
      )}

      {/* Upload / Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl surface-card p-6 space-y-4">
          <h2 className="text-base font-extrabold text-gold-300 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>{t('رفع ملف مباشر', 'Upload Media File')}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t('اسم الملف (اختياري)', 'Asset label (optional)')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'logo' | 'project' | 'document' | 'badge')
              }
              className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
            >
              <option value="logo">logo</option>
              <option value="badge">badge</option>
              <option value="project">project</option>
              <option value="document">document</option>
            </select>
          </div>
          <label className="block w-full rounded-xl border border-dashed border-gold-400/45 bg-[#040B16] p-5 text-center cursor-pointer hover:border-gold-400 transition-colors">
            <span className="text-xs font-bold text-gold-300 block">
              {uploading
                ? t('جارٍ الرفع...', 'Uploading...')
                : t('اختر ملفاً (PNG, JPG, WEBP, SVG, PDF)', 'Choose File (PNG, JPG, WEBP, SVG, PDF)')}
            </span>
            <input
              type="file"
              disabled={uploading}
              accept=".png,.jpg,.jpeg,.webp,.svg,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleRegisterExternal} className="rounded-2xl surface-card p-6 space-y-4">
          <h2 className="text-base font-extrabold text-gold-300 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('تسجيل رابط خارجي موثوق (HTTPS)', 'Register External HTTPS URL')}</span>
          </h2>
          <input
            type="text"
            required
            placeholder={t('اسم الأصل', 'Asset Name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
          />
          <input
            type="url"
            required
            placeholder="https://..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white ltr-inline text-start"
          />
          <button
            type="submit"
            disabled={uploading}
            className="btn-gold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            {t('حفظ الرابط في المكتبة', 'Register Asset URL')}
          </button>
        </form>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="rounded-2xl surface-card p-8 text-center text-sm text-slate-400">
          {t('لا توجد ملفات مرفوعة في المكتبة بعد.', 'No media assets uploaded yet.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-2xl surface-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-32 rounded-xl bg-[#040B16] border border-slate-800 flex items-center justify-center overflow-hidden p-2">
                  {asset.mimeType === 'application/pdf' ? (
                    <span className="text-xs font-mono text-gold-300">PDF Document</span>
                  ) : (
                    <img src={asset.url} alt={asset.name} className="max-h-28 w-auto object-contain" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{asset.name}</span>
                  <span className="font-mono text-gold-300">{asset.category}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCopy(asset.id, asset.url)}
                  className="text-xs font-bold text-gold-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === asset.id ? t('تم النسخ!', 'Copied!') : t('نسخ الرابط', 'Copy URL')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(asset)}
                  className="p-1.5 rounded-lg text-red-300 hover:bg-red-500/15 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
