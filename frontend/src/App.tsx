import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Instruments from "./pages/Instruments";
import Login from "./pages/Login";
import TestReports from "./pages/TestReports";
import Register from "./pages/Register";
import InstrumentDetails from "./pages/InstrumentDetails";
import TestReportDetails from "./pages/TestReportDetails";
import TestWorkspace from "./pages/TestWorkspace";

// 1. IMPORT THE NEW WIZARD PAGE
import NewEvaluation from "./pages/NewEvaluation";

function ProtectedLayout() {
  const token = localStorage.getItem("metro_r76_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instruments" element={<Instruments />} />
          <Route path="/instruments/:id" element={<InstrumentDetails />} />
          <Route path="/test-reports" element={<TestReports />} />

          {/* 2. ADD THE NEW ROUTE HERE */}
          <Route path="/test-reports/new" element={<NewEvaluation />} />

          <Route path="/test-reports/:id" element={<TestReportDetails />} />
          <Route path="/test-reports/:id/tests" element={<TestWorkspace />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
