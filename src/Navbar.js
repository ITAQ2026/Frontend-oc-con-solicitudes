import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Truck, 
  ShoppingCart, 
  PlusCircle, 
  CreditCard, 
  Users, 
  LogOut,
  Wrench,
  Receipt
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Normalizamos el rol y el email
  const userRole = (user?.rol || user?.role || '').toLowerCase();
  const userEmail = user?.email || '';
  
  // Definición de permisos
  const isAdmin = userRole === 'admin';
  // El usuario de logística es Moreno o cualquier Admin
  const isLogistics = userEmail === 'm.moreno@alphaquimica.com.ar' || isAdmin;

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logo}>🛡️ Alpha Química</Link>
        
        <div style={styles.links}>
          {/* 1. SECCIÓN COMÚN: Todos ven solicitudes */}
          <Link to="/solicitudes" style={styles.link}>
            <FileText size={16} /> Solicitudes
          </Link>

          {/* 2. SECCIÓN LOGÍSTICA: Moreno o Admin */}
          {isLogistics && (
            <>
              <div style={styles.divider} />
              <Link to="/vehiculos" style={styles.link}>
                <Truck size={16} /> Vehículos
              </Link>
              <Link to="/ordenes-trabajo" style={styles.link}>
                <Wrench size={16} /> O. Trabajo
              </Link>
            </>
          )}

          {/* 3. SECCIÓN ADMINISTRACIÓN: Solo Admin */}
          {isAdmin && (
            <>
              <div style={styles.divider} />
              <Link to="/proveedores" style={styles.link}>
                <Truck size={16} /> Proveedores
              </Link>
              <Link to="/compras" style={styles.link}>
                <ShoppingCart size={16} /> Compras
              </Link>
              <Link to="/recibos" style={styles.link}>
                <Receipt size={16} /> Recibos
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
          <span style={styles.userName}>{user?.nombre || 'Usuario'}</span>
          <span style={{...styles.roleTag, background: isAdmin ? '#0ea5e9' : '#64748b'}}>
            {userRole || 'sin rol'}
          </span>
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
  logo: { color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' },
  links: { display: 'flex', alignItems: 'center', gap: '15px' },
  link: { 
    color: '#cbd5e1', 
    textDecoration: 'none', 
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 8px',
    borderRadius: '4px',
    transition: 'background 0.2s'
  },
  divider: {
    width: '1px',
    height: '24px',
    background: '#334155',
    margin: '0 5px'
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
    fontSize: '9px', 
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px'
  }
};

export default Navbar;