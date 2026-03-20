import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AxiosInterceptor from './components/AxiosInterceptor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WelcomePage from './pages/WelcomePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProfilePage from './pages/ProfilePage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import TeacherRequestsPage from './pages/TeacherRequestsPage';
import TeacherActivationsPage from './pages/TeacherActivationsPage';
import TeacherSignupPage from './pages/TeacherSignupPage';
import NotFoundPage from './pages/NotFoundPage';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isDashboard && <Navbar />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/email-app/login" />;

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    if (user.rol === 'ADMIN') return <Navigate to="/email-app/admin/dashboard" />;
    if (user.rol === 'TEACHER') return <Navigate to="/email-app/teacher/dashboard" />;
    if (user.rol === 'STUDENT') return <Navigate to="/email-app/student/dashboard" />;
    return <Navigate to="/email-app/" />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.rol === 'ADMIN') return <Navigate to="/email-app/admin/dashboard" replace />;
  if (user?.rol === 'TEACHER') return <Navigate to="/email-app/teacher/dashboard" replace />;
  return <Navigate to="/email-app/student/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AxiosInterceptor>
        <Routes>
          <Route path="/email-app" element={<Layout><WelcomePage /></Layout>} />
          <Route path="/email-app/login" element={<Layout><LoginForm /></Layout>} />
          <Route path="/email-app/register" element={<Layout><RegisterForm /></Layout>} />
          <Route path="/email-app/teacher/signup/:token" element={<Layout><TeacherSignupPage /></Layout>} />

          {/* Legacy /dashboard route - redirects based on role */}
          <Route path="/email-app/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Student Dashboard */}
          <Route path="/email-app/student/dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/email-app/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Teacher Dashboard */}
          <Route path="/email-app/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          {/* Teacher Students Page */}
          <Route path="/email-app/teacher/students" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherStudentsPage />
            </ProtectedRoute>
          } />

          {/* Teacher Requests Page */}
          <Route path="/email-app/teacher/requests" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherRequestsPage />
            </ProtectedRoute>
          } />

          {/* Teacher Activations Page */}
          <Route path="/email-app/teacher/activations" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherActivationsPage />
            </ProtectedRoute>
          } />

          {/* Universal Profile Page */}
          <Route path="/email-app/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* 404 Catch All */}
          <Route path="/email-app/*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </AxiosInterceptor>
    </Router>
  );
}

export default App;
