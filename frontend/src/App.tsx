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
import JobList from './pages/jobs/JobList';
import JobDetail from './pages/jobs/JobDetail';
import MyApplications from './pages/jobs/MyApplications';
import Profile from './pages/profile/Profile';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import Applicants from './pages/employer/Applicants';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import AdminExportPage from './pages/admin/AdminExportPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import { useAuth } from './context/AuthContext';
import CertificationList from './pages/certifications/CertificationList';
import CertificationVerify from './pages/certifications/CertificationVerify';
import MentorList from './pages/mentors/MentorList';
import MentorProfile from './pages/mentors/MentorProfile';
import MentorBooking from './pages/mentors/MentorBooking';
import Contact from './pages/contact/Contact';

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
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/certifications" element={<CertificationList />} />
          <Route path="/certifications/verify/:token" element={<CertificationVerify />} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/mentors/:id/book" element={<MentorBooking />} />
          <Route path="/employer" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
          <Route path="/employer/post-job" element={<EmployerRoute><PostJob /></EmployerRoute>} />
          <Route path="/employer/applicants" element={<EmployerRoute><Applicants /></EmployerRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
          <Route path="/admin/export" element={<AdminRoute><AdminExportPage /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModerationPage /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
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

  function DashboardRoute() {
    const { user, isAuthenticated } = useAuth();
    const role = (user?.role ?? '').toUpperCase();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (role === 'EMPLOYER') {
      return <Navigate to="/employer" replace />;
    }

    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }

    return <Dashboard />;
  }

  function AdminRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    const role = user?.role ?? '';
    if (role && role.toUpperCase() === 'ADMIN') return children;
    return <Navigate to="/" replace />;
  }
