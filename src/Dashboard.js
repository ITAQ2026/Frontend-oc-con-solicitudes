import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, CreditCard, ClipboardList } from 'lucide-react';
import logoAlpha from './assets/image_f87ff8.png'; 

const Dashboard = () => {
  const navigate = useNavigate();

  // 1. Obtenemos el usuario y su rol
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { rol: 'user' };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.backgroundColor = '#f1f5f9';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  // 2. Definimos los módulos optimizados (O. Especial eliminado)
  const allModules = [
    { 
      title: 'Solicitudes de Compra', 
      icon: <ClipboardList size={40} />, 
      path: '/solicitudes', 
      color: '#ef4444', 
      desc: 'Gestionar solicitudes de insumos', 
      adminOnly: false 
    },
    { 
      title: 'Proveedores', 
      icon: <Users size={40} />, 
      path: '/proveedores', 
      color: '#3b82f6', 
      desc: 'Gestionar base de datos de proveedores', 
      adminOnly: true 
    },
    { 
      title: 'Órdenes de Compra', 
      icon: <ShoppingCart size={40} />, 
      path: '/compras', 
      color: '#10b981', 
      desc: 'Generar pedidos y PDFs', 
      adminOnly: true 
    },
    { 
      title: 'Órdenes de Pago', 
      icon: <CreditCard size={40} />, 
      path: '/pagos', 
      color: '#f59e0b', 
      desc: 'Registrar salidas de dinero y recibos', 
      adminOnly: true 
    }
  ];

  // 3. Filtramos: Si es admin ve todo, si no, solo lo que no es adminOnly
  const modules = allModules.filter(m => user.rol === 'admin' || !m.adminOnly);

  return (
    <div style={styles.pageBackground} key="dashboard-v3">
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoWrapper}>
            <img src={logoAlpha} alt="Alpha Química" style={styles.logoImg} />
          </div>
          <h1 style={styles.mainTitle}>Alpha Química SRL</h1>
          <p style={styles.subtitle}>
            {user.rol === 'admin' ? 'Panel de Control Administrativo' : 'Panel de Solicitudes de Usuario'}
          </p>
        </header>
        
        <div style={styles.grid}>
          {modules.map((m, i) => (
            <div 
              key={i} 
              style={styles.card} 
              onClick={() => navigate(m.path)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ ...styles.iconWrapper, backgroundColor: m.color }}>
                {m.icon}
              </div>
              <h3 style={styles.cardTitle}>{m.title}</h3>
              <p style={styles.cardDesc}>{m.desc}</p>
              <div style={{ ...styles.link, color: m.color }}>Ingresar →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 0' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  header: { textAlign: 'center', marginBottom: '50px' },
  logoWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  logoImg: { height: '100px', width: 'auto', display: 'block' },
  mainTitle: { fontSize: '32px', color: '#0f172a', fontWeight: 'bold', marginTop: '10px' },
  subtitle: { color: '#64748b', fontSize: '18px' },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '30px',
    justifyContent: 'center'
  },
  card: { 
    background: 'white', 
    padding: '35px', 
    borderRadius: '24px', 
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease',
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    border: '1px solid #e2e8f0'
  },
  iconWrapper: { padding: '20px', borderRadius: '20px', color: 'white', marginBottom: '20px' },
  cardTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' },
  cardDesc: { color: '#64748b', fontSize: '14px', marginBottom: '20px', height: '40px', lineHeight: '1.4' },
  link: { fontWeight: 'bold', fontSize: '15px' }
};

export default Dashboard;