import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics'; // 🔥 1. Importamos tu nueva página

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* Página 1: Dashboard Principal */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      
      {/* Página 2: Tu nueva página de Analytics */}
      <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" />} />
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;