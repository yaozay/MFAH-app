import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardEmployee from "./components/DashboardEmployee";
import DashboardVisitor from "./components/DashboardVisitor";
import Forbidden from "./components/Forbidden";
import Artists from "./components/Artists";
import Artworks from "./components/Artworks";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Navbar from "./components/Navbar";
import Events from "./components/Events";
import Footer from "./components/Footer";
import Employees from "./components/EmployeeReport";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forbidden" element={<Forbidden />} />

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
        <Route
          path="/artists"
          element={
            <ProtectedRoute>
              <Artists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artworks"
          element={
            <ProtectedRoute>
              <Artworks />
            </ProtectedRoute>
          }
        />
        <Route
          path = "/employees"
          element = {
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
          />
        <Route path="/events" element={<Events />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}