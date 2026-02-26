const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // 1. Normalizamos el rol para evitar errores de mayúsculas/minúsculas
  // 2. Verificamos tanto 'rol' como 'role' por si acaso cambió en el backend
  const userRole = (user?.rol || user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logo}>🛡️ Alpha Química</Link>
        
        <div style={styles.links}>
          {/* Accesible para TODOS */}
          <Link to="/solicitudes" style={styles.link}>
            <FileText size={16} /> Solicitudes
          </Link>

          {/* SOLO para Administradores */}
          {isAdmin && (
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

export default Navbar;