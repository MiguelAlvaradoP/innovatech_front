import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* La ruta dashboard ahora usa el componente del archivo separado */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;