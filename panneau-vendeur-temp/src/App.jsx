import { Toaster } from "@/components/ui/toaster"
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import VendeurLogin from '@/pages/VendeurLogin';
import VendeurSignup from '@/pages/VendeurSignup';
import VendeurDashboard from '@/pages/VendeurDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/vendeur/login" element={<VendeurLogin />} />
          <Route path="/vendeur/signup" element={<VendeurSignup />} />
          <Route path="/vendeur/dashboard" element={<VendeurDashboard />} />
          <Route path="/vendeur" element={<Navigate to="/vendeur/login" replace />} />
          <Route path="*" element={<Navigate to="/vendeur/login" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
