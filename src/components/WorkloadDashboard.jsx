import React, { useState, useEffect } from 'react';
import { User, Fingerprint, Briefcase, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 🔥 Recibimos 'usuariosGlobales' desde el componente Padre (Dashboard)
const WorkloadDashboard = ({ usuariosGlobales = [], vistaActual }) => {
  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const cargarCargaTrabajo = () => {
    // Ponemos loading en true para limpiar la pantalla de datos viejos mientras descarga los nuevos inserts
    setLoading(true); 
    fetch('http://localhost:8085/api/analytics/dashboard/workload', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      setWorkloadData(data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
      console.error("Error cargando la métrica de carga de trabajo");
    });
  };

  // 2. Modifica este useEffect para que escuche cuando el usuario pulsa el botón "Analytics"
  useEffect(() => {
    if (vistaActual === 'analytics') {
      cargarCargaTrabajo();
    }
  }, [token, vistaActual]);

  const obtenerConfiguracionCarga = (cantidad) => {
    if (cantidad >= 3) {
      return {
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        texto: "SOBRECARGADO",
        bordeHover: "hover:border-red-500/40",
        iconoColor: "text-red-500",
        IconoEstado: AlertTriangle
      };
    } else if (cantidad === 2) {
      return {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        texto: "CARGA IDEAL",
        bordeHover: "hover:border-amber-500/40",
        iconoColor: "text-amber-500",
        IconoEstado: CheckCircle2
      };
    } else {
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        texto: "DISPONIBLE",
        bordeHover: "hover:border-blue-500/40",
        iconoColor: "text-blue-500",
        IconoEstado: Zap
      };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-blue-500 font-black animate-pulse uppercase tracking-widest text-xs">
        Procesando Métricas de Carga...
      </div>
    );
  }

  const usuariosMetricas = workloadData?.detalleCargaTrabajo || [];

  return (
    <div className="space-y-8">
      {/* Mini Resumen Superior */}
      <div className="flex gap-6 items-center bg-slate-950/40 border border-slate-900 rounded-2xl p-4 text-xs tracking-wider font-mono text-slate-400">
        <div>
          ASIGNADOS TOTALES: <span className="text-blue-400 font-bold font-sans text-sm">{workloadData?.usuariosAsignadosAProyectos || 0}</span>
        </div>
        <div className="w-px h-4 bg-slate-800" />
        <div>
          SISTEMA GLOBAL: <span className="text-slate-500 italic">{workloadData?.usuariosSinProyecto || 'ACTIVO'}</span>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {usuariosMetricas.map((u) => {
          const config = obtenerConfiguracionCarga(u.cantidadProyectos);
          const EstadoIcon = config.IconoEstado;

          // 🔥 BUSCAMOS EL NOMBRE REAL DEL USUARIO EN LA LISTA GLOBAL
          const usuarioEncontrado = usuariosGlobales.find(user => user.id === u.usuarioId);
          const nombreAMostrar = usuarioEncontrado ? usuarioEncontrado.username : `Usuario #${u.usuarioId}`;

          return (
            <div 
              key={u.usuarioId} 
              className={`bg-slate-900 border border-slate-800 rounded-[2rem] p-6 transition-all group relative ${config.bordeHover}`}
            >
              <div className="absolute top-6 right-6">
                <EstadoIcon size={16} className={config.iconoColor} />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User size={32} className="text-blue-500" />
                </div>
                
                {/* 🔥 AQUÍ PINTAMOS EL NOMBRE REAL O EL FALLBACK */}
                <h3 className="text-lg font-bold text-white tracking-tight break-all">
                  {nombreAMostrar}
                </h3>
                
                <span className={`text-[10px] px-3 py-1 border rounded-full font-black mt-2 tracking-widest uppercase italic ${config.badge}`}>
                  {config.texto}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-3">
                    <Briefcase size={14} className="text-slate-500" />
                    <span className="text-xs">Proyectos Activos</span>
                  </div>
                  <span className="text-sm font-black text-white font-mono bg-slate-950/60 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {u.cantidadProyectos}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-slate-500">
                  <Fingerprint size={14} />
                  <span className="text-[10px] font-mono uppercase">REF_ID: {u.usuarioId}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkloadDashboard;