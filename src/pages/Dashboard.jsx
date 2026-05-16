import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, FolderKanban, Plus, X, Save, Info, Users, LayoutDashboard } from 'lucide-react';

// REORDENADO E IMPORTS LIMPIOS
import ListaProyectos from '../components/ListaProyectos';
import GestionUsuarios from './GestionUsuarios'; 

const Dashboard = () => {
  const { logout } = useAuth();
  
  // ESTADOS DE NAVEGACIÓN
  const [vista, setVista] = useState('proyectos'); // 'proyectos' o 'usuarios'
  
  // ESTADOS DE MODAL Y FORMULARIO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // ESTADO PARA ALMACENAR USUARIOS DESDE EL MICROSERVICIO
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  const [nuevo, setNuevo] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    prioridad: 'MEDIA',
    progresoPorcentaje: 0,
    usuarioId: '' // ID del usuario seleccionado
  });

  // Efecto para obtener la lista de usuarios disponibles al montar el dashboard
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const response = await api.get('/usuarios'); 
        setUsuariosDisponibles(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error al cargar la lista de usuarios:", error);
      }
    };
    obtenerUsuarios();
  }, []);

  // --- Lógica de Cálculo Automático de Tiempo ---
  const calcularProgresoDesdeFechas = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const fInicio = new Date(inicio);
    const fFin = new Date(fin);
    const hoy = new Date();
    if (hoy < fInicio) return 0;
    if (hoy > fFin) return 100;
    const total = fFin - fInicio;
    const transcurrido = hoy - fInicio;
    return Math.min(100, Math.max(0, Math.round((transcurrido / total) * 100)));
  };

  const prepararEdicion = (proyecto) => {
    // Buscamos si ya tiene un usuario asignado en su arreglo para preseleccionar en el menú
    const primeraAsignacion = proyecto.asignaciones && proyecto.asignaciones.length > 0 
      ? proyecto.asignaciones[0].usuarioId 
      : '';

    setNuevo({
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      fechaInicio: proyecto.fechaInicio || new Date().toISOString().split('T')[0],
      fechaEntrega: proyecto.fechaEntrega || '',
      prioridad: proyecto.prioridad || 'MEDIA',
      progresoPorcentaje: proyecto.progresoPorcentaje || 0,
      usuarioId: primeraAsignacion || proyecto.usuarioId || '' 
    });
    setEditId(proyecto.id);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setNuevo({
      nombre: '', descripcion: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEntrega: '', prioridad: 'MEDIA', progresoPorcentaje: 0,
      usuarioId: ''
    });
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    const progresoCalculado = calcularProgresoDesdeFechas(nuevo.fechaInicio, nuevo.fechaEntrega);
    
    const endpoint = editId ? `/proyectos/${editId}` : '/proyectos';
    
    const dataCuerpo = { 
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      fechaInicio: nuevo.fechaInicio,
      fechaEntrega: nuevo.fechaEntrega,
      prioridad: nuevo.prioridad,
      progresoPorcentaje: progresoCalculado
    };

    try {
      if (editId) {
        // 1. Forzamos la actualización base del proyecto primero
        await api.put(endpoint, dataCuerpo);
        
        // Si hay un usuario válido seleccionado, esperamos que la asignación termine
        if (nuevo.usuarioId && nuevo.usuarioId.toString().trim() !== "") {
          await api.post(`/proyectos/${editId}/usuarios/${nuevo.usuarioId}?rol=ROLE_ADMIN`);
        }
      } else {
        // 2. Creación del nuevo proyecto
        const response = await api.post(endpoint, dataCuerpo);
        
        if (nuevo.usuarioId && nuevo.usuarioId.toString().trim() !== "" && response.data) {
          const nuevoProyectoId = response.data.id; 
          await api.post(`/proyectos/${nuevoProyectoId}/usuarios/${nuevo.usuarioId}?rol=ROLE_ADMIN`);
        }
      }

      cerrarModal();
      
      // 👇 RETRASO DE ASINCRONÍA DE SEGURIDAD (350ms)
      // Evita que la pantalla se recargue antes de que Spring Boot guarde los cambios en la DB
      setTimeout(() => {
        window.location.reload();
      }, 350);

    } catch (error) {
      if (error.response) {
        console.error("Error del servidor:", error.response.status, error.response.data);
        alert(`Error en el microservicio: ${error.response.status}`);
      } else {
        alert("Error de conexión al procesar la solicitud.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* NAVBAR CON SELECTOR DE VISTAS */}
      <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <FolderKanban className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-white italic tracking-tighter hidden md:block">Suite HealthTech</span>
          </div>

          {/* TABS DE NAVEGACIÓN */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setVista('proyectos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${vista === 'proyectos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutDashboard size={14} /> PROYECTOS
            </button>
            <button 
              onClick={() => setVista('usuarios')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${vista === 'usuarios' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Users size={14} /> USUARIOS
            </button>
          </div>
        </div>

        <button onClick={logout} className="flex items-center gap-2 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-500 px-5 py-2.5 rounded-2xl text-sm font-black transition-all border border-slate-700">
          <LogOut size={18} /> SALIR
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {/* CONTENIDO DINÁMICO */}
        {vista === 'proyectos' ? (
          <>
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-6xl font-black mb-2 text-white tracking-tighter uppercase italic">Gestión</h1>
                <p className="font-bold tracking-widest text-xs uppercase text-slate-500 ml-1">Control de Licencias / Microservicios</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-50 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all hover:-translate-y-1">
                <Plus size={24} strokeWidth={3} /> NUEVO PROYECTO
              </button>
            </header>

            {/* PASAMOS LOS USUARIOS AL COMPONENTE HIJO PARA EL CRUCE DE DATOS */}
            <ListaProyectos onEditar={prepararEdicion} usuarios={usuariosDisponibles} />
          </>
        ) : (
          <GestionUsuarios />
        )}

        {/* MODAL PARA PROYECTOS */}
        {isModalOpen && vista === 'proyectos' && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg p-10 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
              <button onClick={cerrarModal} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={28} /></button>
              
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">{editId ? 'Actualizar' : 'Configurar'}</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Data Integrity / Innovatech</p>

              <form onSubmit={guardarProyecto} className="space-y-6">
                <input type="text" required placeholder="Nombre del Proyecto" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                
                <textarea rows="2" placeholder="Especificaciones..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />

                <div className="grid grid-cols-2 gap-6">
                  <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white" 
                    value={nuevo.fechaInicio} onChange={e => setNuevo({...nuevo, fechaInicio: e.target.value})} />
                  <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white" 
                    value={nuevo.fechaEntrega} onChange={e => setNuevo({...nuevo, fechaEntrega: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white appearance-none outline-none focus:ring-2 focus:ring-blue-600" 
                    value={nuevo.prioridad} onChange={e => setNuevo({...nuevo, prioridad: e.target.value})}>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                  <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-4 flex items-start gap-2">
                    <Info size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight">Progreso automático activado.</p>
                  </div>
                </div>

                {/* COMPONENTE SELECTOR DE RESPONSABLE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Líder / Responsable de Proyecto</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white appearance-none outline-none focus:ring-2 focus:ring-blue-600"
                    value={nuevo.usuarioId}
                    onChange={e => setNuevo({...nuevo, usuarioId: e.target.value})}
                  >
                    <option value="">-- Dejar sin asignar (Opcional) --</option>
                    {usuariosDisponibles.map(usr => (
                      <option key={usr.id} value={usr.id}>
                        {usr.nombre} {usr.apellido || ''} ({usr.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="w-full bg-white hover:bg-blue-50 text-slate-950 py-5 rounded-[2rem] font-black text-lg mt-6 shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95">
                  <Save size={22} strokeWidth={3} /> {editId ? 'SINCRONIZAR' : 'ESTABLECER'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;