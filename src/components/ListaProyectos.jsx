import React from 'react';

export default function ListaProyectos({ proyectos, onEditar, onEliminar, onCambiarRol }) {
  
  const obtenerNombreRol = (rolId) => {
    const id = Number(rolId);
    if (id === 1) return 'ROLE_ADMIN';
    if (id === 2) return 'ROLE_DEVELOPER';
    if (id === 3) return 'ROLE_TESTER';
    return `ROL ID: ${rolId}`; 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {proyectos.map((proyecto) => {
        return (
          <div key={proyecto.id} className="bg-[#0b132b]/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            
            {/* Cabecera de la Tarjeta */}
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-white uppercase tracking-wide truncate max-w-[70%]" title={proyecto.nombre}>
                  <span className="text-slate-500 mr-1">#</span> {proyecto.nombre}
                </h3>
                
                {/* Botones de Acción (Editar y Eliminar) */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEditar && onEditar(proyecto)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Editar Proyecto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => onEliminar && onEliminar(proyecto.id)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-rose-500 hover:text-rose-400 transition-colors"
                    title="Eliminar Proyecto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-slate-400 text-sm mt-2 font-medium line-clamp-2 min-h-[40px]">
                {proyecto.descripcion || "Sin descripción disponible."}
              </p>

              {/* Fechas con selectores nativos sincronizados */}
              <div className="flex gap-4 mt-4 text-xs font-semibold text-slate-400 bg-[#1c2541]/40 p-2.5 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span>{proyecto.fechaInicio || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{proyecto.fechaEntrega || 'N/A'}</span>
                </div>
              </div>

              {/* Personal Asignado */}
              <div className="mt-5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Personal Asignado:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {proyecto.asignaciones && proyecto.asignaciones.length > 0 ? (
                    proyecto.asignaciones.map((asig) => (
                      <div 
                        key={asig.id} 
                        className="bg-[#1c2541]/60 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center min-h-[50px] hover:border-indigo-500/40 transition-all group cursor-pointer"
                        onClick={() => onCambiarRol && onCambiarRol(proyecto.id, asig.id, asig.rolId === 1 ? 2 : 1)} 
                        title="Haz clic para alternar el rol de este usuario"
                      >
                        <span className="text-xs font-bold text-sky-400 truncate">
                          {asig.usuarioNombre} 
                        </span>
                        
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-0.5 group-hover:text-slate-400 transition-colors">
                          {obtenerNombreRol(asig.rolId)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs italic text-slate-600 col-span-2">Sin personal asignado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer de la Tarjeta (Barra y Progreso Dinámico) */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-black">
                <span className={`uppercase tracking-wider ${
                  proyecto.estadoCalculado === 'COMPLETADO' ? 'text-emerald-400' :
                  proyecto.estadoCalculado === 'ATRASADO' ? 'text-rose-500' :
                  proyecto.estadoCalculado?.includes('CRÍTICO') ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {proyecto.estadoCalculado || 'A TIEMPO'}
                </span>
                <span className="text-white text-lg italic">{proyecto.progresoPorcentaje || 0}%</span>
              </div>
              
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    proyecto.estadoCalculado === 'COMPLETADO' ? 'bg-emerald-400' :
                    proyecto.estadoCalculado === 'ATRASADO' ? 'bg-rose-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${proyecto.progresoPorcentaje || 0}%` }}
                />
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}