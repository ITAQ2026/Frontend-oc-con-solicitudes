import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Truck, 
  ShoppingCart, 
  LogOut,
  Wrench,
  Receipt,
  CreditCard,
  Users,
  Shield
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const userRole = (user?.rol || user?.role || '').toLowerCase().trim();
  const userEmail = (user?.email || '').toLowerCase().trim();
  
  const isAdmin = userRole === 'admin';
  const isMoreno = userEmail === 'm.moreno@alphaquimicasrl.com.ar' || 
                   userEmail === 'm.moreno@alphaquica.com.ar';

  const isLogistics = isMoreno || isAdmin;

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logo}>
          <Shield size={20} color="#0ea5e9" />
          <span style={styles.logoText}>Alpha Química</span>
        </Link>
        
        <div style={styles.links}>
          {/* SECCIÓN COMÚN */}
          <Link to="/solicitudes" style={styles.link}>
            <FileText size={16} /> <span style={styles.linkText}>Solicitudes</span>
          </Link>

          {/* SECCIÓN LOGÍSTICA */}
          {isLogistics && (
            <>
              <div style={styles.divider} />
              <Link to="/vehiculos" style={styles.link}>
                <Truck size={16} /> <span style={styles.linkText}>Vehículos</span>
              </Link>
              <Link to="/ordenes-trabajo" style={styles.link}>
                <Wrench size={16} /> <span style={styles.linkText}>O. Trabajo</span>
              </Link>
            </>
          )}

          {/* SECCIÓN ADMINISTRACIÓN */}
          {isAdmin && (
            <>
              <div style={styles.divider} />
              <Link to="/proveedores" style={styles.link}>
                <Truck size={16} /> <span style={styles.linkText}>Proveedores</span>
              </Link>
              <Link to="/compras" style={styles.link}>
                <ShoppingCart size={16} /> <span style={styles.linkText}>Compras</span>
              </Link>
              <Link to="/recibos" style={styles.link}>
                <Receipt size={16} /> <span style={styles.linkText}>Recibos</span>
              </Link>
              <Link to="/pagos" style={styles.link}>
                <CreditCard size={16} /> <span style={styles.linkText}>Pagos</span>
              </Link>
              <Link to="/usuarios" style={styles.link}>
                <Users size={16} /> <span style={styles.linkText}>Usuarios</span>
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
          <LogOut size={16} /> <span style={styles.logoutText}>Salir</span>
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '10px 15px', 
    background: '#1e293b', 
    alignItems: 'center',
    minHeight: '60px', // Cambiado de height fija a minHeight
    flexWrap: 'wrap', // ✅ Permite que los elementos bajen en celular
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    gap: '10px'
  },
  leftSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px',
    flexWrap: 'wrap' // ✅ Clave para móvil
  },
  logo: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white', 
    textDecoration: 'none', 
    fontWeight: 'bold', 
    fontSize: '18px' 
  },
  logoText: {
    whiteSpace: 'nowrap'
  },
  links: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    flexWrap: 'wrap' // ✅ Los enlaces bajan si no hay espacio
  },
  link: { 
    color: '#cbd5e1', 
    textDecoration: 'none', 
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center', 
    gap: '6px',
    padding: '8px 10px', // Más relleno para dedos en móvil
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.05)', // Un fondo leve para ver dónde tocar
    whiteSpace: 'nowrap'
  },
  linkText: {
    // Opcional: podrías ocultar el texto en pantallas muy pequeñas usando media queries
  },
  divider: { 
    width: '1px', 
    height: '24px', 
    background: '#334155', 
    margin: '0 2px',
    // En móvil el divisor vertical a veces estorba, pero aquí ayuda a separar grupos
  },
  userSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    borderLeft: '1px solid #334155', 
    paddingLeft: '15px',
    marginLeft: 'auto' // Empuja la info del usuario a la derecha
  },
  userInfo: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-end',
    // En pantallas muy chicas se puede ocultar
  },
  userName: { fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
  roleTag: { fontSize: '9px', color: 'white', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', marginTop: '2px' },
  logoutBtn: { 
    background: '#ef4444', 
    color: 'white', 
    border: 'none', 
    padding: '8px 12px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '13px',
    fontWeight: 'bold'
  },
  logoutText: {
    display: 'inline' // Se puede cambiar a 'none' en móvil muy pequeño
  }
};

export default Navbar;