import React, { useState } from 'react';
import UsuariosList from '../components/UsuariosList';
import { useAuth } from '../context/AuthContext';
import { UserPlus, X, ShieldCheck } from 'lucide-react';

const GestionUsuarios = () => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  // IMPORTANTE: El rol inicial debe coincidir con lo que espera tu BD (con ROLE_)
  const [usuario, setUsuario] = useState({ username: '', email: '', password: '', rol: 'ROLE_DEVELOPER' });

  const abrirNuevo = () => {
    setEditId(null);
    setUsuario({ username: '', email: '', password: '', rol: 'ROLE_DEVELOPER' });
    setIsModalOpen(true);
  };

  const abrirEdicion = (u) => {
    setUsuario({
      username: u.username,
      email: u.email,
      password: '', 
      rol: u.rol || 'ROLE_DEVELOPER'
    });
    setEditId(u.id);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setUsuario({ username: '', email: '', password: '', rol: 'ROLE_DEVELOPER' });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    // 1. CORRECCIÓN DE URL: Si es un nuevo usuario, le pegamos directo a /registro
    const url = editId 
      ? `http://localhost:8085/api/usuarios/${editId}` 
      : 'http://localhost:8085/api/usuarios/registro'; // <-- Redirección limpia
    
    const metodo = editId ? 'PUT' : 'POST';

    // 2. CORRECCIÓN DE PAYLOAD: Convertimos el rol único en la lista que espera tu UserDTO
    const payload = {
      username: usuario.username,
      email: usuario.email,
      ...(usuario.password && { password: usuario.password }), // Solo añade password si existe
      roles: [usuario.rol] // <-- De 'rol: "ROLE_ADMIN"' a 'roles: ["ROLE_ADMIN"]'
    };

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload) // <-- Enviamos el payload corregido
      });

      if (res.ok) {
        cerrarModal();
        window.location.reload(); 
      } else {
        const errorMsg = await res.text();
        alert(`Error (${res.status}): ${errorMsg || 'No tienes permisos de Administrador'}`);
      }
    } catch (err) { 
      console.error("Error en la petición:", err);
      alert("Error crítico: No se pudo conectar con el servidor."); 
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Usuarios</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Access Control / Core Security</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
          <UserPlus size={20} /> AÑADIR USUARIO
        </button>
      </header>

      <UsuariosList onEditar={abrirEdicion} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 relative">
            <button onClick={cerrarModal} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter italic">{editId ? 'Editar Perfil' : 'Nuevo Usuario'}</h3>
            
            <form onSubmit={guardarUsuario} className="space-y-5">
              <input type="text" placeholder="Username" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={usuario.username} onChange={e => setUsuario({...usuario, username: e.target.value})} />
              
              <input type="email" placeholder="Email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} />
              
              {!editId && (
                <input type="password" placeholder="Contraseña" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  value={usuario.password} onChange={e => setUsuario({...usuario, password: e.target.value})} />
              )}

              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                value={usuario.rol} onChange={e => setUsuario({...usuario, rol: e.target.value})}>
                {/* IMPORTANTE: Los values ahora llevan ROLE_ */}
                <option value="ROLE_ADMIN">Administrador</option>
                <option value="ROLE_DEVELOPER">Developer</option>
                <option value="ROLE_VIEWER">Visualizador</option>
              </select>

              <button type="submit" className="w-full bg-white hover:bg-emerald-50 text-slate-950 py-5 rounded-2xl font-black flex items-center justify-center gap-2 mt-4 shadow-xl active:scale-95 transition-all">
                <ShieldCheck size={20} /> {editId ? 'ACTUALIZAR' : 'REGISTRAR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;