import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CourseList } from './pages/courses/CourseList';
import { CourseDetail } from './pages/courses/CourseDetail';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import Applicants from './pages/employer/Applicants';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/jobs" element={<Navigate to="/dashboard#recommended-jobs" replace />} />
          <Route path="/applications" element={<Navigate to="/dashboard#applications" replace />} />
          <Route path="/profile" element={<Navigate to="/dashboard#profile" replace />} />
          <Route path="/certifications" element={<Navigate to="/dashboard" replace />} />
          <Route path="/employer" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
          <Route path="/employer/post-job" element={<EmployerRoute><PostJob /></EmployerRoute>} />
          <Route path="/employer/applicants" element={<EmployerRoute><Applicants /></EmployerRoute>} />
          <Route path="/contact" element={<Navigate to="/#contact" replace />} />
          <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

  function EmployerRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    const role = user?.role ?? '';
    if (role && role.toUpperCase() === 'EMPLOYER') return children;
    return <Navigate to="/register" replace />;
  }

  function AdminRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    const role = user?.role ?? '';
    if (role && role.toUpperCase() === 'ADMIN') return children;
    return <Navigate to="/" replace />;
  }
