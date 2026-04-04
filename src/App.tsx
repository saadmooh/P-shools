import { Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import { useAuthStore } from './stores/authStore';

// Dashboard Pages
import AdminDashboard from './features/admin/pages/AdminDashboard';
import TeacherDashboard from './features/teacher/pages/TeacherDashboard';
import GuardianDashboard from './features/guardian/pages/GuardianDashboard';
import IndependentDashboard from './features/independent/pages/IndependentDashboard';

// Admin Pages
import RoomsManagement from './features/admin/pages/RoomsManagement';
import StudentsManagement from './features/admin/pages/StudentsManagement';

const Login = () => <div className="p-4 flex flex-col items-center justify-center h-screen bg-[var(--tg-theme-bg-color)]">Please open this app from Telegram.</div>;
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
    </div>
  );
}

export default App;
