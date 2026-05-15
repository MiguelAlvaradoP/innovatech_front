import { useEffect, useState } from 'react';
import api from '../api/axios';
import { LayoutGrid, AlertCircle } from 'lucide-react';

const ListaProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        // El interceptor ya pega el token automáticamente
        // En src/components/ListaProyectos.jsx
const response = await api.get('/proyectos'); // Quita el '/listar' 
        setProyectos(response.data);
      } catch (err) {
        console.error("Error al traer proyectos:", err);
        setError("No se pudieron cargar los proyectos. Revisa si el microservicio está arriba.");
      } finally {
        setLoading(false);
      }
    };

    obtenerProyectos();
  }, []);

  if (loading) return <div className="text-white">Cargando proyectos...</div>;

  if (error) return (
    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
      <AlertCircle size={20} />
      <span>{error}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proyectos.length === 0 ? (
        <p className="text-slate-400">No hay proyectos registrados aún.</p>
      ) : (
        proyectos.map((proyecto) => (
          <div key={proyecto.id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-blue-500 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-2">{proyecto.nombre}</h3>
            <p className="text-slate-400 text-sm">{proyecto.descripcion}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                ID: {proyecto.id}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListaProyectos;