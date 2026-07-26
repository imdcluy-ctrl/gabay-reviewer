import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserProfile } from './hooks/useUserProfile';
import { useTheme } from './hooks/useTheme';
import { seedDatabase } from './lib/seed';
import { analytics } from './lib/analytics';
import { EVENTS } from './lib/events';
import { Welcome } from './pages/Welcome';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { CategoryList } from './pages/CategoryList';
import { StudySession } from './pages/StudySession';
import { Statistics } from './pages/Statistics';
import { Profile } from './pages/Profile';
import { ReviewQueue } from './pages/ReviewQueue';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AdminDashboard } from './pages/AdminDashboard';
import { Achievements } from './pages/Achievements';
import { QuickHelp } from './pages/QuickHelp';

const MockExamSession = React.lazy(() => import('./pages/MockExamSession'));
const MockExamResults = React.lazy(() => import('./pages/MockExamResults'));
const ExamReview = React.lazy(() => import('./pages/ExamReview'));
const ExamHistory = React.lazy(() => import('./pages/ExamHistory'));
const AnxietyHub = React.lazy(() => import('./pages/AnxietyHub'));
const CheckoutReturn = React.lazy(() => import('./pages/CheckoutReturn').then(module => ({ default: module.CheckoutReturn })));

const ProtectedDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading GABAY...</div>;
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RootRoute: React.FC = () => {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading GABAY...</div>;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Welcome />;
};

export function App() {
  useTheme(); // Initialize dark/light/system theme

  useEffect(() => {
    seedDatabase();
    analytics.track(EVENTS.APP_OPENED);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedDashboardRoute>
              <Dashboard />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedDashboardRoute>
              <CategoryList />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="/study/:categoryId"
          element={
            <ProtectedDashboardRoute>
              <StudySession />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedDashboardRoute>
              <ReviewQueue />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedDashboardRoute>
              <Profile />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="/profile/stats"
          element={
            <ProtectedDashboardRoute>
              <Statistics />
            </ProtectedDashboardRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<QuickHelp />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/exam/history"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Attempt History...</div>}>
              <ProtectedDashboardRoute>
                <ExamHistory />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route
          path="/exam/:attemptId/results"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Performance Diagnostics...</div>}>
              <ProtectedDashboardRoute>
                <MockExamResults />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route
          path="/exam/:attemptId/review"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Socratic Review Card...</div>}>
              <ProtectedDashboardRoute>
                <ExamReview />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route
          path="/exam/:examId"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Exam Session...</div>}>
              <ProtectedDashboardRoute>
                <MockExamSession />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route
          path="/anxiety"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Anxiety Toolkit...</div>}>
              <AnxietyHub />
            </React.Suspense>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
              <ProtectedDashboardRoute>
                <CheckoutReturn />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route
          path="/checkout/cancel"
          element={
            <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
              <ProtectedDashboardRoute>
                <CheckoutReturn />
              </ProtectedDashboardRoute>
            </React.Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
