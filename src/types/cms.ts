export type Language = 'ar' | 'en';
export type PublishStatus = 'draft' | 'published';
export type UserRole = 'admin' | 'editor';
export type InquiryStatus =
  | 'new'
  | 'under_review'
  | 'contacted'
  | 'proposal_sent'
  | 'completed'
  | 'closed';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const BLUEPRINT_LIMITS = {
  idPattern: /^[a-zA-Z0-9_\-]+$/,
  emailPattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  datePattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  idMax: 128,
  slugMax: 80,
  titleMax: 200,
  summaryMax: 1200,
  bodyMax: 5000,
  messageMax: 3000,
  emailMax: 160,
  nameMax: 140,
  orgMax: 180,
  mediaUrlMax: 450000,
} as const;

export function sanitizeExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

export interface SiteSettings {
  id?: string;
  brandNameAr: string;
  brandNameEn: string;
  brandSubAr: string;
  brandSubEn: string;
  trademarkAr: string;
  trademarkEn: string;
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroDescAr: string;
  heroDescEn: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  linkedinUrl: string;
  addressAr: string;
  addressEn: string;
  ungmNumber: string;
  regNumber: string;
  commercialNumber: string;
  gcciNumber: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  seoKeywordsAr: string;
  seoKeywordsEn: string;
  logoNavUrl: string;
  logoHeroUrl: string;
  trustedBadgeUrl: string;
  updatedAt?: unknown;
}

export interface PageStructuredItem {
  id: string;
  code?: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  descAr: string;
  descEn: string;
  detailsAr?: string;
  detailsEn?: string;
  relatedServiceSlug?: string;
}

export interface PageSection {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  items?: PageStructuredItem[];
  status: PublishStatus;
  updatedAt?: unknown;
}

export interface ServiceItem {
  id: string;
  slug: string;
  order: number;
  isVipTrack: boolean;
  tag: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  targetAudienceAr?: string;
  targetAudienceEn?: string;
  solutionsAr?: string[];
  solutionsEn?: string[];
  deliverablesAr?: string[];
  deliverablesEn?: string[];
  status: PublishStatus;
  updatedAt?: unknown;
}

export interface ProjectItem {
  id: string;
  slug: string;
  order: number;
  isFlagship: boolean;
  sector: string;
  serviceSlug: string;
  periodAr: string;
  periodEn: string;
  clientAr: string;
  clientEn: string;
  titleAr: string;
  titleEn: string;
  challengeAr?: string;
  challengeEn?: string;
  roleAr?: string;
  roleEn?: string;
  solutionsAr?: string;
  solutionsEn?: string;
  metricsAr?: string[];
  metricsEn?: string[];
  imageUrl?: string;
  status: PublishStatus;
  updatedAt?: unknown;
}

export interface MetricDataPoint {
  labelAr: string;
  labelEn: string;
  value: number;
  unit?: string;
}

export interface ProjectMetricSet {
  id: string;
  key: string;
  order: number;
  chartType: 'bar' | 'area' | 'line';
  tabLabelAr: string;
  tabLabelEn: string;
  datasetLabelAr?: string;
  datasetLabelEn?: string;
  summaryTitleAr: string;
  summaryTitleEn: string;
  summaryKpiAr?: string;
  summaryKpiEn?: string;
  sourceNoteAr?: string;
  sourceNoteEn?: string;
  periodTag?: string;
  bulletsAr?: string[];
  bulletsEn?: string[];
  dataPoints: MetricDataPoint[];
  status: PublishStatus;
  updatedAt?: unknown;
}

export type PartnerCategory =
  | 'trusted_seal'
  | 'consortium'
  | 'digital_infra'
  | 'clients_ecosystem'
  | 'accreditation';

export interface PartnerItem {
  id: string;
  slug: string;
  order: number;
  category: PartnerCategory;
  abbr: string;
  nameAr: string;
  nameEn: string;
  relationshipAr: string;
  relationshipEn: string;
  detailsAr?: string;
  detailsEn?: string;
  colorLogoUrl?: string;
  watermarkLogoUrl?: string;
  websiteUrl?: string;
  status: PublishStatus;
  updatedAt?: unknown;
}

export interface TeamMember {
  id: string;
  order: number;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  badgeCode?: string;
  bioAr: string;
  bioEn: string;
  expertiseAr?: string[];
  expertiseEn?: string[];
  linkedinUrl?: string;
  photoUrl?: string;
  isPrimaryLeader: boolean;
  status: PublishStatus;
  updatedAt?: unknown;
}

export interface Inquiry {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  serviceInterest: string;
  message: string;
  language: Language;
  status: InquiryStatus;
  internalNotes?: string;
  assignedToUid?: string;
  assignedToName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppointmentSlot {
  id: string;
  dateIso: string;
  dayLabelAr: string;
  dayLabelEn: string;
  timeLabel: string;
  advisorAr: string;
  advisorEn: string;
  isAvailable: boolean;
  updatedAt?: unknown;
}

export interface Appointment {
  id: string;
  slotId: string;
  slotLabelAr?: string;
  slotLabelEn?: string;
  clientName: string;
  organization?: string;
  clientEmail: string;
  topic?: string;
  status: AppointmentStatus;
  internalNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserAccount {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  category: 'logo' | 'project' | 'document' | 'badge';
  mimeType: string;
  url: string;
  storagePath?: string;
  uploadedByUid: string;
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summaryAr: string;
  summaryEn: string;
  createdAt?: unknown;
}
