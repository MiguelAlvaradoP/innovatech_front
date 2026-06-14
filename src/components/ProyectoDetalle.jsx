import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Edit3, Trash2, ArrowLeft, Layers } from 'lucide-react';

export default function ProyectoDetalle({ proyectoId, onVolver, token }) {
    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Control del Modal de Tarea
    const [showModal, setShowModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskForm, setTaskForm] = useState({
        titulo: '',
        descripcion: '',
        estado: 'Pendiente',
        fechaVencimiento: ''
    });

    const API_PROYECTOS = `http://localhost:8085/api/proyectos/${proyectoId}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };

    const cargarProyectoExtendido = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_PROYECTOS, { method: 'GET', headers });
            if (!res.ok) throw new Error('No se pudo recuperar el backlog de tareas.');
            const data = await res.json();
            setProyecto(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (proyectoId) cargarProyectoExtendido();
    }, [proyectoId]);

    const handleOpenCrear = () => {
        setEditingTaskId(null);
        setTaskForm({ titulo: '', descripcion: '', estado: 'Pendiente', fechaVencimiento: '' });
        setShowModal(true);
    };

    const handleOpenEditar = (task) => {
        setEditingTaskId(task.id);
        setTaskForm({
            titulo: task.titulo,
            descripcion: task.descripcion,
            estado: task.estado,
            fechaVencimiento: task.fechaVencimiento || ''
        });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const url = editingTaskId
            ? `${API_PROYECTOS}/tasks/${editingTaskId}`
            : `${API_PROYECTOS}/tasks`;
        const method = editingTaskId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(taskForm)
            });
            if (res.ok) {
                setShowModal(false);
                cargarProyectoExtendido();
            } else {
                alert('Error al procesar la tarea en la base de datos.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEliminarTask = async (taskId) => {
        if (!window.confirm("¿Remover esta tarea permanentemente del sprint?")) return;
        try {
            const res = await fetch(`${API_PROYECTOS}/tasks/${taskId}`, { method: 'DELETE', headers });
            if (res.ok) cargarProyectoExtendido();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-20 text-indigo-500 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando Tablero Kanban...</div>;
    if (error) return <div className="bg-rose-500/10 text-rose-400 p-6 rounded-2xl text-sm">{error}</div>;

    // Distribución de tareas en las columnas Kanban
    const columnas = {
        'Pendiente': proyecto?.tasks?.filter(t => t.estado === 'Pendiente') || [],
        'En Progreso': proyecto?.tasks?.filter(t => t.estado === 'En Progreso') || [],
        'Completada': proyecto?.tasks?.filter(t => t.estado === 'Completada') || []
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Botón Volver y Header del Proyecto */}
            <div className="flex flex-col gap-4">
                <button onClick={onVolver} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-white self-start transition-colors">
                    <ArrowLeft size={14} /> Volver a la parrilla general
                </button>

                <div className="bg-[#0b132b]/40 border border-slate-900 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-100"><Layers size={140}/></div>
                    <span className="text-[10px] font-black tracking-widest bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-md uppercase">
            Sprint Board Activo
          </span>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mt-3">{proyecto.nombre}</h2>
                    <p className="text-slate-400 text-sm mt-2 max-w-3xl">{proyecto.descripcion}</p>
                </div>
            </div>

            {/* Controladores del Tablero */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Estructura de Tareas</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Planificación asignada por microservicio</p>
                </div>
                <button onClick={handleOpenCrear} className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/10 transition-all active:scale-95">
                    <Plus size={16} /> Añadir Tarea
                </button>
            </div>

            {/* Grid Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(columnas).map((colName) => (
                    <div key={colName} className="bg-[#0b132b]/20 border border-slate-900/60 rounded-3xl p-5 min-h-[450px] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{colName}</span>
                            <span className="bg-slate-900 text-slate-400 font-mono text-xs px-2.5 py-0.5 rounded-md border border-slate-800">{columnas[colName].length}</span>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {columnas[colName].map((task) => (
                                <div key={task.id} className="bg-[#0b132b]/60 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition-all group relative">

                                    {/* Acciones de la Tarea */}
                                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditar(task)} className="p-1.5 bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800 rounded-md transition-colors">
                                            <Edit3 size={12} />
                                        </button>
                                        <button onClick={() => handleEliminarTask(task.id)} className="p-1.5 bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-md transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-100 pr-12">{task.titulo}</h4>
                                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-3">{task.descripcion || 'Sin descripción detallada.'}</p>

                                    {task.fechaVencimiento && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-900/60">
                                            <Calendar size={11} /> Deadline: {task.fechaVencimiento}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {columnas[colName].length === 0 && (
                                <div className="h-full flex items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl">
                                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Vacío</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR / EDITAR TAREA */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-black uppercase tracking-wide border-b border-slate-800 pb-3 mb-5 text-indigo-400">
                            {editingTaskId ? 'Modificar Req. Tarea' : 'Registrar Nueva Tarea'}
                        </h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Título de la actividad</label>
                                <input type="text" required value={taskForm.titulo} onChange={e => setTaskForm({...taskForm, titulo: e.target.value})} className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Ej: Implementar DTO de login"/>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Especificación técnica</label>
                                <textarea rows="3" value={taskForm.descripcion} onChange={e => setTaskForm({...taskForm, descripcion: e.target.value})} className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-indigo-500" placeholder="Detalles operativos..."/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estado Sprint</label>
                                    <select value={taskForm.estado} onChange={e => setTaskForm({...taskForm, estado: e.target.value})} className="w-full bg-[#1c2541] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500">
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En Progreso">En Progreso</option>
                                        <option value="Completada">Completada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vencimiento</label>
                                    <input type="date" value={taskForm.fechaVencimiento} onChange={e => setTaskForm({...taskForm, fechaVencimiento: e.target.value})} className="w-full bg-[#1c2541]/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"/>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cancelar</button>
                                <button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white">Guardar Ficha</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}