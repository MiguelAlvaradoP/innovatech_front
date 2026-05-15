import React, { useState } from 'react';
import UsuariosList from '../components/UsuariosList';
import { UserPlus, X, Save, ShieldCheck } from 'lucide-react';

const GestionUsuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [usuario, setUsuario] = useState({ username: '', email: '', password: '', rol: 'DEVELOPER' });

  const guardarUsuario = async (e) => {
    e.preventDefault();
    const url = editId ? `http://localhost:8085/api/usuarios/${editId}` : 'http://localhost:8081/api/usuarios';
    const metodo = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditId(null);
        window.location.reload();
      }
    } catch (err) { alert("Error al conectar con Auth Service"); }
  };

  const abrirEdicion = (u) => {
    setUsuario(u);
    setEditId(u.id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter">USUARIOS</h2>
          <p className="text-slate-500 text-sm">Control de acceso y roles de la plataforma</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/20">
          <UserPlus size={20} /> AÑADIR USUARIO
        </button>
      </header>

      <UsuariosList onEditar={abrirEdicion} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500"><X size={24} /></button>
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">{editId ? 'Editar Perfil' : 'Nuevo Usuario'}</h3>
            
            <form onSubmit={guardarUsuario} className="space-y-5">
              <input type="text" placeholder="Username" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={usuario.username} onChange={e => setUsuario({...usuario, username: e.target.value})} />
              
              <input type="email" placeholder="Email institucional" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} />
              
              {!editId && (
                <input type="password" placeholder="Contraseña inicial" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  value={usuario.password} onChange={e => setUsuario({...usuario, password: e.target.value})} />
              )}

              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                value={usuario.rol} onChange={e => setUsuario({...usuario, rol: e.target.value})}>
                <option value="ADMIN">Administrador</option>
                <option value="DEVELOPER">Developer</option>
                <option value="VIEWER">Visualizador</option>
              </select>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 mt-4 transition-all">
                <ShieldCheck size={20} /> {editId ? 'GUARDAR CAMBIOS' : 'CREAR IDENTIDAD'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;