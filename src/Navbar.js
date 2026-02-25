import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Truck, 
  ShoppingCart, 
  PlusCircle, 
  CreditCard, 
  Users, 
  LogOut 
} from 'lucide-react'; // Asegúrate de tener instalada lucide-react

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logo}>🛡️ Alpha Química</Link>
        
        <div style={styles.links}>
          {/* Link para TODOS los logueados */}
          <Link to="/solicitudes" style={styles.link}>
            <FileText size={16} /> Solicitudes
          </Link>

          {/* Links SOLO para Administradores */}
          {user?.rol === 'admin' && (
            <>
              <Link to="/proveedores" style={styles.link}>
                <Truck size={16} /> Proveedores
              </Link>
              <Link to="/compras" style={styles.link}>
                <ShoppingCart size={16} /> Compras
              </Link>
              <Link to="/orden-especial" style={styles.link}>
                <PlusCircle size={16} /> O. Especial
              </Link>
              <Link to="/pagos" style={styles.link}>
                <CreditCard size={16} /> Pagos
              </Link>
              <Link to="/usuarios" style={styles.link}>
                <Users size={16} /> Usuarios
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.nombre}</span>
          <span style={styles.roleTag}>{user?.rol}</span>
        </div>
        <button onClick={handleLogoutClick} style={styles.logoutBtn}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '0 30px', 
    background: '#1e293b', 
    alignItems: 'center',
    height: '60px',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  leftSection: { display: 'flex', alignItems: 'center', gap: '30px' },
  logo: { 
    color: 'white', 
    textDecoration: 'none', 
    fontWeight: 'bold', 
    fontSize: '18px',
    whiteSpace: 'nowrap'
  },
  links: { display: 'flex', alignItems: 'center', gap: '15px' },
  link: { 
    color: '#cbd5e1', 
    textDecoration: 'none', 
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s'
  },
  userSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px',
    borderLeft: '1px solid #334155',
    paddingLeft: '20px'
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '13px', fontWeight: '500' },
  roleTag: { 
    fontSize: '10px', 
    background: '#0ea5e9', 
    color: 'white', 
    padding: '1px 6px', 
    borderRadius: '4px',
    textTransform: 'uppercase',
    marginTop: '2px'
  },
  logoutBtn: { 
    background: '#ef4444', 
    color: 'white', 
    border: 'none', 
    padding: '6px 12px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold'
  }
};

export default Navbar;