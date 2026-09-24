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
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />;{/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instruments" element={<Instruments />} />
          <Route path="/instruments/:id" element={<InstrumentDetails />} />
          <Route path="/test-reports" element={<TestReports />} />
          <Route path="/test-reports/:id" element={<TestReportDetails />} />
          <Route path="/test-reports/:id/tests" element={<TestWorkspace />} />
        </Route>
        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
