import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const notificationIds = useRef(new Set());

  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    
    // Evitar duplicados
    if (notificationIds.current.has(id)) {
      return id;
    }
    
    const newNotification = { id, message, type, duration };
    notificationIds.current.add(id);
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    notificationIds.current.delete(id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => showNotification(message, 'success', duration), [showNotification]);
  const showError = useCallback((message, duration) => showNotification(message, 'error', duration), [showNotification]);
  const showWarning = useCallback((message, duration) => showNotification(message, 'warning', duration), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showWarning }}>
      {children}
      {/* Renderizar todas las notificaciones con posicionamiento dinámico */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ transform: `translateY(${index * 80}px)` }}
            className="transition-transform duration-300 pointer-events-auto"
          >
            <Notification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
}; 