import React, { useState, useEffect } from 'react';
import ListaProyectos from '../components/ListaProyectos';
import GestionUsuarios from './GestionUsuarios';
import WorkloadDashboard from '../components/WorkloadDashboard'; // Componente Analytics de Kafka
import ProyectoDetalle from '../components/ProyectoDetalle';

export default function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [usuariosGlobales, setUsuariosGlobales] = useState([]);
  const [vistaActual, setVistaActual] = useState('proyectos'); // 'proyectos', 'usuarios', o 'analytics'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuariosLegacy, setUsuariosLegacy] = useState(false); // Flag para el respaldo
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState(null); // Estado para la sub-vista de tareas

  // Estados para controlar la visibilidad de los Modales
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);

  // Estructura limpia alineada con tu Entidad de Spring Boot (usuarioId es SOLO el Líder)
  const estructuraProyectoBase = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaEntrega: '',
    prioridad: 'MEDIA',
    usuarioId: '', // Este campo mapea estrictamente al Líder (usuario_id) en el Backend
    tasks: [],
    asignaciones: []
  };

  const [nuevoProyecto, setNuevoProyecto] = useState({ ...estructuraProyectoBase });
  const [proyectoAEditar, setProyectoAEditar] = useState(null);

  const API_BASE_URL = 'http://localhost:8085/api/proyectos';
  const API_USUARIOS_URL = 'http://localhost:8085/api/usuarios';

  const obtenerHeadersAutenticadas = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      const headers = obtenerHeadersAutenticadas();

      // 1. Cargar proyectos
      const resProyectos = await fetch(API_BASE_URL, { method: 'GET', headers });
      if (resProyectos.status === 401 || resProyectos.status === 403) {
        throw new Error('No autorizado. Tu sesión ha expirado.');
      }

      const textoRespuesta = await resProyectos.text();
      let dataProyectos = [];

      try {
        if (textoRespuesta && textoRespuesta.trim().length > 0) {
          dataProyectos = JSON.parse(textoRespuesta);
        }
      } catch (parseError) {
        console.error("Contenido conflictivo recibido del servidor:", textoRespuesta);
        throw new Error('El servidor devolvió una respuesta ilegible.');
      }

      // 2. Cargar usuarios del ecosistema
      try {
        const resUsuarios = await fetch(API_USUARIOS_URL, { method: 'GET', headers });
        if (resUsuarios.ok) {
          const dataUsuarios = await resUsuarios.json();
          setUsuariosGlobales(dataUsuarios);
          setUsuariosLegacy(false);
        } else {
          throw new Error("Respuesta de usuarios no exitosa.");
        }
      } catch (uErr) {
        console.warn("Usando usuarios de respaldo locales:", uErr);
        setUsuariosLegacy(true);
        setUsuariosGlobales([
          { id: 14, username: 'sebastian_dev' },
          { id: 15, username: 'granu_admin' },
          { id: 1, username: 'coordinador_aws' }
        ]);
      }

      setProyectos(dataProyectos || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error en la carga general:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const manejarVolverAParrilla = () => {
    setProyectoSeleccionadoId(null);
    cargarDatosDashboard(); 
  };

  // Endpoint para agregar miembros al equipo (sin alterar al Líder)
  const handleAsignarUsuarioAProyecto = async (proyectoId, usuarioId) => {
    if (!usuarioId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${proyectoId}/usuarios/${usuarioId}`, {
        method: 'POST',
        headers: obtenerHeadersAutenticadas()
      });
      if (!response.ok) {
        const errTexto = await response.text();
        console.error("⚠️ Error en endpoint de asignación:", errTexto);
      }
    } catch (err) {
      console.error("❌ Fallo crítico al conectar con endpoint de asignación:", err);
    }
  };

  const handleDesasignarUsuario = async (proyectoId, asignacionId, username) => {
    if (window.confirm(`¿Estás seguro de que deseas desasignar a ${username} de este proyecto?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${proyectoId}/asignaciones/${asignacionId}`, {
          method: 'DELETE',
          headers: obtenerHeadersAutenticadas()
        });
        if (response.ok) {
          cargarDatosDashboard();
        } else {
          const errTexto = await response.text();
          alert(`No se pudo desasignar al usuario: ${errTexto}`);
        }
      } catch (err) {
        console.error("❌ Error al conectar con el endpoint de desasignación:", err);
      }
    }
  };

  const handleGuardarNuevoProyecto = async (e) => {
    e.preventDefault();
    try {
      const idLiderLimpio = nuevoProyecto.usuarioId && Number(nuevoProyecto.usuarioId) !== 0
          ? Number(nuevoProyecto.usuarioId)
          : null;

      if (idLiderLimpio && !usuariosGlobales.some(u => u.id === idLiderLimpio)) {
        alert("El Líder seleccionado no es válido en el ecosistema actual.");
        return;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: obtenerHeadersAutenticadas(),
        body: JSON.stringify({
          nombre: nuevoProyecto.nombre,
          descripcion: nuevoProyecto.descripcion,
          fechaInicio: nuevoProyecto.fechaInicio,
          fechaEntrega: nuevoProyecto.fechaEntrega,
          prioridad: nuevoProyecto.prioridad,
          usuarioId: idLiderLimpio, // Asignación de columna líder directa
          tasks: []
        })
      });

      if (response.ok) {
        setIsCrearModalOpen(false);
        setNuevoProyecto({ ...estructuraProyectoBase });
        cargarDatosDashboard();
      } else {
        alert('Error en el servidor al intentar crear el proyecto.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardarEdicionProyecto = async (e) => {
    e.preventDefault();
    try {
      const idLiderLimpio = proyectoAEditar.usuarioId && Number(proyectoAEditar.usuarioId) !== 0
          ? Number(proyectoAEditar.usuarioId)
          : null;

      if (idLiderLimpio && !usuariosGlobales.some(u => u.id === idLiderLimpio)) {
        alert("El Líder seleccionado ya no se encuentra disponible.");
        return;
      }

      const bodyPayload = {
        id: proyectoAEditar.id,
        nombre: proyectoAEditar.nombre,
        descripcion: proyectoAEditar.descripcion,
        fechaInicio: proyectoAEditar.fechaInicio,
        fechaEntrega: proyectoAEditar.fechaEntrega,
        prioridad: proyectoAEditar.prioridad || "MEDIA",
        usuarioId: idLiderLimpio, // Conserva/Modifica el líder sin dañar asignaciones
        tasks: proyectoAEditar.tasks || [],
        asignaciones: proyectoAEditar.asignaciones || []
      };

      const response = await fetch(`${API_BASE_URL}/${proyectoAEditar.id}`, {
        method: 'PUT',
        headers: obtenerHeadersAutenticadas(),
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        setIsEditarModalOpen(false);
        setProyectoAEditar(null);
        cargarDatosDashboard();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error en el servidor: ${errData.message || 'Verifica la consola'}`);
      }
    } catch (err) {
      console.error("Error en la petición PUT:", err);
    }
  };

  const handleCambiarRolAsignacion = async (proyectoId, asignacionId, nuevoRolId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${proyectoId}/asignaciones/${asignacionId}`, {
        method: 'PUT',
        headers: obtenerHeadersAutenticadas(),
        body: JSON.stringify({ rolId: Number(nuevoRolId) })
      });
      if (response.ok) cargarDatosDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarProyecto = async (proyectoId) => {
    if (window.confirm('¿Seguro que deseas eliminar este proyecto de la suite?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${proyectoId}`, {
          method: 'DELETE',
          headers: obtenerHeadersAutenticadas()
        });
        if (response.ok) cargarDatosDashboard();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAbrirEditar = (proyecto) => {
    setProyectoAEditar({
      ...proyecto,
      usuarioId: proyecto.usuarioId || ''
    });
    setIsEditarModalOpen(true);
  };

  // Mapeo seguro con nombres de usuarios para el Líder y las Asignaciones
  const proyectosConNombresDeUsuario = (proyectos || []).map(proy => {
    const liderEncontrado = (usuariosGlobales || []).find(u => u.id === proy.usuarioId);
    return {
      ...proy,
      liderNombre: liderEncontrado ? liderEncontrado.username : "⚠️ Líder no asignado",
      asignaciones: (proy.asignaciones || []).map(asig => {
        const usuarioEncontrado = (usuariosGlobales || []).find(u => u.id === asig.usuarioId);
        return {
          ...asig,
          usuarioNombre: usuarioEncontrado ? usuarioEncontrado.username : "⚠️ Perfil no disponible"
        };
      })
    };
  });

  const totalProyectos = proyectos.length;
  const proyectosCompletados = proyectos.filter(p => p.progresoPorcentaje === 100).length;
  const proyectosCriticos = proyectos.filter(p => p.prioridad === 'ALTA' || p.prioridad === 'URGENTE').length;

  const avancePromedio = totalProyectos > 0
      ? Math.round(proyectos.reduce((acc, p) => acc + (p.progresoPorcentaje || 0), 0) / totalProyectos)
      : 0;

  return (
      <div className="min-h-screen bg-[#0a0f1d] text-white font-sans antialiased">
        
        {/* Cabecera / Navbar */}
        <header className="border-b border-slate-900 bg-[#0b132b]/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.382l-.724-1.447A1.5 1.5 0 009.553 4H3.75A1.5 1.5 0 002.25 5.5v13.5A3 3 0 005.25 21h14.25z" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-wider text-slate-100 uppercase">
              Suite <span className="text-indigo-500">HealthTech</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex gap-2">
              <button onClick={() => { setVistaActual('proyectos'); manejarVolverAParrilla(); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${vistaActual === 'proyectos' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
                Proyectos
              </button>
              <button onClick={() => { setVistaActual('usuarios'); setProyectoSeleccionadoId(null); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${vistaActual === 'usuarios' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
                Usuarios
              </button>
              <button onClick={() => { setVistaActual('analytics'); setProyectoSeleccionadoId(null); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${vistaActual === 'analytics' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
                Analytics
              </button>
            </nav>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
              ← Salir
            </button>
          </div>
        </header>

        {usuariosLegacy && !loading && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 px-6 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
            ⚠️ El servicio externo de identidades no responde. Mostrando perfiles de respaldo locales.
          </div>
        )}

        {/* Contenido de la Aplicación */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-slate-900">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {vistaActual === 'proyectos' && proyectoSeleccionadoId ? 'Sprint Board' : vistaActual === 'proyectos' ? 'Gestión' : vistaActual === 'usuarios' ? 'Personal' : 'Métricas'}
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                Control de Licencias / Microservicios / Kafka
              </p>
            </div>
            {vistaActual === 'proyectos' && !proyectoSeleccionadoId && (
                <button onClick={() => setIsCrearModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
                  Nuevo Proyecto
                </button>
            )}
          </div>

          {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Estableciendo conexiones...</p>
              </div>
          ) : error ? (
              <div className="bg-rose-500/10 text-rose-400 p-6 rounded-2xl mt-8 text-sm font-semibold flex items-center justify-between">
                <span>⚠️ Error: {error}</span>
                <button onClick={cargarDatosDashboard} className="bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wide">Sincronizar</button>
              </div>
          ) : vistaActual === 'proyectos' ? (
              proyectoSeleccionadoId ? (
                  <ProyectoDetalle
                      proyectoId={proyectoSeleccionadoId}
                      onVolver={manejarVolverAParrilla}
                      token={localStorage.getItem('token')}
                      onProyectoModificado={cargarDatosDashboard}
                  />
              ) : (
                  <div className="space-y-10 mt-8">
                    {/* TARJETAS DE RESUMEN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="bg-[#0b132b]/30 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
                        <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Proyectos Activos</p>
                        <p className="text-3xl font-black tracking-tight text-white mt-1">{totalProyectos}</p>
                      </div>
                      <div className="bg-[#0b132b]/30 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
                        <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Avance Promedio</p>
                        <p className="text-3xl font-black tracking-tight text-indigo-400 mt-1">{avancePromedio}%</p>
                      </div>
                      <div className="bg-[#0b132b]/30 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
                        <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Cerrados / Listos</p>
                        <p className="text-3xl font-black tracking-tight text-emerald-400 mt-1">{proyectosCompletados}</p>
                      </div>
                      <div className="bg-[#0b132b]/30 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
                        <p className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Criticidad Alta</p>
                        <p className="text-3xl font-black tracking-tight text-rose-400 mt-1">{proyectosCriticos}</p>
                      </div>
                    </div>

                    {/* Listado General */}
                    <div>
                      <div className="mb-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Parrilla Operativa de Proyectos</h2>
                      </div>
                      {/* 🌟 AQUÍ SE INTEGRÓ EL SELECTOR Y LA FUNCIÓN DE ASIGNACIÓN EN TIEMPO REAL */}
                      <ListaProyectos
                          proyectos={proyectosConNombresDeUsuario}
                          usuariosGlobales={usuariosGlobales}
                          onEditar={handleAbrirEditar}
                          onEliminar={handleEliminarProyecto}
                          onCambiarRol={handleCambiarRolAsignacion}
                          onDesasignar={handleDesasignarUsuario}
                          onVerDetalle={(id) => setProyectoSeleccionadoId(id)}
                          onAsignarUsuario={async (proyectoId, usuarioId) => {
                            await handleAsignarUsuarioAProyecto(proyectoId, usuarioId);
                            cargarDatosDashboard(); 
                          }}
                      />
                    </div>
                  </div>
              )
          ) : vistaActual === 'usuarios' ? (
              <GestionUsuarios />
          ) : (
              <WorkloadDashboard usuariosGlobales={usuariosGlobales} vistaActual={vistaActual} />
          )}
        </main>

        {/* MODAL CREAR PROYECTO */}
        {isCrearModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl my-8">
                <h2 className="text-xl font-black uppercase tracking-wide border-b border-slate-800 pb-3 mb-4 text-indigo-400">Nueva Tarjeta de Proyecto</h2>
                <form onSubmit={handleGuardarNuevoProyecto} className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nombre del Proyecto</label>
                      <input type="text" required className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={nuevoProyecto.nombre} onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Prioridad (Nivel de Criticidad)</label>
                      <select className="w-full bg-[#1c2541] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={nuevoProyecto.prioridad} onChange={(e) => setNuevoProyecto({...nuevoProyecto, prioridad: e.target.value})}>
                        <option value="BAJA">BAJA</option>
                        <option value="MEDIA">MEDIA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="URGENTE">URGENTE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descripción de Objetivos</label>
                    <textarea className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white h-20 resize-none focus:outline-none focus:border-indigo-500" value={nuevoProyecto.descripcion} onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha de Inicio</label>
                      <input type="date" className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none" value={nuevoProyecto.fechaInicio} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fechaInicio: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha de Entrega</label>
                      <input type="date" className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none" value={nuevoProyecto.fechaEntrega} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fechaEntrega: e.target.value})}/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Asignar Responsable Principal (Líder)</label>
                    <select className="w-full bg-[#1c2541] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500" value={nuevoProyecto.usuarioId} onChange={(e) => setNuevoProyecto({...nuevoProyecto, usuarioId: e.target.value})}>
                      <option value="">-- Seleccionar Líder --</option>
                      {(usuariosGlobales || []).map(u => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <button type="button" onClick={() => setIsCrearModalOpen(false)} className="w-1/2 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cancelar</button>
                    <button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white">Crear Proyecto</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* MODAL MODIFICAR PROYECTO */}
        {isEditarModalOpen && proyectoAEditar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl my-8">
                <h2 className="text-xl font-black uppercase tracking-wide border-b border-slate-800 pb-3 mb-4 text-amber-400">Modificar Tarjeta de Proyecto</h2>
                <form onSubmit={handleGuardarEdicionProyecto} className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nombre del Proyecto</label>
                      <input type="text" required className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" value={proyectoAEditar.nombre} onChange={(e) => setProyectoAEditar({...proyectoAEditar, nombre: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Prioridad (Nivel de Criticidad)</label>
                      <select className="w-full bg-[#1c2541] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500" value={proyectoAEditar.prioridad || 'MEDIA'} onChange={(e) => setProyectoAEditar({...proyectoAEditar, prioridad: e.target.value})}>
                        <option value="BAJA">BAJA</option>
                        <option value="MEDIA">MEDIA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="URGENTE">URGENTE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descripción de Objetivos</label>
                    <textarea className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white h-20 resize-none focus:outline-none focus:border-amber-500" value={proyectoAEditar.descripcion || ''} onChange={(e) => setProyectoAEditar({...proyectoAEditar, descripcion: e.target.value})}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha de Inicio</label>
                      <input type="date" className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none" value={proyectoAEditar.fechaInicio || ''} onChange={(e) => setProyectoAEditar({...proyectoAEditar, fechaInicio: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha de Entrega</label>
                      <input type="date" className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none" value={proyectoAEditar.fechaEntrega || ''} onChange={(e) => setProyectoAEditar({...proyectoAEditar, fechaEntrega: e.target.value})}/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Modificar Responsable Principal (Líder)</label>
                    <select
                        className="w-full bg-[#1c2541] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        value={proyectoAEditar.usuarioId || ''}
                        onChange={(e) => setProyectoAEditar({...proyectoAEditar, usuarioId: e.target.value})}
                    >
                      <option value="">-- Sin Responsable --</option>
                      {(usuariosGlobales || []).map(u => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <button type="button" onClick={() => { setIsEditarModalOpen(false); setProyectoAEditar(null); }} className="w-1/2 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cancelar</button>
                    <button type="submit" className="w-1/2 bg-amber-500 hover:bg-amber-400 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-black">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
        )}

      </div>
  );
}