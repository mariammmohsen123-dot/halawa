import React, { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Activity, Database, Plus, Shield, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { deleteUserAccount, saveUserAccount } from '../../lib/firestoreActions';
import { seedBaselineDatabase } from '../../lib/seedFirestore';
import { ActivityLog, UserAccount, UserRole } from '../../types/cms';

export function UsersAndLogsAdmin() {
  const { lang, t, isAdmin, user } = useApp();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [newUid, setNewUid] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [savingUser, setSavingUser] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    const u1 = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserAccount, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    const u2 = onSnapshot(
      query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'activity_logs')
    );

    return () => {
      u1();
      u2();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl surface-card p-8 text-center text-sm text-amber-200">
        {t(
          'إدارة حسابات الموظفين وسجل التدقيق مقتصرة على المدير العام (Admin).',
          'Staff RBAC management and full audit logs are restricted to Admins.'
        )}
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    setFeedback('');
    try {
      await saveUserAccount(
        {
          uid: newUid,
          email: newEmail,
          displayName: newName,
          role: newRole,
          active: true,
        },
        true
      );
      setNewUid('');
      setNewEmail('');
      setNewName('');
      setFeedback(t('تمت إضافة صلاحيات المستخدم بنجاح.', 'Staff user permissions granted.'));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleActive = async (u: UserAccount) => {
    await saveUserAccount(
      {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        active: !u.active,
      },
      false
    );
  };

  const handleRoleChange = async (u: UserAccount, role: UserRole) => {
    await saveUserAccount(
      {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        role,
        active: u.active,
      },
      false
    );
  };

  const handleReseed = async () => {
    const res = await seedBaselineDatabase(true);
    setFeedback(
      t(
        `تمت إعادة مزامنة ${res.count} سجل رسمي بنجاح.`,
        `Resynced ${res.count} baseline records.`
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('إدارة الصلاحيات (RBAC) وسجل التدقيق', 'Users, RBAC & Audit Logs')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'منح وإلغاء صلاحيات Admin/Editor ومراقبة سجل التعديلات غير القابل للحذف.',
              'Manage Admin/Editor access permissions and inspect immutable system audit logs.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReseed}
          className="px-4 py-2.5 rounded-xl bg-navy-800 border border-gold-400/40 text-xs font-bold text-gold-300 inline-flex items-center gap-2 cursor-pointer self-start"
        >
          <Database className="w-4 h-4" />
          <span>{t('استعادة البيانات التأسيسية', 'Restore Official Baseline')}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-xs text-emerald-200">
          {feedback}
        </div>
      )}

      {/* Grant Role Form */}
      <form onSubmit={handleAddUser} className="rounded-2xl surface-card p-6 space-y-4">
        <h2 className="text-base font-extrabold text-gold-300 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{t('إضافة محرر أو مدير جديد (Firebase UID)', 'Grant Staff Role by Firebase UID')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Firebase Auth UID"
            value={newUid}
            onChange={(e) => setNewUid(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
          />
          <input
            type="text"
            required
            placeholder={t('الاسم الظاهر', 'Display Name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className="px-3 py-2 rounded-lg bg-[#040B16] border border-slate-700 text-sm text-white"
          >
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={savingUser}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          {savingUser ? t('جارٍ الحفظ...', 'Saving...') : t('منح الصلاحية', 'Grant Access')}
        </button>
      </form>

      {/* Staff Users List */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold-300" />
          <span>{t('المستخدمون المفوضون', 'Authorized Staff Accounts')}</span>
        </h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl surface-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">{u.displayName}</span>
                  <span className="text-xs font-mono text-gold-300">{u.email}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">UID: {u.uid}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#040B16] border border-slate-700 text-xs text-white"
                >
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleToggleActive(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    u.active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {u.active ? t('مفعّل', 'Active') : t('معطّل', 'Disabled')}
                </button>
                {u.uid !== user?.uid && (
                  <button
                    type="button"
                    onClick={() => deleteUserAccount(u.uid, u.email)}
                    className="p-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold-300" />
          <span>{t('سجل النشاط والتدقيق (آخر 50 عملية)', 'Immutable Audit Trail (Latest 50)')}</span>
        </h2>
        <div className="rounded-2xl surface-card overflow-hidden">
          <div className="divide-y divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono text-gold-300">
                    {log.action} • <span className="text-slate-400">{log.entityType}/{log.entityId}</span>
                  </div>
                  <div className="text-slate-200">
                    {lang === 'ar' ? log.summaryAr : log.summaryEn}
                  </div>
                </div>
                <div className="font-mono text-slate-400 shrink-0">{log.actorEmail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
