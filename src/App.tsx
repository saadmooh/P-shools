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

const Login = ({ error }: { error: string | null }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col items-center">
      <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl rotate-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h1>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed">
        This portal is exclusively available as a <span className="text-slate-900 font-bold underline decoration-blue-500/30">Telegram Mini App</span>.
      </p>
      
      <div className="bg-slate-50 rounded-2xl p-6 w-full mb-6 border border-slate-100">
        <p className="text-slate-900 font-bold mb-1">Please open this app from Telegram</p>
        <p className="text-slate-400 text-sm">Launch the bot to access your dashboard.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm w-full font-medium">
          <span className="block font-bold mb-1 text-red-700">Authentication Error</span>
          {error}
        </div>
      )}

      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
        <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
      </div>
    </div>
    <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">EMS Portal System v1.0</p>
  </div>
);
const NotFound = () => <div className="p-4">404 - Page Not Found</div>;

function App() {
  const { isLoading, error, isAuthenticated } = useTelegramAuth();
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
            !isAuthenticated ? <Login error={error} /> : <Navigate to={`/${user?.role}`} />
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
