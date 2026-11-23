import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Download, Search, Trash2, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  deleteInquiryAdmin,
  exportRowsToCsv,
  updateInquiryAdmin,
} from '../../lib/firestoreActions';
import { Inquiry, InquiryStatus } from '../../types/cms';

const STATUS_OPTIONS: InquiryStatus[] = [
  'new',
  'under_review',
  'contacted',
  'proposal_sent',
  'completed',
  'closed',
];

export function InquiriesAdmin() {
  const { t, isAdmin, user } = useApp();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<InquiryStatus>('new');
  const [draftNotes, setDraftNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries')
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchStatus = statusFilter === 'all' || inq.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        inq.fullName.toLowerCase().includes(q) ||
        inq.organization.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.serviceInterest.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [inquiries, statusFilter, searchTerm]);

  const startEdit = (inq: Inquiry) => {
    setEditingId(inq.id);
    setDraftStatus(inq.status);
    setDraftNotes(inq.internalNotes || '');
  };

  const handleSave = async (inq: Inquiry) => {
    setSaving(true);
    try {
      await updateInquiryAdmin(inq, {
        status: draftStatus,
        internalNotes: draftNotes,
        assignedToUid: user?.uid || '',
        assignedToName: user?.displayName || user?.email || 'HCC Staff',
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      `hcc-inquiries-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Full Name', 'Organization', 'Email', 'Service', 'Status', 'Language', 'Message', 'Internal Notes'],
      filtered.map((i) => [
        i.id,
        i.fullName,
        i.organization,
        i.email,
        i.serviceInterest,
        i.status,
        i.language,
        i.message,
        i.internalNotes || '',
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('إدارة طلبات الاستشارة والعروض (CRM)', 'Inquiries & RFP Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'مراجعة طلبات العملاء، تحديث حالات المتابعة، تدوين الملاحظات الداخلية، وتصدير السجلات.',
              'Review client briefs, advance workflow statuses, record internal notes, and export records.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-navy-800 border border-gold-400/40 text-xs font-bold text-gold-300 hover:bg-navy-700 inline-flex items-center gap-2 cursor-pointer self-start"
        >
          <Download className="w-4 h-4" />
          <span>{t('تصدير CSV', 'Export CSV')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl surface-card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('بحث بالاسم، الجهة، البريد، أو الخدمة...', 'Search name, organization, email, or service...')}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | InquiryStatus)}
          className="px-4 py-2.5 rounded-xl bg-[#040B16] border border-slate-700 text-sm text-white focus:border-gold-400 focus:outline-none"
        >
          <option value="all">{t('كافة الحالات', 'All Statuses')}</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl surface-card p-10 text-center text-sm text-slate-400">
          {t('لا توجد طلبات استشارة مطابقة حالياً.', 'No matching inquiries found.')}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => {
            const isEditing = editingId === inq.id;
            const lockedForEditor = !isAdmin && inq.status === 'closed';

            return (
              <div key={inq.id} className="rounded-2xl surface-card p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{inq.fullName}</h3>
                      <span className="text-xs text-gold-300 font-semibold">• {inq.organization}</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-navy-900 border border-slate-700 text-[11px] font-mono text-emerald-300">
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                      <span className="ltr-inline">{inq.email}</span>
                      <span>|</span>
                      <span className="text-slate-200">{inq.serviceInterest}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!lockedForEditor && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(inq)}
                        className="px-3.5 py-2 rounded-lg bg-navy-800 border border-gold-400/35 text-xs font-bold text-gold-300 hover:bg-navy-700 cursor-pointer"
                      >
                        {t('تحديث الحالة / ملاحظة', 'Update Status')}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteInquiryAdmin(inq.id, inq.fullName)}
                        aria-label="Delete inquiry"
                        className="p-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-200 bg-[#040B16] border border-slate-800 rounded-xl p-4 leading-relaxed">
                  {inq.message}
                </p>

                {inq.internalNotes && !isEditing && (
                  <div className="text-xs text-slate-300 bg-navy-900/70 border border-slate-800 rounded-lg p-3">
                    <strong className="text-gold-300">{t('ملاحظة داخلية:', 'Internal Note:')}</strong>{' '}
                    {inq.internalNotes}
                  </div>
                )}

                {isEditing && (
                  <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('الحالة الجديدة', 'New Status')}
                      </label>
                      <select
                        value={draftStatus}
                        onChange={(e) => setDraftStatus(e.target.value as InquiryStatus)}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('ملاحظات فريق العمل', 'Internal Team Notes')}
                      </label>
                      <input
                        type="text"
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder={t('ملاحظة المتابعة...', 'Follow-up note...')}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
                      />
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(inq)}
                        className="flex-1 btn-gold py-2.5 px-4 rounded-lg text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t('حفظ', 'Save')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 cursor-pointer"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
