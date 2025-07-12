import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute     from './auth/ProtectedRoute';
import ProtectedLayout    from './layout/ProtectedLayout';

import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import TasksSolicitante from './pages/TasksSolicitante';
import NewTask          from './pages/NewTask';
import TasksAdmin       from './pages/TasksAdmin';
import CalendarSG       from './pages/CalendarSG';
import AssignTasks      from './pages/AssignTasks';
import UsersAdmin       from './pages/UsersAdmin';
import ReportsAdmin     from './pages/ReportsAdmin';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
        <Route path="/login" element={<Login />} />

        {/* --- Rutas protegidas --- */}
        <Route element={<ProtectedRoute />}>
          {/* Layout con barra Inicio/Cerrar sesión */}
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />

            {/* Solicitante + Admin */}
            <Route element={<ProtectedRoute roles={['solicitante', 'admin']} />}>
              <Route path="tasks"      element={<TasksSolicitante />} />
              <Route path="tasks/new" element={<NewTask />} />
            </Route>

            {/* Calendario compartido SG + Admin */}
            <Route element={<ProtectedRoute roles={['sg', 'admin']} />}>
              <Route path="calendar" element={<CalendarSG />} />
            </Route>

            {/* Admin exclusivo */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="tasks-admin" element={<TasksAdmin />} />
              <Route path="assign"      element={<AssignTasks />} />
              <Route path="users"       element={<UsersAdmin />} />
              <Route path="reports"     element={<ReportsAdmin />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
