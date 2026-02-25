import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, CreditCard, FileSpreadsheet, ClipboardList } from 'lucide-react';
// Importación del logo (ajustado a la ruta estándar de assets)
import logoAlpha from './assets/image_f87ff8.png'; 

const Dashboard = () => {
  const navigate = useNavigate();

  // Los 5 módulos del sistema
  const modules = [
    { 
      title: 'Solicitudes', 
      icon: <ClipboardList size={42} />, 
      path: '/solicitudes', 
      color: '#ef4444', 
      desc: 'Gestionar nuevas solicitudes de insumos' 
    },
    { 
      title: 'Proveedores', 
      icon: <Users size={42} />, 
      path: '/proveedores', 
      color: '#3b82f6', 
      desc: 'Gestionar base de datos de proveedores' 
    },
    { 
      title: 'Órdenes de Compra', 
      icon: <ShoppingCart size={42} />, 
      path: '/compras', 
      color: '#10b981', 
      desc: 'Generar pedidos y PDFs de compra' 
    },
    { 
      title: 'Órdenes de Pago', 
      icon: <CreditCard size={42} />, 
      path: '/pagos', 
      color: '#f59e0b', 
      desc: 'Registrar salidas de dinero y recibos' 
    },
    { 
      title: 'O. Especial', 
      icon: <FileSpreadsheet size={42} />, 
      path: '/orden-especial', 
      color: '#059669', 
      desc: 'Formato para grandes proveedores' 
    }
  ];

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoWrapper}>
            <img src={logoAlpha} alt="Alpha Química" style={styles.logoImg} />
          </div>
          <h1 style={styles.mainTitle}>Alpha Química</h1>
          <p style={styles.subtitle}>Panel de Control Administrativo</p>
        </header>
        
        <div style={styles.grid}>
          {modules.map((m, i) => (
            <div 
              key={i} 
              style={styles.card} 
              onClick={() => navigate(m.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ ...styles.iconWrapper, backgroundColor: m.color }}>
                {m.icon}
              </div>
              <h3 style={styles.cardTitle}>{m.title}</h3>
              <p style={styles.cardDesc}>{m.desc}</p>
              <div style={{ ...styles.link, color: m.color }}>
                Ingresar →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: { 
    backgroundColor: '#f1f5f9', // Gris claro de fondo (Slate 100)
    minHeight: '100vh',
    padding: '60px 0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: { 
    maxWidth: '1250px', 
    margin: '0 auto', 
    padding: '0 30px' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '60px' 
  },
  logoWrapper: { 
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '20px' 
  },
  logoImg: { 
    height: '90px', 
    width: 'auto',
    filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'
  },
  mainTitle: { 
    fontSize: '32px', 
    color: '#3b82f6', // Azul claro moderno
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '8px'
  },
  subtitle: { 
    color: '#64748b', 
    fontSize: '18px',
    fontWeight: '400'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
    gap: '30px' 
  },
  card: { 
    background: '#ffffff', 
    padding: '40px 25px', 
    borderRadius: '28px', 
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
    cursor: 'pointer', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    border: '1px solid #e2e8f0'
  },
  iconWrapper: { 
    padding: '22px', 
    borderRadius: '22px', 
    color: '#ffffff', 
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: { 
    fontSize: '20px', 
    fontWeight: '700', 
    marginBottom: '14px', 
    color: '#0f172a' 
  },
  cardDesc: { 
    color: '#475569', 
    fontSize: '15px', 
    marginBottom: '25px', 
    lineHeight: '1.5',
    minHeight: '45px'
  },
  link: { 
    fontWeight: '700', 
    fontSize: '15px',
    marginTop: 'auto'
  }
};

export default Dashboard;