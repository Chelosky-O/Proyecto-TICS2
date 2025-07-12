// frontend/src/pages/Dashboard.jsx
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations immediately after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Configuración de navegación por rol
  const navigationConfig = {
    solicitante: [
      {
        to: '/tasks',
        label: 'Mis Tareas',
        description: 'Visualiza y gestiona todas tus tareas activas e históricas.',
        icon: 'clipboard',
        color: 'primary',
        action: 'Ver tareas'
      },
      {
        to: '/tasks/new',
        label: 'Crear Tarea',
        description: 'Rellena el formulario con alguna tarea',
        icon: 'plus',
        color: 'green',
        action: 'Crear tarea'
      },
    ],
    sg: [
      {
        to: '/calendar',
        label: 'Mi Calendario',
        description: 'Visualiza y gestiona tu calendario de tareas asignadas.',
        icon: 'calendar',
        color: 'primary',
        action: 'Ver calendario'
      },
    ],
    admin: [
      {
        to: '/tasks-admin',
        label: 'Todas las Tareas',
        description: 'Visualiza y gestiona todas las tareas del sistema.',
        icon: 'clipboard',
        color: 'primary',
        action: 'Ver tareas'
      },
      {
        to: '/tasks/new',
        label: 'Crear Tarea',
        description: 'Rellena el formulario con alguna tarea.',
        icon: 'plus',
        color: 'green',
        action: 'Crear tarea'
      },
      {
        to: '/calendar',
        label: 'Calendario',
        description: 'Visualiza el calendario de tareas.',
        icon: 'calendar',
        color: 'blue',
        action: 'Ver calendario'
      },
      {
        to: '/assign',
        label: 'Asignar Tareas',
        description: 'Asigna tareas a los diferentes usuarios del sistema.',
        icon: 'users',
        color: 'yellow',
        action: 'Asignar'
      },
      {
        to: '/users',
        label: 'Usuarios',
        description: 'Gestiona los usuarios en el sistema.',
        icon: 'user-group',
        color: 'indigo',
        action: 'Gestionar'
      },
      {
        to: '/reports',
        label: 'Reportes',
        description: 'Genera reportes y estadísticas del sistema.',
        icon: 'chart-bar',
        color: 'red',
        action: 'Ver reportes'
      }
    ]
  };

  // Mapeo de roles a nombres display
  const roleDisplayNames = {
    solicitante: 'Solicitante',
    sg: 'Servicios Generales',
    admin: 'Administrador'
  };

  // Función para obtener el ícono SVG
  const getIcon = (iconName, colorClass) => {
    const icons = {
      clipboard: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      plus: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      chart: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      calendar: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      refresh: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      users: (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'user-group': (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'chart-bar': (
        <svg className={`h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };
    return icons[iconName] || icons.clipboard;
  };

  // Colores para las tarjetas
  const colorMap = {
    primary: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Sección de bienvenida */}
        <div className={`mb-8 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Hola, <span className="text-purple-600">{user.name.split(' ')[0]}</span>!
          </h2>
          <p className="text-lg text-gray-600">
            ¿Qué deseas hacer?
          </p>
        </div>

        {/* Sección de navegación */}
        <div className="mb-10">
          <h3 className={`text-xl font-semibold mb-6 text-gray-900 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Opciones disponibles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationConfig[user.role].map((item, index) => {
              const colors = colorMap[item.color];
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                      {getIcon(item.icon, colors.text)}
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>{item.label}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}