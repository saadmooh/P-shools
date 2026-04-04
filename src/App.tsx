import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import { useAuthStore } from './stores/authStore';

// Dashboard Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./features/teacher/pages/TeacherDashboard'));
const GuardianDashboard = lazy(() => import('./features/guardian/pages/GuardianDashboard'));
const IndependentDashboard = lazy(() => import('./features/independent/pages/IndependentDashboard'));

// Admin Pages (Lazy Loaded)
const RoomsManagement = lazy(() => import('./features/admin/pages/RoomsManagement'));
const StudentsManagement = lazy(() => import('./features/admin/pages/StudentsManagement'));
const SubjectsManagement = lazy(() => import('./features/admin/pages/SubjectsManagement'));
const UsersManagement = lazy(() => import('./features/admin/pages/UsersManagement'));
const InvoicesManagement = lazy(() => import('./features/admin/pages/InvoicesManagement'));

// Teacher & Other Pages (Lazy Loaded)
const AttendanceMarking = lazy(() => import('./features/teacher/pages/AttendanceMarking'));
const MyPayroll = lazy(() => import('./features/teacher/pages/MyPayroll'));
const SubmitJustification = lazy(() => import('./features/guardian/pages/SubmitJustification'));

const Login = () => <div className="p-4 flex flex-col items-center justify-center h-screen bg-[var(--tg-theme-bg-color)]">Please open this app from Telegram.</div>;
const NotFound = () => <div className="p-4">404 - Page Not Found</div>;

function App() {
  const { isLoading, isAuthenticated } = useTelegramAuth();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="relative">
          <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-slate-100 opacity-75"></div>
          <div className="relative rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800"></div>
        </div>
        <p className="mt-8 font-black text-slate-900 tracking-tighter text-2xl">EMS PORTAL</p>
        <p className="mt-2 text-slate-400 font-medium text-xs uppercase tracking-widest animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)]">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tg-theme-button-color)]"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={
            !isAuthenticated ? <Login /> : <Navigate to={`/${user?.role}`} />
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<RoomsManagement />} />
          <Route path="/admin/students" element={<StudentsManagement />} />
          <Route path="/admin/subjects" element={<SubjectsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/invoices" element={<InvoicesManagement />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/attendance/:sessionId" element={<AttendanceMarking />} />
          <Route path="/teacher/payroll" element={<MyPayroll />} />
          <Route path="/guardian" element={<GuardianDashboard />} />
          <Route path="/guardian/justifications/new" element={<SubmitJustification />} />
          <Route path="/independent/*" element={<IndependentDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
