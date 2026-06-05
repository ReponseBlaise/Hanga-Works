import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPasswordPage';
import ResetPassword from './pages/auth/ResetPassword';
import { CourseList } from './pages/courses/CourseList';
import { CourseDetail } from './pages/courses/CourseDetail';
import CourseCreate from './pages/courses/CourseCreate';
import CourseTestEditor from './pages/courses/CourseTestEditor';
import CourseTestAttempt from './pages/courses/CourseTestAttempt';
import JobList from './pages/jobs/JobList';
import JobDetail from './pages/jobs/JobDetail';
import JobApply from './pages/jobs/JobApply';
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
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import { useAuth } from './hooks/useAuth';
import CertificationList from './pages/certifications/CertificationList';
import CertificationVerify from './pages/certifications/CertificationVerify';
import MentorList from './pages/mentors/MentorList';
import MentorProfile from './pages/mentors/MentorProfile';
import MentorBooking from './pages/mentors/MentorBooking';
import MentorDashboard from './pages/mentors/MentorDashboard';
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstitutionMentors from './pages/institution/InstitutionMentors';
import InstitutionCertifications from './pages/institution/InstitutionCertifications';
import Contact from './pages/contact/Contact';
import Pricing from './pages/pricing/Pricing';
import Candidates from './pages/candidates/Candidates';
import Blog from './pages/blog/Blog';
import Intelligence from './pages/intelligence/Intelligence';
import IndustryTrends from './pages/intelligence/IndustryTrends';
import CareerModelling from './pages/intelligence/CareerModelling';
import Notifications from './pages/notifications/Notifications';

function RoleBasedRedirect({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated, isReady } = useAuth();
  
  if (!isReady) return null;

  if (!isAuthenticated || !user) {
    return children;
  }

  const role = user.role?.toUpperCase();
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'EMPLOYER') return <Navigate to="/employer" replace />;
  if (role === 'MENTOR') return <Navigate to="/mentors/dashboard" replace />;
  if (role === 'INSTITUTION') return <Navigate to="/institution/dashboard" replace />;
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RoleBasedRedirect><Home /></RoleBasedRedirect>} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/new" element={<InstitutionOrAdminRoute><CourseCreate /></InstitutionOrAdminRoute>} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:id/test/edit" element={<InstitutionOrAdminRoute><CourseTestEditor /></InstitutionOrAdminRoute>} />
          <Route path="/courses/:id/test" element={<ProtectedRoute><CourseTestAttempt /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/apply" element={<ProtectedRoute><JobApply /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/certifications" element={<ProtectedRoute><CertificationList /></ProtectedRoute>} />
          <Route path="/certifications/verify/:token" element={<CertificationVerify />} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/mentors/:id/book" element={<ProtectedRoute><MentorBooking /></ProtectedRoute>} />
          
          {/* New specialized dashboards */}
          <Route path="/mentors/dashboard" element={<MentorRoute><MentorDashboard /></MentorRoute>} />
          <Route path="/institution/dashboard" element={<InstitutionOrAdminRoute><InstitutionDashboard /></InstitutionOrAdminRoute>} />
          <Route path="/institution/mentors" element={<InstitutionOrAdminRoute><InstitutionMentors /></InstitutionOrAdminRoute>} />
          <Route path="/institution/certifications" element={<InstitutionOrAdminRoute><InstitutionCertifications /></InstitutionOrAdminRoute>} />

          <Route path="/pricing" element={<Pricing />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
          <Route path="/intelligence/trends" element={<ProtectedRoute><IndustryTrends /></ProtectedRoute>} />
          <Route path="/intelligence/career-model" element={<ProtectedRoute><CareerModelling /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/employer" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
          <Route path="/employer/post-job" element={<EmployerRoute><PostJob /></EmployerRoute>} />
          <Route path="/employer/applicants" element={<EmployerRoute><Applicants /></EmployerRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
          <Route path="/admin/export" element={<AdminRoute><AdminExportPage /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModerationPage /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
          <Route path="/admin/manage/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/manage/jobs" element={<AdminRoute><AdminJobsPage /></AdminRoute>} />
          <Route path="/admin/manage/courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

  function EmployerRoute({ children }: { children: JSX.Element }) {
    const { user, isReady } = useAuth();
    if (!isReady) return null;
    const role = user?.role ?? '';
    if (role && role.toUpperCase() === 'EMPLOYER') return children;
    return <Navigate to="/register" replace />;
  }

  function InstitutionOrAdminRoute({ children }: { children: JSX.Element }) {
    const { user, isReady } = useAuth();
    if (!isReady) return null;
    const role = user?.role ?? '';
    const upper = role.toUpperCase();
    if (upper === 'INSTITUTION' || upper === 'ADMIN') return children;
    return <Navigate to="/courses" replace />;
  }

  function MentorRoute({ children }: { children: JSX.Element }) {
    const { user, isReady } = useAuth();
    if (!isReady) return null;
    const role = user?.role ?? '';
    if (role && role.toUpperCase() === 'MENTOR') return children;
    return <Navigate to="/register" replace />;
  }

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isReady } = useAuth();
  if (!isReady) return null;
  const role = user?.role ?? '';
  if (role && role.toUpperCase() === 'ADMIN') return children;
  return <Navigate to="/" replace />;
}
