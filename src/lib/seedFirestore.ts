import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import {
  DEFAULT_APPOINTMENT_SLOTS,
  DEFAULT_PAGES,
  DEFAULT_PARTNERS,
  DEFAULT_PROJECTS,
  DEFAULT_PROJECT_METRICS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TEAM_MEMBERS,
} from '../data/seedData';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export async function seedBaselineDatabase(force = false): Promise<{ seeded: boolean; count: number }> {
  try {
    if (!force) {
      const settingsSnap = await getDoc(doc(db, 'site_settings', 'main'));
      if (settingsSnap.exists()) {
        return { seeded: false, count: 0 };
      }
    }

    const batch = writeBatch(db);
    let count = 0;

    // 1. Site Settings
    const { id: _id, ...settingsPayload } = DEFAULT_SITE_SETTINGS;
    batch.set(doc(db, 'site_settings', 'main'), {
      ...settingsPayload,
      updatedAt: serverTimestamp(),
    });
    count++;

    // 2. Pages
    for (const p of DEFAULT_PAGES) {
      const { id, ...rest } = p;
      batch.set(doc(db, 'pages', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 3. Services
    for (const s of DEFAULT_SERVICES) {
      const { id, ...rest } = s;
      batch.set(doc(db, 'services', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 4. Projects
    for (const pr of DEFAULT_PROJECTS) {
      const { id, ...rest } = pr;
      batch.set(doc(db, 'projects', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 5. Project Metrics
    for (const m of DEFAULT_PROJECT_METRICS) {
      const { id, ...rest } = m;
      batch.set(doc(db, 'project_metrics', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 6. Partners
    for (const pt of DEFAULT_PARTNERS) {
      const { id, ...rest } = pt;
      batch.set(doc(db, 'partners', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 7. Team Members
    for (const tm of DEFAULT_TEAM_MEMBERS) {
      const { id, ...rest } = tm;
      batch.set(doc(db, 'team_members', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 8. Appointment Slots
    for (const slot of DEFAULT_APPOINTMENT_SLOTS) {
      const { id, ...rest } = slot;
      batch.set(doc(db, 'appointment_slots', id), {
        ...rest,
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // 9. Activity Log
    if (auth.currentUser) {
      const logId = `seed_${Date.now()}`;
      batch.set(doc(db, 'activity_logs', logId), {
        actorUid: auth.currentUser.uid,
        actorEmail: auth.currentUser.email || 'admin@halawacc.com',
        action: force ? 'RESET_BASELINE' : 'INITIAL_SEED',
        entityType: 'system',
        entityId: 'main',
        summaryAr: 'تهيئة ومزامنة البيانات المؤسسية الرسمية لشركة HCC في قاعدة البيانات',
        summaryEn: 'Seeded official HCC institutional baseline data into Firestore',
        createdAt: serverTimestamp(),
      });
      count++;
    }

    await batch.commit();
    return { seeded: true, count };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
  }
}
