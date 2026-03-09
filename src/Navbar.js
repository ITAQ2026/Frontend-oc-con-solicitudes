import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Truck, ShoppingCart, LogOut, Wrench, 
  Receipt, CreditCard, Users, Shield, Menu, X 
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Umbral para tablets/celulares

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = (user?.rol || user?.role || '').toLowerCase().trim();
  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = userRole === 'admin';
  const isLogistics = isAdmin || userEmail.includes('m.moreno');

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.topBar}>
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          <Shield size={24} color="#0ea5e9" />
          <span style={styles.logoText}>Alpha Química</span>
        </Link>

        {isMobile && (
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={styles.menuBtn}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </div>

      {/* Menú Desplegable con Animación */}
      <div style={{
        ...styles.linksContainer,
        ...(isMobile ? (isMenuOpen ? styles.menuOpen : styles.menuClosed) : styles.desktopMenu)
      }}>
        
        <div style={isMobile ? styles.mobileStack : styles.desktopStack}>
          <Link to="/solicitudes" style={styles.link} onClick={closeMenu}>
            <FileText size={18} /> Solicitudes
          </Link>

          {isLogistics && (
            <>
              {!isMobile && <div style={styles.divider} />}
              <Link to="/vehiculos" style={styles.link} onClick={closeMenu}>
                <Truck size={18} /> Vehículos
              </Link>
              <Link to="/ordenes-trabajo" style={styles.link} onClick={closeMenu}>
                <Wrench size={18} /> O. Trabajo
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              {!isMobile && <div style={styles.divider} />}
              <Link to="/proveedores" style={styles.link} onClick={closeMenu}>
                <Truck size={18} /> Proveedores
              </Link>
              <Link to="/compras" style={styles.link} onClick={closeMenu}>
                <ShoppingCart size={18} /> Compras
              </Link>
              <Link to="/recibos" style={styles.link} onClick={closeMenu}>
                <Receipt size={18} /> Recibos
              </Link>
              <Link to="/pagos" style={styles.link} onClick={closeMenu}>
                <CreditCard size={18} /> Pagos
              </Link>
              <Link to="/usuarios" style={styles.link} onClick={closeMenu}>
                <Users size={18} /> Usuarios
              </Link>
            </>
          )}
        </div>

        <div style={{...styles.userSection, borderTop: isMobile ? '1px solid #334155' : 'none', paddingTop: isMobile ? '15px' : '0'}}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.nombre || 'Usuario'}</span>
            <span style={{...styles.roleTag, background: isAdmin ? '#0ea5e9' : '#64748b'}}>
              {userRole}
            </span>
          </div>
          <button onClick={handleLogoutClick} style={styles.logoutBtn}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { 
    background: '#1e293b', 
    color: 'white', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '65px',
    padding: '0 20px',
    position: 'relative',
    zIndex: 1001,
    background: '#1e293b',
  },
  logo: { 
    display: 'flex', alignItems: 'center', gap: '10px', 
    color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' 
  },
  menuBtn: {
    background: '#334155', border: 'none', color: 'white', cursor: 'pointer', 
    padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center'
  },
  linksContainer: {
    display: 'flex',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Animación fluida
    overflow: 'hidden',
  },
  // Estados de animación para móvil
  menuClosed: {
    maxHeight: '0px',
    opacity: 0,
    flexDirection: 'column',
    padding: '0 20px',
    pointerEvents: 'none',
  },
  menuOpen: {
    maxHeight: '600px', // Suficiente para todos los links
    opacity: 1,
    flexDirection: 'column',
    padding: '10px 20px 30px 20px',
    backgroundColor: '#1e293b',
  },
  // Estado para desktop
  desktopMenu: {
    maxHeight: 'none',
    opacity: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0 20px 0 0',
    position: 'absolute',
    right: 0,
    top: 0,
    height: '65px',
    pointerEvents: 'auto',
  },
  desktopStack: { display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '220px' },
  mobileStack: { display: 'flex', flexDirection: 'column', gap: '5px' },
  link: { 
    color: '#cbd5e1', textDecoration: 'none', fontSize: '14px',
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 15px', borderRadius: '8px',
    transition: 'all 0.2s',
  },
  divider: { width: '1px', height: '24px', background: '#334155', margin: '0 8px' },
  userSection: { 
    display: 'flex', alignItems: 'center', gap: '15px'
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' },
  roleTag: { fontSize: '10px', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' },
  logoutBtn: { 
    background: '#ef4444', color: 'white', border: 'none', 
    padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)'
  }
};

export default Navbar;