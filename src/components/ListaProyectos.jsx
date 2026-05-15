import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, Clock, Hash, Trash2, Edit3 } from 'lucide-react';

const ListaProyectos = ({ onEditar }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProyectos = () => {
    fetch('http://localhost:8085/api/proyectos')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProyectos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proyecto de la Suite HealthTech?")) return;
    
    try {
      const res = await fetch(`http://localhost:8085/api/proyectos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProyectos(proyectos.filter(p => p.id !== id));
      } else {
        alert("No se pudo eliminar el proyecto.");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="text-center py-20 text-blue-500 font-bold animate-pulse">SINCRONIZANDO...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {proyectos.map((p) => (
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

          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              <span className="text-xs font-mono text-slate-300">{p.fechaInicio}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs font-mono text-slate-300">{p.fechaEntrega}</span>
            </div>
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
      ))}
    </div>
  );
};

export default ListaProyectos;