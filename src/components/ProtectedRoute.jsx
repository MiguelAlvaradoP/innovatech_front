import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta si es necesario

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // Si no hay token, lo mandamos directo al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitimos el acceso al componente
  return children;
};

export default ProtectedRoute;