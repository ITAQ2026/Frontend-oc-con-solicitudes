import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Proveedores from './Proveedores';
import OrdenesCompra from './OrdenesCompra';
import OrdenesPago from './OrdenesPago';
import OrdenEspecial from './OrdenEspecial';
import SolicitudCompra from './SolicitudCompra';
import Login from './Login';
import UsuariosGestion from './UsuariosGestion'; // <--- IMPORTANTE: Asegúrate de que el archivo se llame así

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div style={styles.app}>
        <Navbar user={user} onLogout={handleLogout} />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/solicitudes" element={<SolicitudCompra user={user} />} />

            {/* RUTAS PROTEGIDAS: Solo si es Admin */}
            {user.rol === 'admin' ? (
              <>
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/compras" element={<OrdenesCompra />} />
                <Route path="/pagos" element={<OrdenesPago />} />
                <Route path="/orden-especial" element={<OrdenEspecial />} />
                <Route path="/usuarios" element={<UsuariosGestion />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/solicitudes" />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const styles = {
  app: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  main: { padding: '20px' }
};

export default App;