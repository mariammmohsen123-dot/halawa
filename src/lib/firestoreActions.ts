import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  BLUEPRINT_LIMITS,
  Inquiry,
  InquiryStatus,
  Language,
  MediaAsset,
  PageSection,
  PartnerItem,
  ProjectItem,
  ProjectMetricSet,
  ServiceItem,
  SiteSettings,
  TeamMember,
  UserAccount,
  UserRole,
} from '../types/cms';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function slugifySafeId(raw: string, fallbackPrefix: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  if (cleaned && BLUEPRINT_LIMITS.idPattern.test(cleaned)) {
    return cleaned;
  }
  return makeSafeId(fallbackPrefix);
}

export async function logAdminActivity(params: {
  action: string;
  entityType: string;
  entityId: string;
  summaryAr: string;
  summaryEn: string;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const logId = makeSafeId('log');
  try {
    await setDoc(doc(db, 'activity_logs', logId), {
      actorUid: currentUser.uid,
      actorEmail: currentUser.email || 'staff@halawacc.com',
      action: params.action.slice(0, 80),
      entityType: params.entityType.slice(0, 60),
      entityId: params.entityId.slice(0, 128),
      summaryAr: params.summaryAr.slice(0, 300),
      summaryEn: params.summaryEn.slice(0, 300),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Activity log write skipped:', err);
  }
}

export async function submitPublicInquiry(input: {
  fullName: string;
  organization: string;
  email: string;
  serviceInterest: string;
  message: string;
  language: Language;
}): Promise<string> {
  const fullName = input.fullName.trim();
  const organization = input.organization.trim();
  const email = input.email.trim();
  const serviceInterest = input.serviceInterest.trim();
  const message = input.message.trim();

  if (fullName.length < 2 || fullName.length > BLUEPRINT_LIMITS.nameMax) {
    throw new Error('Invalid full name length.');
  }
  if (organization.length < 2 || organization.length > BLUEPRINT_LIMITS.orgMax) {
    throw new Error('Invalid organization length.');
  }
  if (!BLUEPRINT_LIMITS.emailPattern.test(email) || email.length > BLUEPRINT_LIMITS.emailMax) {
    throw new Error('Invalid email address.');
  }
  if (serviceInterest.length < 2 || serviceInterest.length > 200) {
    throw new Error('Invalid service selection.');
  }
  if (message.length < 5 || message.length > BLUEPRINT_LIMITS.messageMax) {
    throw new Error('Invalid message length.');
  }

  const inquiryId = makeSafeId('inq');
  try {
    await setDoc(doc(db, 'inquiries', inquiryId), {
      fullName,
      organization,
      email,
      serviceInterest,
      message,
      language: input.language,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return inquiryId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiryId}`);
  }
}

export async function bookPublicAppointment(input: {
  slot: AppointmentSlot;
  clientName: string;
  organization?: string;
  clientEmail: string;
  topic?: string;
}): Promise<string> {
  const clientName = input.clientName.trim();
  const clientEmail = input.clientEmail.trim();
  const organization = input.organization?.trim() || '';
  const topic = input.topic?.trim() || '';

  if (clientName.length < 2 || clientName.length > BLUEPRINT_LIMITS.nameMax) {
    throw new Error('Invalid client name.');
  }
  if (!BLUEPRINT_LIMITS.emailPattern.test(clientEmail) || clientEmail.length > BLUEPRINT_LIMITS.emailMax) {
    throw new Error('Invalid client email.');
  }

  const appointmentId = makeSafeId('appt');
  const payload = stripUndefined({
    slotId: input.slot.id,
    slotLabelAr: `${input.slot.dayLabelAr} • ${input.slot.timeLabel}`.slice(0, 120),
    slotLabelEn: `${input.slot.dayLabelEn} • ${input.slot.timeLabel}`.slice(0, 120),
    clientName,
    organization: organization ? organization.slice(0, 180) : undefined,
    clientEmail,
    topic: topic ? topic.slice(0, 500) : undefined,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'appointments', appointmentId), payload);
    return appointmentId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `appointments/${appointmentId}`);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { id: _id, updatedAt: _u, ...rest } = settings;
  const payload = stripUndefined({
    ...rest,
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'site_settings', 'main'), payload);
    await logAdminActivity({
      action: 'UPDATE_SITE_SETTINGS',
      entityType: 'site_settings',
      entityId: 'main',
      summaryAr: 'تحديث الإعدادات المؤسسية العامة وبيانات التواصل وSEO',
      summaryEn: 'Updated corporate site settings, contacts, and SEO metadata',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
  }
}

export async function savePageSection(page: PageSection, isNew = false): Promise<void> {
  const docId = slugifySafeId(page.id || page.slug, 'page');
  const { id: _id, updatedAt: _u, ...rest } = page;
  const payload = stripUndefined({
    ...rest,
    slug: docId,
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'pages', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_PAGE_SECTION' : 'UPDATE_PAGE_SECTION',
      entityType: 'pages',
      entityId: docId,
      summaryAr: `تحديث قسم الصفحة: ${page.titleAr}`,
      summaryEn: `Updated page section: ${page.titleEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `pages/${docId}`);
  }
}

export async function saveServiceItem(service: ServiceItem, isNew = false): Promise<string> {
  const docId = slugifySafeId(service.id || service.slug, 'svc');
  const { id: _id, updatedAt: _u, ...rest } = service;
  const payload = stripUndefined({
    ...rest,
    slug: slugifySafeId(service.slug || docId, 'svc'),
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'services', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_SERVICE' : 'UPDATE_SERVICE',
      entityType: 'services',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} خدمة: ${service.titleAr}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} service: ${service.titleEn}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `services/${docId}`);
  }
}

export async function deleteServiceItem(id: string, titleAr: string, titleEn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'services', id));
    await logAdminActivity({
      action: 'DELETE_SERVICE',
      entityType: 'services',
      entityId: id,
      summaryAr: `حذف خدمة: ${titleAr}`,
      summaryEn: `Deleted service: ${titleEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
  }
}

export async function saveProjectItem(project: ProjectItem, isNew = false): Promise<string> {
  const docId = slugifySafeId(project.id || project.slug, 'proj');
  const { id: _id, updatedAt: _u, ...rest } = project;
  const payload = stripUndefined({
    ...rest,
    slug: slugifySafeId(project.slug || docId, 'proj'),
    serviceSlug: slugifySafeId(project.serviceSlug || 'clusters-recovery', 'svc'),
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'projects', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_PROJECT' : 'UPDATE_PROJECT',
      entityType: 'projects',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} مشروع: ${project.titleAr}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} project: ${project.titleEn}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `projects/${docId}`);
  }
}

export async function deleteProjectItem(id: string, titleAr: string, titleEn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
    await logAdminActivity({
      action: 'DELETE_PROJECT',
      entityType: 'projects',
      entityId: id,
      summaryAr: `حذف مشروع: ${titleAr}`,
      summaryEn: `Deleted project: ${titleEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
  }
}

export async function saveMetricSet(metric: ProjectMetricSet, isNew = false): Promise<string> {
  const docId = slugifySafeId(metric.id || metric.key, 'metric');
  const { id: _id, updatedAt: _u, ...rest } = metric;
  const payload = stripUndefined({
    ...rest,
    key: slugifySafeId(metric.key || docId, 'metric'),
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'project_metrics', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_METRIC_SET' : 'UPDATE_METRIC_SET',
      entityType: 'project_metrics',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} مؤشرات قياس: ${metric.tabLabelAr}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} metric dataset: ${metric.tabLabelEn}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `project_metrics/${docId}`);
  }
}

