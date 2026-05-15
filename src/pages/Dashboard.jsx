import { useAuth } from '../context/AuthContext';
import ListaProyectos from '../components/ListaProyectos';
import { LogOut, FolderKanban } from 'lucide-react';

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar Simple */}
      <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderKanban className="text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">Innovatech Panel</span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Panel de Proyectos</h1>
          <p className="text-slate-400">Gestiona las licencias y desarrollos de Suite HealthTech.</p>
        </header>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold">Proyectos Activos</h2>
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">Microservicio Proyectos</span>
          </div>
          
          {/* Aquí llamamos al componente funcional */}
          <ListaProyectos />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;