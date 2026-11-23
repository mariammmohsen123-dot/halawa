import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
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
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isBootstrapAdminEmail,
  OperationType,
} from '../lib/firebase';
import { seedBaselineDatabase } from '../lib/seedFirestore';
import {
  AppointmentSlot,
  Language,
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

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (ar: string, en: string) => string;
  // Auth & RBAC
  user: User | null;
  authReady: boolean;
  userRole: UserRole | null;
  userAccount: UserAccount | null;
  isAdmin: boolean;
  isStaff: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  // Public & Staff CMS state
  settings: SiteSettings;
  pages: PageSection[];
  services: ServiceItem[];
  projects: ProjectItem[];
  projectMetrics: ProjectMetricSet[];
  partners: PartnerItem[];
  teamMembers: TeamMember[];
  appointmentSlots: AppointmentSlot[];
  hasFirestoreSeeded: boolean;
  cmsLoading: boolean;
  isBookingOpen: boolean;
  openBookingModal: (preselectedTopic?: string) => void;
  closeBookingModal: () => void;
  bookingTopic: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userDocLoaded, setUserDocLoaded] = useState(false);

  const [settingsDoc, setSettingsDoc] = useState<SiteSettings | null>(null);
  const [pagesDocs, setPagesDocs] = useState<PageSection[]>([]);
  const [servicesDocs, setServicesDocs] = useState<ServiceItem[]>([]);
  const [projectsDocs, setProjectsDocs] = useState<ProjectItem[]>([]);
  const [metricsDocs, setMetricsDocs] = useState<ProjectMetricSet[]>([]);
  const [partnersDocs, setPartnersDocs] = useState<PartnerItem[]>([]);
  const [teamDocs, setTeamDocs] = useState<TeamMember[]>([]);
  const [slotsDocs, setSlotsDocs] = useState<AppointmentSlot[]>([]);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [hasFirestoreSeeded, setHasFirestoreSeeded] = useState(false);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState('');
  const autoSeededRef = useRef(false);

  const setLang = (next: Language) => {
    setLangState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setUserAccount(null);
        setUserDocLoaded(true);
      } else {
        setUserDocLoaded(false);
      }
    });
    return () => unsub();
  }, []);

  // Listen to signed-in user's RBAC record in users/{uid}
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserAccount({ id: snap.id, ...(snap.data() as Omit<UserAccount, 'id'>) });
        } else {
          setUserAccount(null);
        }
        setUserDocLoaded(true);
      },
      (err) => {
        console.warn('User profile listener notice:', err.message);
        setUserAccount(null);
        setUserDocLoaded(true);
      }
    );
    return () => unsub();
  }, [user]);

  const isBootstrapAdmin = Boolean(
    user && user.emailVerified && isBootstrapAdminEmail(user.email)
  );

  const userRole: UserRole | null = useMemo(() => {
    if (!user || !user.emailVerified) return null;
    if (isBootstrapAdmin) return 'admin';
    if (userAccount && userAccount.active) return userAccount.role;
    return null;
  }, [user, isBootstrapAdmin, userAccount]);

  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'admin' || userRole === 'editor';

  // Auto-seed Firestore baseline once when Admin logs in and site_settings/main doesn't exist
  useEffect(() => {
    if (!authReady || !userDocLoaded) return;
    if (isAdmin && !autoSeededRef.current) {
      autoSeededRef.current = true;
      seedBaselineDatabase(false).catch((err) => {
        console.error('Baseline seed warning:', err);
      });
    }
  }, [authReady, userDocLoaded, isAdmin]);

  // Public/Staff CMS real-time subscriptions
  // Wait for auth & userDocLoaded before querying unpublished docs as staff
  useEffect(() => {
    if (!authReady || (user && !userDocLoaded)) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'site_settings', 'main'),
        (snap) => {
          if (snap.exists()) {
            setSettingsDoc({ id: snap.id, ...(snap.data() as Omit<SiteSettings, 'id'>) });
            setHasFirestoreSeeded(true);
          } else {
            setSettingsDoc(null);
            setHasFirestoreSeeded(false);
          }
          setCmsLoading(false);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'site_settings/main')
      )
    );

    const makeQuery = (colName: string) =>
      isStaff
        ? collection(db, colName)
        : query(collection(db, colName), where('status', '==', 'published'));

    unsubs.push(
      onSnapshot(
        makeQuery('pages'),
        (snap) => {
          setPagesDocs(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PageSection, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'pages')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('services'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ServiceItem, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setServicesDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'services')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('projects'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ProjectItem, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setProjectsDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'projects')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('project_metrics'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ProjectMetricSet, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setMetricsDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'project_metrics')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('partners'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PartnerItem, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setPartnersDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'partners')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('team_members'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TeamMember, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setTeamDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'team_members')
      )
    );

    const slotsQuery = isStaff
      ? collection(db, 'appointment_slots')
      : query(collection(db, 'appointment_slots'), where('isAvailable', '==', true));

    unsubs.push(
      onSnapshot(
        slotsQuery,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AppointmentSlot, 'id'>),
          }));
          list.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
          setSlotsDocs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'appointment_slots')
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, user, userDocLoaded, isStaff]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const openBookingModal = (preselectedTopic = '') => {
    setBookingTopic(preselectedTopic);
    setIsBookingOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
  };

  // Fallback gracefully to verified institutional defaults until Firestore is seeded by an admin
  const settings = settingsDoc ?? DEFAULT_SITE_SETTINGS;
  const pages = hasFirestoreSeeded ? pagesDocs : DEFAULT_PAGES;
  const services = hasFirestoreSeeded ? servicesDocs : DEFAULT_SERVICES;
  const projects = hasFirestoreSeeded ? projectsDocs : DEFAULT_PROJECTS;
  const projectMetrics = hasFirestoreSeeded ? metricsDocs : DEFAULT_PROJECT_METRICS;
  const partners = hasFirestoreSeeded ? partnersDocs : DEFAULT_PARTNERS;
  const teamMembers = hasFirestoreSeeded ? teamDocs : DEFAULT_TEAM_MEMBERS;
  const appointmentSlots = hasFirestoreSeeded ? slotsDocs : DEFAULT_APPOINTMENT_SLOTS;

  const value: AppContextValue = {
    lang,
    setLang,
    toggleLang,
    t,
    user,
    authReady,
    userRole,
    userAccount,
    isAdmin,
    isStaff,
    signInWithGoogle,
    signInWithEmail,
    signOutUser,
    settings,
    pages,
    services,
    projects,
    projectMetrics,
    partners,
    teamMembers,
    appointmentSlots,
    hasFirestoreSeeded,
    cmsLoading,
    isBookingOpen,
    openBookingModal,
    closeBookingModal,
    bookingTopic,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
