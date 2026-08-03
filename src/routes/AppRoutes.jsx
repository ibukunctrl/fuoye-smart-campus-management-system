import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Student pages
import Dashboard from "../pages/dashboard/Dashboard";
import HostelListing from "../pages/hostel/HostelListing";
import HostelDetails from "../pages/hostel/HostelDetails";
import ClassroomBooking from "../pages/classroom/ClassroomBooking";
import MyBookings from "../pages/bookings/MyBookings";
import Profile from "../pages/profile/Profile";
import Settings from "../pages/settings/Settings";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminHostels from "../pages/admin/AdminHostels";
import AdminClassrooms from "../pages/admin/AdminClassrooms";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminSettings from "../pages/admin/AdminSettings";

// Agent pages
import AgentLayout from "../layouts/AgentLayout";
import AgentLogin from "../pages/agent/auth/AgentLogin";
import AgentRegister from "../pages/agent/auth/AgentRegister";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentHostels from "../pages/agent/AgentHostels";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ───────────────── PUBLIC ROUTES ───────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/register" element={<AgentRegister />} />

      {/* ─────────────── STUDENT ROUTES ─────────────── */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hostel" element={<HostelListing />} />
          <Route path="/hostel/:slug" element={<HostelDetails />} />
          <Route path="/classroom" element={<ClassroomBooking />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ─────────────── AGENT ROUTES ─────────────── */}
      <Route element={<ProtectedRoute requiredRole="agent" />}>
        <Route element={<AgentLayout />}>
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/hostels" element={<AgentHostels />} />
        </Route>
      </Route>

      {/* ─────────────── ADMIN ROUTES ─────────────── */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hostels" element={<AdminHostels />} />
          <Route path="/admin/classrooms" element={<AdminClassrooms />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* ───────────────── DEFAULT ROUTES ───────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
