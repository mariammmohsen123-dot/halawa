/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicLayout } from './components/public/PublicLayout';
import { AppProvider } from './context/AppContext';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { HomePage } from './pages/public/HomePage';
import { LeadershipPage } from './pages/public/LeadershipPage';
import { PartnersPage } from './pages/public/PartnersPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { AdminGuard } from './pages/admin/AdminGuard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AppointmentsAdmin } from './pages/admin/AppointmentsAdmin';
import { InquiriesAdmin } from './pages/admin/InquiriesAdmin';
import { MediaAdmin } from './pages/admin/MediaAdmin';
import { MetricsAdmin } from './pages/admin/MetricsAdmin';
import { PagesAdmin } from './pages/admin/PagesAdmin';
import { PartnersAdmin } from './pages/admin/PartnersAdmin';
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin';
import { ServicesAdmin } from './pages/admin/ServicesAdmin';
import { SiteSettingsAdmin } from './pages/admin/SiteSettingsAdmin';
import { TeamAdmin } from './pages/admin/TeamAdmin';
import { UsersAndLogsAdmin } from './pages/admin/UsersAndLogsAdmin';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Multi-Page Corporate Website */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <AboutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/services"
              element={
                <PublicLayout>
                  <ServicesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/services/:slug"
              element={
                <PublicLayout>
                  <ServiceDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/projects"
              element={
                <PublicLayout>
                  <ProjectsPage />
                </PublicLayout>
              }
            />
            <Route
              path="/projects/:slug"
              element={
                <PublicLayout>
                  <ProjectDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/partners"
              element={
                <PublicLayout>
                  <PartnersPage />
                </PublicLayout>
              }
            />
            <Route
              path="/leadership"
              element={
                <PublicLayout>
                  <LeadershipPage />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              }
            />

            {/* Secured Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="inquiries" element={<InquiriesAdmin />} />
              <Route path="appointments" element={<AppointmentsAdmin />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="metrics" element={<MetricsAdmin />} />
              <Route path="pages" element={<PagesAdmin />} />
              <Route path="partners" element={<PartnersAdmin />} />
              <Route path="team" element={<TeamAdmin />} />
              <Route path="media" element={<MediaAdmin />} />
              <Route path="settings" element={<SiteSettingsAdmin />} />
              <Route path="users" element={<UsersAndLogsAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
