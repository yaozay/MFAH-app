import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Forbidden from "./components/Forbidden";
import Membership from "./components/Membership";
import Tickets from "./components/Tickets";

import DashboardAdmin from "./components/DashboardAdmin";
import DashboardEmployee from "./components/DashboardEmployee";
import DashboardVisitor from "./components/DashboardVisitor";

import Artists from "./components/Artists";
import Reports from "./components/Reports";
import ArtworksPage from "./components/artworks/ArtworksPage.jsx";
import EmployeeForm from "./components/EmployeeForm.jsx";
import EventsPage from "./components/events/EventsPage.jsx";
import UserForm from "./components/UserForm.jsx";
import GiftshopPage from "./components/giftshop/GiftshopPage.jsx";
import ExhibitionsPage from "./components/exhibitions/ExhibitionsPage.jsx";
import Cart from "./components/Cart/Cart.jsx";
import Checkout from "./components/Cart/Checkout.jsx";
import OrderSuccess from "./components/Cart/OrderSuccess.jsx";

import ScrollToTop from "./components/ScrollToTop";
import PurchaseHistory from "./components/PurchaseHistory.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />  {/* Move it here, before Navbar */}
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/art" element={<ArtworksPage />} />
        <Route path="/giftshop" element={<GiftshopPage />} />
        <Route path="/exhibitions" element={<ExhibitionsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />


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
              <ArtworksPage />
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

        <Route
          path="/employee-form"
          element={
            <RoleRoute allowed={["admin"]}>
              <EmployeeForm />
            </RoleRoute>
          }
        />
        <Route path="/user-form" element={<UserForm />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}