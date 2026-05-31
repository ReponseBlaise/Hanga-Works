import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPasswordPage';
import ResetPassword from './pages/auth/ResetPassword';
import { CourseList } from './pages/courses/CourseList';
import { CourseDetail } from './pages/courses/CourseDetail';
import CourseCreate from './pages/courses/CourseCreate';
import JobList from './pages/jobs/JobList';
import JobDetail from './pages/jobs/JobDetail';
import MyApplications from './pages/jobs/MyApplications';
import { Dashboard } from './pages/dashboard/Dashboard';
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
import Pricing from './pages/pricing/Pricing';
import Candidates from './pages/candidates/Candidates';
import Blog from './pages/blog/Blog';
import Intelligence from './pages/intelligence/Intelligence';
import Notifications from './pages/notifications/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/new" element={<ProtectedRoute><CourseCreate /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/certifications" element={<ProtectedRoute><CertificationList /></ProtectedRoute>} />
          <Route path="/certifications/verify/:token" element={<CertificationVerify />} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/mentors/:id/book" element={<MentorBooking />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
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
