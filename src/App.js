import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Proveedores from './Proveedores';
import OrdenesCompra from './OrdenesCompra';
import OrdenesPago from './OrdenesPago';
import OrdenEspecial from './OrdenEspecial';
import SolicitudCompra from './SolicitudCompra';
import Login from './Login';
import UsuariosGestion from './UsuariosGestion';

function App() {
  // Inicializamos el estado recuperando el usuario del localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Limpiamos también el token por seguridad
  };

  // Si no hay usuario, mostramos únicamente la pantalla de Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Definimos de forma segura si el usuario es administrador
  const userRole = (user?.rol || user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';

  return (
    <Router>
      <div style={styles.app}>
        {/* Pasamos el usuario a la Navbar para que filtre los botones del menú */}
        <Navbar user={user} onLogout={handleLogout} />
        
        <main style={styles.main}>
          <Routes>
            {/* --- RUTAS ACCESIBLES PARA TODOS LOS LOGUEADOS --- */}
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/solicitudes" element={<SolicitudCompra user={user} />} />

            {/* --- RUTAS PROTEGIDAS (SOLO ADMIN) --- */}
            {isAdmin ? (
              <>
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/compras" element={<OrdenesCompra />} />
                <Route path="/pagos" element={<OrdenesPago />} />
                <Route path="/orden-especial" element={<OrdenEspecial />} />
                <Route path="/usuarios" element={<UsuariosGestion />} />
              </>
            ) : (
              /* Si un usuario común intenta entrar a una ruta de admin, 
                 lo redirigimos automáticamente a sus solicitudes */
              <Route path="*" element={<Navigate to="/solicitudes" replace />} />
            )}

            {/* Redirección por defecto para cualquier ruta no encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const styles = {
  app: { 
    backgroundColor: '#f8fafc', 
    minHeight: '100vh', 
    fontFamily: "'Inter', sans-serif" 
  },
  main: { 
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  }
};

export default App;