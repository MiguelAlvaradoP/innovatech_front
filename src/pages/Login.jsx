import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/usuarios/login', credentials);
      const token = response.data.token; 
      
      // 1. Guardamos en el almacenamiento físico (Ya lo tenías)
      localStorage.setItem('token', token);

      // 2. ¡ESTA ES LA QUE FALTA! 
      // Notificamos al AuthContext para que App.jsx se actualice
      login(token); 

      // Nota: No necesitas navigate() aquí si ya lo tienes dentro de la función login 
      // en tu AuthContext, pero no hace daño dejarlo si el contexto no lo hace.
      
    } catch (err) {
      setError('Credenciales inválidas o servidor no disponible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Innovatech</h2>
          <p className="text-slate-400 mt-2">Ingresa a la plataforma de proyectos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nombre de usuario"
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Contraseña"
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;