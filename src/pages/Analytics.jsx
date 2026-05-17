import React from 'react';
import WorkloadDashboard from '../components/WorkloadDashboard';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado de la página */}
        <div className="flex items-center gap-3 border-b border-slate-900 pb-6">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              Métricas de <span className="text-blue-500">Analytics</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase tracking-widest">
              Carga operativa y procesamiento de tópicos Kafka
            </p>
          </div>
        </div>

        {/* Inyección del dashboard de tarjetas */}
        <div className="mt-6">
          <WorkloadDashboard />
        </div>

      </div>
    </div>
  );
};

export default Analytics;