export async function deleteMetricSet(id: string, labelAr: string, labelEn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'project_metrics', id));
    await logAdminActivity({
      action: 'DELETE_METRIC_SET',
      entityType: 'project_metrics',
      entityId: id,
      summaryAr: `حذف مجموعة مؤشرات: ${labelAr}`,
      summaryEn: `Deleted metric dataset: ${labelEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `project_metrics/${id}`);
  }
}

export async function savePartnerItem(partner: PartnerItem, isNew = false): Promise<string> {
  const docId = slugifySafeId(partner.id || partner.slug, 'partner');
  const { id: _id, updatedAt: _u, ...rest } = partner;
  const payload = stripUndefined({
    ...rest,
    slug: slugifySafeId(partner.slug || docId, 'partner'),
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'partners', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_PARTNER' : 'UPDATE_PARTNER',
      entityType: 'partners',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} شريك/اعتماد: ${partner.nameAr}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} partner: ${partner.nameEn}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `partners/${docId}`);
  }
}

export async function deletePartnerItem(id: string, nameAr: string, nameEn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'partners', id));
    await logAdminActivity({
      action: 'DELETE_PARTNER',
      entityType: 'partners',
      entityId: id,
      summaryAr: `حذف شريك: ${nameAr}`,
      summaryEn: `Deleted partner: ${nameEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `partners/${id}`);
  }
}

export async function saveTeamMember(member: TeamMember, isNew = false): Promise<string> {
  const docId = member.id && BLUEPRINT_LIMITS.idPattern.test(member.id)
    ? member.id
    : makeSafeId('leader');
  const { id: _id, updatedAt: _u, ...rest } = member;
  const payload = stripUndefined({
    ...rest,
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'team_members', docId), payload);
    await logAdminActivity({
      action: isNew ? 'CREATE_TEAM_MEMBER' : 'UPDATE_TEAM_MEMBER',
      entityType: 'team_members',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} عضو قيادة: ${member.nameAr}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} team member: ${member.nameEn}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `team_members/${docId}`);
  }
}

export async function deleteTeamMember(id: string, nameAr: string, nameEn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'team_members', id));
    await logAdminActivity({
      action: 'DELETE_TEAM_MEMBER',
      entityType: 'team_members',
      entityId: id,
      summaryAr: `حذف عضو قيادة: ${nameAr}`,
      summaryEn: `Deleted team member: ${nameEn}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `team_members/${id}`);
  }
}

export async function updateInquiryAdmin(
  inquiry: Inquiry,
  updates: {
    status: InquiryStatus;
    internalNotes?: string;
    assignedToUid?: string;
    assignedToName?: string;
  }
): Promise<void> {
  const payload = stripUndefined({
    status: updates.status,
    internalNotes: updates.internalNotes ?? inquiry.internalNotes ?? '',
    assignedToUid: updates.assignedToUid ?? inquiry.assignedToUid ?? '',
    assignedToName: updates.assignedToName ?? inquiry.assignedToName ?? '',
    updatedAt: serverTimestamp(),
  });
  try {
    await updateDoc(doc(db, 'inquiries', inquiry.id), payload);
    await logAdminActivity({
      action: 'UPDATE_INQUIRY_STATUS',
      entityType: 'inquiries',
      entityId: inquiry.id,
      summaryAr: `تحديث حالة طلب ${inquiry.fullName} إلى ${updates.status}`,
      summaryEn: `Updated inquiry ${inquiry.fullName} status to ${updates.status}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiry.id}`);
  }
}

export async function deleteInquiryAdmin(id: string, fullName: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'inquiries', id));
    await logAdminActivity({
      action: 'DELETE_INQUIRY',
      entityType: 'inquiries',
      entityId: id,
      summaryAr: `حذف طلب استشارة: ${fullName}`,
      summaryEn: `Deleted inquiry: ${fullName}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
  }
}

export async function saveAppointmentSlot(slot: AppointmentSlot, isNew = false): Promise<string> {
  const docId = slot.id && BLUEPRINT_LIMITS.idPattern.test(slot.id)
    ? slot.id
    : makeSafeId('slot');
  const { id: _id, updatedAt: _u, ...rest } = slot;
  try {
    await setDoc(doc(db, 'appointment_slots', docId), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
    await logAdminActivity({
      action: isNew ? 'CREATE_SLOT' : 'UPDATE_SLOT',
      entityType: 'appointment_slots',
      entityId: docId,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} موعد استشارة: ${slot.dateIso} ${slot.timeLabel}`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} consultation slot: ${slot.dateIso} ${slot.timeLabel}`,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `appointment_slots/${docId}`);
  }
}

export async function deleteAppointmentSlot(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'appointment_slots', id));
    await logAdminActivity({
      action: 'DELETE_SLOT',
      entityType: 'appointment_slots',
      entityId: id,
      summaryAr: `حذف موعد متاح (${id})`,
      summaryEn: `Deleted consultation slot (${id})`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `appointment_slots/${id}`);
  }
}

