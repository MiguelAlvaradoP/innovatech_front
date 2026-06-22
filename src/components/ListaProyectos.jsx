import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert,
  FolderKanban
} from 'lucide-react';

export default function ListaProyectos({ 
  proyectos, 
  usuariosGlobales, 
  onEditar, 
  onEliminar, 
  onCambiarRol, 
  onDesasignar, 
  onVerDetalle,
  onAsignarUsuario 
}) {
  
  const [usuarioSeleccionadoPorProyecto, setUsuarioSeleccionadoPorProyecto] = useState({});

  const manejarSeleccionUsuario = (proyectoId, usuarioId) => {
    setUsuarioSeleccionadoPorProyecto(prev => ({
      ...prev,
      [proyectoId]: usuarioId
    }));
  };

  const ejecutarAsignacion = (proyectoId) => {
    const usuarioId = usuarioSeleccionadoPorProyecto[proyectoId];
    if (!usuarioId) return;
    
    onAsignarUsuario(proyectoId, usuarioId);
    
    setUsuarioSeleccionadoPorProyecto(prev => ({
      ...prev,
      [proyectoId]: ''
    }));
  };

  // Lógica para determinar si el proyecto está fuera de plazo (Atrasado) con Íconos Lucide
  const evaluarEstadoPlazo = (fechaEntregaStr, progreso) => {
    if (progreso === 100) {
      return { 
        texto: 'Terminado', 
        icono: <CheckCircle2 size={12} className="text-emerald-400" />,
        estilo: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
      };
    }
    if (!fechaEntregaStr) {
      return { 
        texto: 'Sin fecha límite', 
        icono: <HelpCircle size={12} className="text-slate-400" />,
        estilo: 'bg-slate-800/40 border-slate-700/30 text-slate-400' 
      };
    }

    const hoy = new Date();
    const limite = new Date(fechaEntregaStr + 'T23:59:59');

    if (hoy > limite) {
      return { 
        texto: 'PROYECTO ATRASADO', 
        icono: <ShieldAlert size={12} className="text-rose-400 animate-pulse" />,
        estilo: 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-black animate-pulse' 
      };
    }
    return { 
      texto: 'En Desarrollo', 
      icono: <Clock size={12} className="text-indigo-400" />,
      estilo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
    };
  };

  // Lógica de estilos e íconos para el nivel de criticidad (Prioridad)
  const obtenerEstiloCriticidad = (prioridad) => {
    switch (prioridad?.toUpperCase()) {
      case 'URGENTE':
        return 'bg-red-600/20 border-red-500/40 text-red-400 font-extrabold';
      case 'ALTA':
        return 'bg-amber-600/20 border-amber-500/30 text-amber-400 font-bold';
      case 'MEDIA':
        return 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400';
      case 'BAJA':
        return 'bg-slate-800/60 border-slate-700/40 text-slate-400';
      default:
        return 'bg-slate-800/60 border-slate-700/40 text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {proyectos.map((proy) => {
        const usuariosDisponibles = (usuariosGlobales || []).filter(
          u => !(proy.asignaciones || []).some(asig => asig.usuarioId === u.id)
        );

        const porcentaje = proy.progresoPorcentaje || 0;
        let colorBarra = 'bg-indigo-500';
        if (porcentaje === 100) colorBarra = 'bg-emerald-500';
        else if (porcentaje > 0 && porcentaje < 40) colorBarra = 'bg-rose-500';

        const estadoPlazo = evaluarEstadoPlazo(proy.fechaEntrega, porcentaje);
        const estiloCriticidad = obtenerEstiloCriticidad(proy.prioridad);

        return (
          <div key={proy.id} className="bg-[#0b132b]/40 border border-slate-900 rounded-3xl p-6 relative backdrop-blur-md flex flex-col justify-between group">
            
            <div>
              {/* Encabezado Superior Metadatos y Botones */}
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className={`px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${estadoPlazo.estilo}`}>
                  {estadoPlazo.icono}
                  <span>{estadoPlazo.texto}</span>
                </div>

                <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditar(proy)} className="p-2 bg-slate-900/60 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-xl transition-all">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => onEliminar(proy.id)} className="p-2 bg-slate-900/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Título e Indicadores del Proyecto */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-100 flex items-center gap-2">
                  <span className="text-indigo-500 font-mono">#</span> {proy.nombre}
                </h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-900/80 border border-slate-800/80 px-2.5 py-0.5 rounded-md">
                    Líder: {proy.liderNombre}
                  </span>

                  <span className={`text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-md flex items-center gap-1 ${estiloCriticidad}`}>
                    <AlertTriangle size={11} />
                    <span>{proy.prioridad || 'MEDIA'}</span>
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-slate-400 text-xs mt-3.5 h-8 line-clamp-2">{proy.descripcion}</p>

              {/* Fechas de Bitácora */}
              <div className="flex gap-4 mt-4 text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={12}/> {proy.fechaInicio || 'N/A'}</span>
                <span className="flex items-center gap-1"><Calendar size={12}/> {proy.fechaEntrega || 'N/A'}</span>
              </div>

              {/* Acceso al Backlog */}
              <button
                  onClick={() => onVerDetalle(proy.id)}
                  className="mt-4 w-full bg-slate-900/50 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <FolderKanban size={13} />
                <span>Gestionar Backlog & Tareas</span>
              </button>

              {/* SECCIÓN DEL PERSONAL ASIGNADO */}
              <div className="mt-6 border-t border-slate-900/60 pt-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Personal Asignado:</h4>
                
                {proy.asignaciones && proy.asignaciones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {proy.asignaciones.map((asig) => (
                      <div key={asig.id} className="bg-[#1c2541]/30 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{asig.usuarioNombre}</p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                            {asig.rolNombre || `Rol ID: ${asig.rolId || '2'}`}
                          </p>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => onDesasignar(proy.id, asig.id, asig.usuarioNombre)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 italic font-medium">Sin desarrolladores asignados aún.</p>
                )}
              </div>
            </div>

            {/* Contenedor Inferior: Progreso Metas + Selector */}
            <div className="mt-6 pt-4 border-t border-slate-900/40 space-y-4">
              
              {/* Barra de Progreso */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Progreso Global</span>
                  <span className={porcentaje === 100 ? "text-emerald-400" : "text-indigo-400"}>{porcentaje}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full ${colorBarra} transition-all duration-500 ease-out`} 
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>

              {/* Selector de Miembros */}
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-[#1c2541]/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  value={usuarioSeleccionadoPorProyecto[proy.id] || ''}
                  onChange={(e) => manejarSeleccionUsuario(proy.id, e.target.value)}
                >
                  <option value="">-- Asignar Miembro --</option>
                  {usuariosDisponibles.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!usuarioSeleccionadoPorProyecto[proy.id]}
                  onClick={() => ejecutarAsignacion(proy.id)}
                  className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-400 hover:text-white p-2 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-indigo-600/20 disabled:text-indigo-400"
                >
                  <UserPlus size={14} />
                </button>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}