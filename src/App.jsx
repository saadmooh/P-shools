import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import Layout from './features/shared/Layout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import StudentsManagement from './features/admin/pages/StudentsManagement';
import UsersManagement from './features/admin/pages/UsersManagement';
import CoursesManagement from './features/admin/pages/CoursesManagement';
import TeachersManagement from './features/admin/pages/TeachersManagement';
import InvoicesManagement from './features/admin/pages/InvoicesManagement';
import GuardianDashboard from './features/guardian/pages/GuardianDashboard';
import GuardianProfile from './features/guardian/pages/GuardianProfile';
import GuardianSchedule from './features/guardian/pages/GuardianSchedule';
import GuardianDocuments from './features/guardian/pages/GuardianDocuments';
import SubmitJustification from './features/guardian/pages/SubmitJustification';
import IndependentDashboard from './features/independent/pages/IndependentDashboard';
import IndependentProfile from './features/independent/pages/IndependentProfile';
import IndependentSchedule from './features/independent/pages/IndependentSchedule';
import IndependentDocuments from './features/independent/pages/IndependentDocuments';
import TeacherDashboard from './features/teacher/pages/TeacherDashboard';
import TeacherProfile from './features/teacher/pages/TeacherProfile';
import TeacherSchedule from './features/teacher/pages/TeacherSchedule';
import TeacherDocuments from './features/teacher/pages/TeacherDocuments';
import AttendanceMarking from './features/teacher/pages/AttendanceMarking';
import MyPayroll from './features/teacher/pages/MyPayroll';
import ROOM_MANAGEMENT from './features/admin/pages/RoomsManagement';
import SUBJECTS_MANAGEMENT from './features/admin/pages/SubjectsManagement';
import INVOICES_MANAGEMENT from './features/admin/pages/InvoicesManagement';
import STUDENTS_MANAGEMENT from './features/admin/pages/StudentsManagement';
import COURSES_MANAGEMENT from './features/admin/pages/CoursesManagement';
import TEACHERS_MANAGEMENT from './features/admin/pages/TeachersManagement';
import USERS_MANAGEMENT from './features/admin/pages/UsersManagement';
import { useAuthPermissions, PERMISSIONS } from './lib/permissions';
import { fetchSetting } from './lib/settings';
import { useState, useRef } from 'react';

// If using Telegram Web App SDK
const AppRoutes = () => {
  const { isAuthenticated, isLoading, user } = useTelegram();
  const { userPermissions, isAdmin } = useAuthPermissions();
  const location = useLocation();
  const [appName, setAppName] = useState('');

  useEffect(() => {
    const loadAppName = async () => {
      const fetchedAppName = await fetchSetting('app_name');
      if (fetchedAppName) {
        setAppName(fetchedAppName);
      }
    };
    loadAppName();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    if (isLoading) return null; // Or a loading spinner

    const hasRequiredRole = userPermissions.some(role => allowedRoles.includes(role));
    
    if (!isAuthenticated || !hasRequiredRole) {
      // Redirect to a public page or login, based on context
      return <Navigate to="/" replace state={{ from: location }} />;
    }
    return children;
  };

  // Admin routes
  const AdminRoutes = () => (
    <>
      <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="admin/students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentsManagement /></ProtectedRoute>} />
      <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute>} />
      <Route path="admin/courses" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><CoursesManagement /></ProtectedRoute>} />
      <Route path="admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersManagement /></ProtectedRoute>} />
      <Route path="admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><InvoicesManagement /></ProtectedRoute>} />
      <Route path="admin/rooms" element={<ProtectedRoute allowedRoles={['admin']}><ROOM_MANAGEMENT /></ProtectedRoute>} />
      <Route path="admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><SUBJECTS_MANAGEMENT /></ProtectedRoute>} />
    </>
  );

  // Guardian routes
  const GuardianRoutes = () => (
    <>
      <Route path="guardian/dashboard" element={<ProtectedRoute allowedRoles={['guardian', 'admin']}><GuardianDashboard /></ProtectedRoute>} />
      <Route path="guardian/profile" element={<ProtectedRoute allowedRoles={['guardian', 'admin']}><GuardianProfile /></ProtectedRoute>} />
      <Route path="guardian/schedule" element={<ProtectedRoute allowedRoles={['guardian', 'admin']}><GuardianSchedule /></ProtectedRoute>} />
      <Route path="guardian/documents" element={<ProtectedRoute allowedRoles={['guardian', 'admin']}><GuardianDocuments /></ProtectedRoute>} />
      <Route path="guardian/submit-justification" element={<ProtectedRoute allowedRoles={['guardian', 'admin']}><SubmitJustification /></ProtectedRoute>} />
    </>
  );

  // Independent user routes
  const IndependentRoutes = () => (
    <>
      <Route path="independent/dashboard" element={<ProtectedRoute allowedRoles={['independent', 'admin']}><IndependentDashboard /></ProtectedRoute>} />
      <Route path="independent/profile" element={<ProtectedRoute allowedRoles={['independent', 'admin']}><IndependentProfile /></ProtectedRoute>} />
      <Route path="independent/schedule" element={<ProtectedRoute allowedRoles={['independent', 'admin']}><IndependentSchedule /></ProtectedRoute>} />
      <Route path="independent/documents" element={<ProtectedRoute allowedRoles={['independent', 'admin']}><IndependentDocuments /></ProtectedRoute>} />
    </>
  );

  // Teacher routes
  const TeacherRoutes = () => (
    <>
      <Route path="teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="teacher/profile" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherProfile /></ProtectedRoute>} />
      <Route path="teacher/schedule" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherSchedule /></ProtectedRoute>} />
      <Route path="teacher/documents" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherDocuments /></ProtectedRoute>} />
      <Route path="teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><AttendanceMarking /></ProtectedRoute>} />
      <Route path="teacher/payroll" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><MyPayroll /></ProtectedRoute>} />
    </>
  );

  return (
    <Layout title={appName || 'EMS'}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Authentication route (assuming a login page exists) */}
        {/* <Route path="/auth/login" element={<LoginPage />} /> */}
        
        {/* Protected routes based on roles */}
        {AdminRoutes()}
        {GuardianRoutes()}
        {IndependentRoutes()}
        {TeacherRoutes()}

        {/* Fallback route for 404 or if user is not authenticated and not on public */}
        <Route path="*" element={
          isAuthenticated ? (
            // Redirect authenticated users to their role-based dashboard
            user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
            user?.role === 'guardian' ? <Navigate to="/guardian/dashboard" replace /> :
            user?.role === 'independent' ? <Navigate to="/independent/dashboard" replace /> :
            user?.role === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> :
            <Navigate to="/" replace /> // Fallback for unexpected roles
          ) : (
            <Navigate to="/" replace /> // Redirect unauthenticated users to home/login
          )
        } />
      </Routes>
    </Layout>
  );
};

function App() {
  const { initDataUnsafe } = useTelegram();
  const { login } = useAuthPermissions();
  const location = useLocation();
  const currentPath = location.pathname;
  const isAuthPage = currentPath.startsWith('/auth'); // Assuming auth pages start with /auth
  const isRootPage = currentPath === '/';

  useEffect(() => {
    if (initDataUnsafe) {
      login(initDataUnsafe.user);
    }
  }, [initDataUnsafe, login]);

  // If on the root path and authenticated, redirect to dashboard
  useEffect(() => {
    if (isRootPage && initDataUnsafe?.user) {
       // Directly redirect based on user role once auth is established
       // This logic might need refinement based on actual auth flow
    }
  }, [isRootPage, initDataUnsafe?.user]);

  return (
    <AppRoutes />
  );
}

export default App;
