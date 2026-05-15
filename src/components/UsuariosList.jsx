import React, { useState, useEffect } from 'react';
import { User, Mail, Trash2, Edit3, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto

const UsuariosList = ({ onEditar }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // Obtenemos el token

  const cargarUsuarios = () => {
    fetch('http://localhost:8085/api/usuarios', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      setUsuarios(data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
      console.error("Error cargando usuarios");
    });
  };

  useEffect(() => { 
    if (token) cargarUsuarios(); 
  }, [token]);

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Revocar acceso a este usuario?")) return;
    try {
      const res = await fetch(`http://localhost:8085/api/usuarios/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err) { alert("Error de red"); }
  };

  if (loading) return <div className="text-center py-10 text-blue-500 font-black animate-pulse uppercase tracking-widest text-xs">Accediendo al Directorio...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {usuarios.map((u) => (
        <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-blue-500/40 transition-all group relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => onEditar(u)} className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all">
              <Edit3 size={14} />
            </button>
            <button onClick={() => eliminarUsuario(u.id)} className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{u.username}</h3>
            <span className="text-[10px] px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-black mt-2 tracking-widest uppercase italic">
              {u.rol || 'USER'}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-slate-400">
              <Mail size={14} />
              <span className="text-xs truncate">{u.email || 'sin-email@healthtech.cl'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <Fingerprint size={14} />
              <span className="text-[10px] font-mono uppercase">ID: {u.id}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsuariosList;