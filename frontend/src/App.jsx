import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./components/Home";
import Events from "./components/Events";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Forbidden from "./components/Forbidden";

import DashboardAdmin from "./components/DashboardAdmin";
import DashboardEmployee from "./components/DashboardEmployee";
import DashboardVisitor from "./components/DashboardVisitor";

import Artists from "./components/Artists";
import Artworks from "./components/Artworks";
import Reports from "./components/Reports"; // ✅ missing import added

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowed={["admin"]}>
              <DashboardAdmin />
            </RoleRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <RoleRoute allowed={["admin", "employee"]}>
              <DashboardEmployee />
            </RoleRoute>
          }
        />
        <Route
          path="/visitor"
          element={
            <ProtectedRoute>
              <DashboardVisitor />
            </ProtectedRoute>
          }
        />

        {/* Staff-only data pages */}
        <Route
          path="/artists"
          element={
            <RoleRoute allowed={["admin", "employee"]}>
              <Artists />
            </RoleRoute>
          }
        />
        <Route
          path="/artworks"
          element={
            <RoleRoute allowed={["admin", "employee"]}>
              <Artworks />
            </RoleRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleRoute allowed={["admin", "employee"]}>
              <Reports />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
