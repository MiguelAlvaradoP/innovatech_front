import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { Calendar, ShieldCheck, Clock, Hash, Trash2, Edit3, User } from 'lucide-react';

const ListaProyectos = ({ onEditar, usuarios = [] }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProyectos = async () => {
  try {
    // 👇 Añadimos cabeceras de control de caché para revalidar el microservicio de inmediato
    const response = await api.get('/proyectos', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    setProyectos(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    console.error("Error al conectar con el Gateway desde proyectos:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    cargarProyectos();
  }, []);

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proyecto de la Suite HealthTech?")) return;
    try {
      const res = await api.delete(`/proyectos/${id}`);
      if (res.status === 200 || res.status === 204) {
        setProyectos(proyectos.filter(p => p.id !== id));
      }
    } catch (err) {
      alert("Error al intentar eliminar el proyecto.");
    }
  };

  if (loading) return <div className="text-center py-20 text-blue-500 font-bold animate-pulse">SINCRONIZANDO...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {proyectos.length === 0 ? (
        <div className="text-slate-500 text-center col-span-2 py-10">No se encontraron proyectos disponibles.</div>
      ) : (
        proyectos.map((p) => {
          // Extraemos la lista de asignaciones buscando variantes comunes por seguridad
          const listaAsignaciones = p.asignaciones || p.usuariosAsignados || p.colaboradores || [];

          return (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl group hover:border-blue-500/40 transition-all relative overflow-hidden">
              
              {/* Botones de Acción rápidos */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => onEditar(p)}
                  className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => eliminarProyecto(p.id)}
                  className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-slate-800 p-2 rounded-lg text-slate-500"><Hash size={16} /></div>
                <h3 className="text-xl font-bold text-white pr-16">{p.nombre}</h3>
              </div>

              <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{p.descripcion}</p>

              <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-300">{p.fechaInicio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-300">{p.fechaEntrega || 'Sin fecha'}</span>
                </div>
              </div>

              {/* BLOQUE DE PERSONAL ASIGNADO */}
              <div className="mb-6 space-y-2 bg-slate-950/35 px-4 py-3 rounded-2xl border border-slate-800/60">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-slate-500" /> Personal Asignado:
                </div>
                
                {listaAsignaciones.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listaAsignaciones.map((asig, index) => {
                      // Buscamos el ID del usuario soportando estructuras planas o anidadas
                      const uId = asig.usuarioId || asig.id || asig;
                      const datosUsuario = usuarios.find(u => String(u.id) === String(uId));
                      
                      return (
                        <div 
                          key={asig.id || index} 
                          className="flex flex-col bg-blue-500/10 border border-blue-500/25 px-3 py-1.5 rounded-xl"
                        >
                          <span className="text-xs text-blue-400 font-bold">
                            {datosUsuario 
                              ? `${datosUsuario.nombre} ${datosUsuario.apellido || ''}` 
                              : `ID Usuario: ${uId}`}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                            {asig.rol || asig.role || 'ROLE_ADMIN'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 italic block pl-1">Sin asignar</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-green-400">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase">{p.estadoCalculado || 'A TIEMPO'}</span>
                  </div>
                  <span className="text-xl font-black text-white">{p.progresoPorcentaje}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${p.progresoPorcentaje === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                    style={{ width: `${p.progresoPorcentaje}%` }}
                  ></div>
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
};

export default ListaProyectos;