import React from 'react';
import { X, Edit3, Trash2, Calendar } from 'lucide-react';

export default function ListaProyectos({ proyectos, onEditar, onEliminar, onCambiarRol, onDesasignar, onVerDetalle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {proyectos.map((proy) => (
        <div key={proy.id} className="bg-[#0b132b]/40 border border-slate-900 rounded-3xl p-6 relative backdrop-blur-md flex flex-col justify-between">
          
          <div>
            {/* Botones de Acción del Proyecto (Editar/Eliminar) */}
            <div className="absolute top-6 right-6 flex gap-2">
              <button onClick={() => onEditar(proy)} className="p-2 bg-slate-900/60 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-xl transition-all">
                <Edit3 size={14} />
              </button>
              <button onClick={() => onEliminar(proy.id)} className="p-2 bg-slate-900/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Info Básica */}
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <span className="text-indigo-500 font-mono">#</span> {proy.nombre}
            </h3>
            <p className="text-slate-400 text-xs mt-1 h-8 line-clamp-2">{proy.descripcion}</p>

            {/* Fechas */}
            <div className="flex gap-4 mt-4 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={12}/> {proy.fechaInicio || 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar size={12}/> {proy.fechaEntrega || 'N/A'}</span>
            </div>
            {/* 🔥 BOTÓN AGREGADO: Ver Sprint (Tareas) */}
            <button
                onClick={() => onVerDetalle(proy.id)}
                className="mt-4 w-full bg-slate-900/50 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 rounded-xl py-2 text-xs font-black uppercase tracking-wider transition-all text-center"
            >
              💼 Gestionar Backlog & Tareas
            </button>
            {/* SECCIÓN DEL PERSONAL ASIGNADO */}
            <div className="mt-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Personal Asignado:</h4>
              <div className="grid grid-cols-2 gap-2">
                {(proy.asignaciones || []).map((asig) => (
                  <div key={asig.id} className="bg-[#1c2541]/30 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center group/user">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{asig.usuarioNombre}</p>
                      <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                        {asig.rolNombre || `Rol ID: ${asig.rolId || 'NULL'}`}
                      </p>
                    </div>
                    
                    {/* BOTÓN DE DESASIGNACIÓN */}
                    <button 
                      type="button"
                      onClick={() => onDesasignar(proy.id, asig.id, asig.usuarioNombre)}
                      className="p-1 bg-slate-950/40 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-md transition-all opacity-60 group-hover/user:opacity-100"
                      title="Desasignar usuario"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección Inferior: Estado y Barra de Progreso Dinámica */}
          <div className="mt-6 pt-4 border-t border-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase ${
                proy.progresoPorcentaje === 100 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : proy.estadoCalculado === 'CRÍTICO' || proy.estadoCalculado === 'CRÍTICO (Próximo a vencer)'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
              }`}>
                {proy.progresoPorcentaje === 100 ? 'COMPLETADO' : proy.estadoCalculado}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">{proy.progresoPorcentaje}%</span>
            </div>

            {/* Contenedor de la barra (Fondo hundido) */}
            <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-slate-900">
              {/* Relleno dinámico mapeado al % de Spring Boot */}
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  proy.progresoPorcentaje === 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : proy.estadoCalculado === 'CRÍTICO' || proy.estadoCalculado === 'CRÍTICO (Próximo a vencer)'
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                      : 'bg-gradient-to-r from-indigo-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                }`}
                style={{ width: `${proy.progresoPorcentaje}%` }}
              />
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}