import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos buscando en localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Usamos replace: true para que el usuario no pueda volver atrás al login con el botón del navegador
    navigate('/dashboard', { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);