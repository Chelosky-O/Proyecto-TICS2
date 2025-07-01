// frontend/src/pages/NewTask.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/tasks';
import { useAuth } from '../auth/AuthContext';

export default function NewTask() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    serviceType: '',
    priority: '',
    startDatetime: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set minimum datetime to now
  useEffect(() => {
    const now = new Date();
    const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    document.getElementById('start-datetime')?.setAttribute('min', minDateTime);
  }, []);

  // Validation functions
  const validations = {
    title: (value) => value.trim().length >= 5,
    serviceType: (value) => ['retiro', 'traslados', 'compras', 'varios'].includes(value),
    priority: (value) => ['alta', 'media', 'baja'].includes(value),
    datetime: (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      const now = new Date();
      return selectedDate > now;
    }
  };

  const validateField = (fieldName, value) => {
    const errorMessages = {
      title: 'El título debe tener al menos 5 caracteres',
      serviceType: 'Debes seleccionar un tipo de servicio',
      priority: 'Debes seleccionar una prioridad',
      startDatetime: 'La fecha debe ser posterior al momento actual'
    };

    let isValid = true;
    switch (fieldName) {
      case 'title':
        isValid = validations.title(value);
        break;
      case 'serviceType':
        isValid = validations.serviceType(value);
        break;
      case 'priority':
        isValid = validations.priority(value);
        break;
      case 'startDatetime':
        isValid = validations.datetime(value);
        break;
      default:
        break;
    }

    if (!isValid) {
      setErrors(prev => ({ ...prev, [fieldName]: errorMessages[fieldName] }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const titleValid = validateField('title', form.title);
    const serviceTypeValid = validateField('serviceType', form.serviceType);
    const priorityValid = validateField('priority', form.priority);
    const datetimeValid = validateField('startDatetime', form.startDatetime);

    if (titleValid && serviceTypeValid && priorityValid && datetimeValid) {
      setIsSubmitting(true);

      try {
        // Map service type values to match the original format
        const typeMap = {
          'retiro': 'Retiro',
          'traslados': 'Traslados',
          'compras': 'Compras',
          'varios': 'Varios'
        };

        // Map priority values to match the original format
        const priorityMap = {
          'alta': 'Alta',
          'media': 'Media',
          'baja': 'Baja'
        };

        await createTask({
          title: form.title,
          description: form.description,
          location: form.location,
          type: typeMap[form.serviceType] || form.serviceType,
          priority: priorityMap[form.priority] || form.priority,
          dueAt: new Date(form.startDatetime)
        });
        
        // Redirect to tasks list on success based on user role
        if (user?.role === 'admin') {
          nav('/tasks-admin'); // Redirect to TaskAdmin if admin
        } else {
          nav('/tasks'); // Redirect to TaskList for other users
        }
      } catch (error) {
        console.error('Error al guardar:', error);
        setErrors({ submit: 'Error al guardar. Revisa los campos.' });
        setIsSubmitting(false);
      }
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h2>
          <p className="mt-2 text-lg text-gray-600">Crea una nueva solicitud de servicio</p>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Información de la Solicitud</h3>
          <p className="mt-1 text-sm text-gray-500">Completa todos los campos para crear tu solicitud</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la solicitud
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={form.title}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="Ej: Traslado de equipos de laboratorio"
              />
              {errors.title && (
                <div className="mt-1 text-sm text-red-600">{errors.title}</div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={form.description}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm resize-none"
                placeholder="Describe los detalles específicos de tu solicitud, materiales necesarios, instrucciones especiales, etc."
              />
              <div className="mt-1 text-xs text-gray-500">Proporciona todos los detalles relevantes para facilitar el servicio</div>
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={form.location}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Ej: Laboratorio Principal - Piso 2, Oficina 205"
              />
              <div className="mt-1 text-xs text-gray-500">Especifica el lugar exacto donde se realizará el servicio</div>
            </div>

            {/* Service Type and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Type */}
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de servicio
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  name="serviceType"
                  id="serviceType"
                  required
                  value={form.serviceType}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 border ${errors.serviceType ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                >
                  <option value="" disabled>Seleccionar tipo de servicio</option>
                  <option value="retiro">Retiro</option>
                  <option value="traslados">Traslados</option>
                  <option value="compras">Compras</option>
                  <option value="varios">Varios</option>
                </select>
                {errors.serviceType && (
                  <div className="mt-1 text-sm text-red-600">{errors.serviceType}</div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  name="priority"
                  id="priority"
                  required
                  value={form.priority}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                >
                  <option value="" disabled>Seleccionar prioridad</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                {errors.priority && (
                  <div className="mt-1 text-sm text-red-600">{errors.priority}</div>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="start-datetime" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora de inicio
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="datetime-local"
                name="startDatetime"
                id="start-datetime"
                required
                value={form.startDatetime}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 border ${errors.startDatetime ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.startDatetime && (
                <div className="mt-1 text-sm text-red-600">{errors.startDatetime}</div>
              )}
              <div className="mt-1 text-xs text-gray-500">Selecciona cuándo necesitas que se realice el servicio</div>
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}