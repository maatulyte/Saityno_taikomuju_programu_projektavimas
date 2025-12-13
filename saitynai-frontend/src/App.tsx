import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Faculties from "./pages/Faculties";
import FacultyDetail from "./pages/FacultyDetail";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/faculties"
          element={
            <ProtectedRoute>
              <Faculties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculties/:id"
          element={
            <ProtectedRoute>
              <FacultyDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
