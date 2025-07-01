import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek, isWithinInterval, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';

import { useAuth } from '../auth/AuthContext';
import { getAssignedTasks, getAllTasks, changeStatus } from '../api/tasks';

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

// Formateador corto para fechas
const fmtShort = (d) => (d ? format(new Date(d), 'dd MMM yyyy') : '-');
const fmt = (d) => (d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '-');

// Colores para eventos y badges de estado (igual que TasksAdmin)
const getStatusClass = (status) => {
  const classes = {
    pendiente: 'bg-gray-200 text-gray-800',
    asignada: 'bg-blue-100 text-blue-800',
    'en-progreso': 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    finalizada: 'bg-green-100 text-green-800',
    // fallback para compatibilidad
    Pendiente: 'bg-gray-200 text-gray-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    Finalizada: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Marca de borde para eventos en el calendario
const getEventBorderClass = (status) => {
  const borders = {
    pendiente: 'border-l-4 border-gray-400',
    asignada: 'border-l-4 border-blue-500',
    'en-progreso': 'border-l-4 border-blue-500',
    completada: 'border-l-4 border-green-600',
    finalizada: 'border-l-4 border-green-600',
    Pendiente: 'border-l-4 border-gray-400',
    'En Progreso': 'border-l-4 border-blue-500',
    Finalizada: 'border-l-4 border-green-600',
  };
  return borders[status] || 'border-l-4 border-gray-300';
};

const getEventClass = (status) => `${getStatusClass(status)} ${getEventBorderClass(status)}`;

export default function CalendarSG() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, task: null, nextStatus: '', action: null });

  useEffect(() => {
    (user.role === 'sg' ? getAssignedTasks() : getAllTasks())
      .then(r => setTasks(r.data));
  }, [user.role]);

  // Modal de confirmación para cambiar estado
  function handleStatus(task, nextStatus) {
    setConfirmModal({ show: true, task, nextStatus, action: async () => {
      await changeStatus(task.id, nextStatus);
      setTasks(s => s.map(k => k.id === task.id ? { ...k, status: nextStatus } : k));
      setConfirmModal({ show: false, task: null, nextStatus: '', action: null });
    }});
  }
  function closeConfirmModal() {
    setConfirmModal({ show: false, task: null, nextStatus: '', action: null });
  }

  // Navegación de semanas
  const goToPrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToThisWeek = () => setCurrentWeek(new Date());

  // Calcular inicio y fin de la semana actual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1, locale: es });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1, locale: es });

  // Filtros
  const filteredTasks = tasks.filter(task => {
    const statusMatch = !taskFilter || task.status.toLowerCase().replace(' ', '-') === taskFilter;
    const searchMatch = !taskSearch || task.title.toLowerCase().includes(taskSearch.toLowerCase());
    // Solo tareas de la semana actual
    if (!task.dueAt) return false;
    const taskDate = typeof task.dueAt === 'string' ? parseISO(task.dueAt) : new Date(task.dueAt);
    const inWeek = isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    return statusMatch && searchMatch && inWeek;
  });

  // Días y horas de la semana
  const weekDays = [
    { label: 'Lun', day: 1 },
    { label: 'Mar', day: 2 },
    { label: 'Mié', day: 3 },
    { label: 'Jue', day: 4 },
    { label: 'Vie', day: 5 },
    { label: 'Sáb', day: 6 },
    { label: 'Dom', day: 0 }
  ];
  const hours = [8,9,10,11,12,13,14,15,16,17,18];

  // Mostrar rango de la semana
  const weekRange = `${format(weekStart, "d 'de' MMMM", { locale: es })} - ${format(weekEnd, "d 'de' MMMM yyyy", { locale: es })}`;

  // Funciones para detalles
  const openDetail = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };
  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  // Clases para tipo, prioridad (similares a TasksAdmin)
  const getPriorityClass = (priority) => {
    const classes = {
      Alta: 'bg-red-100 text-red-800',
      Media: 'bg-yellow-100 text-yellow-800',
      Baja: 'bg-green-100 text-green-800',
    };
    return classes[priority] || '';
  };
  const getServiceClass = (type) => {
    const classes = {
      Retiro: 'bg-purple-100 text-purple-800',
      Traslados: 'bg-orange-100 text-orange-800',
      Compras: 'bg-pink-100 text-pink-800',
      Varios: 'bg-amber-200 text-amber-900',
    };
    return classes[type] || '';
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen relative">
      {/* Page Header */}
      <div className="relative z-10 p-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Calendario</h2>
              <p className="mt-2 text-lg text-gray-600">Vista semanal de todas las tareas</p>
            </div>
          </div>
        </div>
        {/* Calendar and Task List Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <button onClick={goToPrevWeek} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={goToThisWeek} className="px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700">
                    Hoy
                  </button>
                  <button onClick={goToNextWeek} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Semana: {weekRange}</h3>
              </div>
              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
                  {/* Header Row */}
                  <div className="bg-gray-50 p-3 text-center font-semibold text-sm">Hora</div>
                  {weekDays.map((d, idx) => {
                    // Mostrar día y fecha
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(weekStart.getDate() + idx);
                    return (
                      <div key={d.day} className="bg-gray-50 p-3 text-center font-semibold text-sm">
                        {d.label} <br />
                        <span className="text-xs font-normal text-gray-500">{format(dayDate, 'd/M')}</span>
                      </div>
                    );
                  })}
                  {/* Time slots */}
                  {hours.map(hour => (
                    <div key={hour} className="contents">
                      <div className="bg-gray-50 p-3 flex items-center justify-center text-xs text-gray-600">
                        {hour}:00
                      </div>
                      {weekDays.map((d, dayIndex) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(weekStart.getDate() + dayIndex);
                        const dayTasks = filteredTasks.filter(task => {
                          if (!task.dueAt) return false;
                          const taskDate = typeof task.dueAt === 'string' ? parseISO(task.dueAt) : new Date(task.dueAt);
                          return taskDate.getHours() === hour && taskDate.getDay() === d.day && isSameWeek(taskDate, weekStart, { weekStartsOn: 1 });
                        });
                        return (
                          <div key={dayIndex} className="bg-white min-h-16 p-1 relative">
                            {dayTasks.map(task => (
                              <div 
                                key={task.id}
                                className={`absolute left-1 right-1 top-1 p-1 rounded text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getEventClass(task.status)}`}
                                title={task.title}
                                onClick={() => openDetail(task)}
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Task List Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {user.role === 'sg' ? 'Mis tareas' : 'Todas las tareas'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">Esta semana</p>
              </div>
              {/* Task Filters */}
              <div className="px-6 py-3 border-b border-gray-200 space-y-3">
                <select 
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 p-2"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="finalizada">Finalizada</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Buscar tareas..." 
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 p-2"
                />
              </div>
              {/* Task List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredTasks.map(t => (
                  <div key={t.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(t.dueAt)} — Área: {t.author?.area}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(t.status)}`}>{t.status}</span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => openDetail(t)}
                            className="text-xs text-violet-600 hover:text-violet-900 font-medium px-2 py-1 bg-violet-50 rounded mb-1"
                          >
                            Ver
                          </button>
                          {user.role === 'sg' && (
                            <>
                              {t.status === 'Pendiente' && (
                                <>
                                  <button 
                                    onClick={() => handleStatus(t, 'En Progreso')}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1 bg-purple-50 rounded"
                                  >
                                    ▶ Iniciar
                                  </button>
                                  <button 
                                    onClick={() => handleStatus(t, 'Finalizada')}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 bg-green-50 rounded"
                                  >
                                    ✓ Finalizar
                                  </button>
                                </>
                              )}
                              {t.status === 'En Progreso' && (
                                <button 
                                  onClick={() => handleStatus(t, 'Finalizada')}
                                  className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 bg-green-50 rounded"
                                >
                                  ✓ Finalizar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL DETALLE DE TAREA */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeDetail}
            />
            {/* Truco para centrar verticalmente */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            {/* Panel modal */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalle de Tarea
                </h3>
                <button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <span className="font-semibold">Título:</span> {selectedTask.title}
                </div>
                <div>
                  <span className="font-semibold">Descripción:</span> {selectedTask.description || '-'}
                </div>
                <div>
                  <span className="font-semibold">Tipo:</span> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(selectedTask.type)}`}>{selectedTask.type}</span>
                </div>
                <div>
                  <span className="font-semibold">Prioridad:</span> {selectedTask.priority ? <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(selectedTask.priority)}`}>{selectedTask.priority}</span> : '-'}
                </div>
                <div>
                  <span className="font-semibold">Estado:</span> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(selectedTask.status)}`}>{selectedTask.status}</span>
                </div>
                <div>
                  <span className="font-semibold">Solicitante:</span> {selectedTask.author?.name || '-'} ({selectedTask.author?.area || '-'})
                </div>
                <div>
                  <span className="font-semibold">Ejecutor:</span> {selectedTask.executor?.name || 'Sin asignar'}
                </div>
                <div>
                  <span className="font-semibold">Fecha de creación:</span> {fmt(selectedTask.requestedAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha límite:</span> {fmt(selectedTask.dueAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha de asignación:</span> {fmt(selectedTask.assignedAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha de finalización:</span> {fmt(selectedTask.completedAt)}
                </div>
                <div>
                  <span className="font-semibold">Ubicación:</span> {selectedTask.location || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CONFIRMAR CAMBIO DE ESTADO */}
      {confirmModal.show && confirmModal.task && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeConfirmModal}
            />
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar acción
                </h3>
                <button
                  onClick={closeConfirmModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-gray-700 text-base">
                  ¿Estás seguro que deseas cambiar el estado de <span className="font-semibold">{confirmModal.task.title}</span> a <span className="font-semibold">{confirmModal.nextStatus}</span>?
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={closeConfirmModal}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmModal.action}
                    className="py-2 px-4 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
