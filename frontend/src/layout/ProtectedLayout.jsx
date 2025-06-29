import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header con gradiente */}
      <Header />

      {/* Contenido */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* Footer con gradiente */}
      <Footer />
    </div>
  );
}