export async function updateAppointmentAdmin(
  appointment: Appointment,
  updates: {
    status: AppointmentStatus;
    internalNotes?: string;
  }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'appointments', appointment.id), {
      status: updates.status,
      internalNotes: updates.internalNotes ?? appointment.internalNotes ?? '',
      updatedAt: serverTimestamp(),
    });
    await logAdminActivity({
      action: 'UPDATE_APPOINTMENT',
      entityType: 'appointments',
      entityId: appointment.id,
      summaryAr: `تحديث حجز ${appointment.clientName} إلى ${updates.status}`,
      summaryEn: `Updated booking for ${appointment.clientName} to ${updates.status}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointment.id}`);
  }
}

export async function deleteAppointmentAdmin(id: string, clientName: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'appointments', id));
    await logAdminActivity({
      action: 'DELETE_APPOINTMENT',
      entityType: 'appointments',
      entityId: id,
      summaryAr: `حذف حجز استشارة: ${clientName}`,
      summaryEn: `Deleted consultation booking: ${clientName}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
  }
}

export async function createMediaAsset(input: Omit<MediaAsset, 'id' | 'createdAt'>): Promise<string> {
  const mediaId = makeSafeId('media');
  const payload = stripUndefined({
    ...input,
    createdAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'media', mediaId), payload);
    await logAdminActivity({
      action: 'CREATE_MEDIA',
      entityType: 'media',
      entityId: mediaId,
      summaryAr: `إضافة ملف وسائط: ${input.name}`,
      summaryEn: `Registered media asset: ${input.name}`,
    });
    return mediaId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `media/${mediaId}`);
  }
}

export async function deleteMediaAsset(id: string, name: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'media', id));
    await logAdminActivity({
      action: 'DELETE_MEDIA',
      entityType: 'media',
      entityId: id,
      summaryAr: `حذف ملف وسائط: ${name}`,
      summaryEn: `Deleted media asset: ${name}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `media/${id}`);
  }
}

export async function saveUserAccount(
  userAcc: {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    active: boolean;
  },
  isNew: boolean
): Promise<void> {
  const cleanUid = userAcc.uid.trim();
  try {
    if (isNew) {
      await setDoc(doc(db, 'users', cleanUid), {
        uid: cleanUid,
        email: userAcc.email.trim(),
        displayName: userAcc.displayName.trim(),
        role: userAcc.role,
        active: userAcc.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'users', cleanUid), {
        email: userAcc.email.trim(),
        displayName: userAcc.displayName.trim(),
        role: userAcc.role,
        active: userAcc.active,
        updatedAt: serverTimestamp(),
      });
    }
    await logAdminActivity({
      action: isNew ? 'CREATE_STAFF_USER' : 'UPDATE_STAFF_USER',
      entityType: 'users',
      entityId: cleanUid,
      summaryAr: `${isNew ? 'إضافة' : 'تحديث'} صلاحيات مستخدم: ${userAcc.email} (${userAcc.role})`,
      summaryEn: `${isNew ? 'Created' : 'Updated'} staff permissions: ${userAcc.email} (${userAcc.role})`,
    });
  } catch (err) {
    handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `users/${cleanUid}`);
  }
}

export async function deleteUserAccount(uid: string, email: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
    await logAdminActivity({
      action: 'DELETE_STAFF_USER',
      entityType: 'users',
      entityId: uid,
      summaryAr: `إلغاء حساب مستخدم: ${email}`,
      summaryEn: `Removed staff user: ${email}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
  }
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]): void {
  const escapeCell = (val: string | number | undefined | null) => {
    const str = String(val ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };
  const csvBody = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
