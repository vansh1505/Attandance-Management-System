import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceList from "./pages/AttendanceList";
import Signup from "./pages/Signup";
import StudentMark from "./pages/StudentMark";
import './index.css'
import QRGenerator from './pages/Qr.jsx'
import QRScanner from './pages/scan.jsx'
import TeacherPage from './pages/teacher.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ClassRoster from './pages/ClassRoster.jsx';
import Navbar from './components/Navbar.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute, RoleRoute, GuestRoute } from './components/ProtectedRoute.jsx';
import Loader from './components/Loader.jsx';
import NotFound from './pages/NotFound.jsx';

function RootRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          {/* Role-protected dashboards */}
          <Route path="/teacher" element={
            <RoleRoute allow={["teacher"]}>
              <TeacherPage />
            </RoleRoute>
          } />
          <Route path="/classes" element={
            <RoleRoute allow={["teacher"]}>
              <ClassRoster />
            </RoleRoute>
          } />
          <Route path="/student" element={
            <RoleRoute allow={["student"]}>
              <StudentDashboard />
            </RoleRoute>
          } />

          {/* Shared features */}
          <Route path="/scan" element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <AttendanceList />
            </ProtectedRoute>
          } />

          {/* Legacy/optional routes */}
          <Route path="/mark" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
          <Route path="/student-mark" element={<ProtectedRoute><StudentMark /></ProtectedRoute>} />
          <Route path="/qr" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
