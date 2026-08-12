import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { clearSession, readSessionUser } from "./api";
import "./App.css";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import MemoryPage from "./pages/MemoryPage";
import Dashboard from "./pages/Dashboard";
import CardEditor from "./pages/CardEditor";
import AdminPanel from "./pages/AdminPanel";

function AppContent() {
  const [user, setUser] = useState(readSessionUser());
  const logout = () => {
    clearSession();
    setUser(null);
  };
  
  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/auth"
          element={
            user ? <Navigate to="/dashboard" /> : <Auth onLogin={setUser} />
          }
        />
        <Route path="/memory/:id" element={<MemoryPage />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />}
        />
        <Route
          path="/dashboard/:id"
          element={user ? <CardEditor /> : <Navigate to="/auth" />}
        />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? <AdminPanel /> : <Navigate to="/dashboard" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
