import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Un componente simple para el Dashboard temporal
const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="p-10 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold">¡Bienvenido al Panel de Innovatech!</h1>
      <button onClick={logout} className="mt-4 bg-red-500 px-4 py-2 rounded">Cerrar Sesión</button>
    </div>
  );
};

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;