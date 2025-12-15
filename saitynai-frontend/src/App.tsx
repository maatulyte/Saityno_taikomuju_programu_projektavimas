import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Faculties from "./pages/Faculties";
import FacultyDetail from "./pages/FacultyDetail";
import Forbidden from "./pages/Forbidden";
import Mentors from "./pages/Mentors";
import Groups from "./pages/Groups";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== SYSADMIN ===== */}
      <Route
        path="/faculties"
        element={
          <ProtectedRoute roles={["SysAdmin"]}>
            <Faculties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculties/:id"
        element={
          <ProtectedRoute roles={["SysAdmin"]}>
            <FacultyDetail />
          </ProtectedRoute>
        }
      />

      {/* ===== COORDINATOR ===== */}
      <Route
        path="/mentors"
        element={
          <ProtectedRoute roles={["Coordinator"]}>
            <Mentors />
          </ProtectedRoute>
        }
      />

      {/* ===== MENTOR ===== */}
      <Route
        path="/groups"
        element={
          <ProtectedRoute roles={["Mentor"]}>
            <Groups />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
