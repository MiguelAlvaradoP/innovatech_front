import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard', { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login', { replace: true });
  };

  // Valor que compartimos en toda la app
  const value = {
    token,
    isAuthenticated: !!token, // Útil para proteger rutas
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe us-arse dentro de un AuthProvider");
  }
  return context;
};