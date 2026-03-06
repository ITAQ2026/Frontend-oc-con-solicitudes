import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes Base
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Login from './Login';
import UsuariosGestion from './UsuariosGestion';

// Componentes de Compras / Administración
import Proveedores from './Proveedores';
import OrdenesCompra from './OrdenesCompra';
import OrdenesPago from './OrdenesPago';
import OrdenEspecial from './OrdenEspecial';
import SolicitudCompra from './SolicitudCompra';
import Recibos from './Recibos';

// Componentes de Logística
import Vehiculos from './Vehiculos';
import OrdenesTrabajo from './OrdenesTrabajo';

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
    localStorage.removeItem('token');
  };

  // Si no hay usuario, mostramos únicamente la pantalla de Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // --- LÓGICA DE PERMISOS CORREGIDA ---
  const userRole = (user?.rol || user?.role || '').toLowerCase().trim();
  const userEmail = (user?.email || '').toLowerCase().trim();
  
  const isAdmin = userRole === 'admin';

  // Validamos Moreno con ambos dominios por seguridad (SRL y normal)
  const isMoreno = userEmail === 'm.moreno@alphaquimicasrl.com.ar' || 
                   userEmail === 'm.moreno@alphaquimica.com.ar';

  const isLogistics = isMoreno || isAdmin;

  return (
    <Router>
      <div style={styles.app}>
        {/* El Navbar usa la misma lógica interna para mostrar los botones */}
        <Navbar user={user} onLogout={handleLogout} />
        
        <main style={styles.main}>
          <Routes>
            {/* --- RUTAS ACCESIBLES PARA TODOS --- */}
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/solicitudes" element={<SolicitudCompra user={user} />} />

            {/* --- RUTAS DE LOGÍSTICA: Moreno o Admin --- */}
            {isLogistics && (
              <>
                <Route path="/vehiculos" element={<Vehiculos />} />
                <Route path="/ordenes-trabajo" element={<OrdenesTrabajo />} />
              </>
            )}

            {/* --- RUTAS DE ADMINISTRACIÓN: Solo Admin --- */}
            {isAdmin && (
              <>
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/compras" element={<OrdenesCompra />} />
                <Route path="/pagos" element={<OrdenesPago />} />
                <Route path="/orden-especial" element={<OrdenEspecial />} />
                <Route path="/recibos" element={<Recibos />} />
                <Route path="/usuarios" element={<UsuariosGestion />} />
              </>
            )}

            {/* Redirección de seguridad */}
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