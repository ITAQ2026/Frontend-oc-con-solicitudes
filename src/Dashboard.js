import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, CreditCard, FileSpreadsheet, ClipboardList } from 'lucide-react';
// Asegúrate de tener el logo en esta carpeta
import logoAlpha from './assets/image_f87ff8.png'; 

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    { 
      title: 'Solicitudes', 
      icon: <ClipboardList size={40} />, 
      path: '/solicitudes', 
      color: '#ef4444', // Rojo Alpha Química
      desc: 'Gestionar nuevas solicitudes de insumos' 
    },
    { 
      title: 'Proveedores', 
      icon: <Users size={40} />, 
      path: '/proveedores', 
      color: '#3b82f6', 
      desc: 'Gestionar base de datos de proveedores' 
    },
    { 
      title: 'Órdenes de Compra', 
      icon: <ShoppingCart size={40} />, 
      path: '/compras', 
      color: '#10b981', 
      desc: 'Generar pedidos y PDFs de compra' 
    },
    { 
      title: 'Órdenes de Pago', 
      icon: <CreditCard size={40} />, 
      path: '/pagos', 
      color: '#f59e0b', 
      desc: 'Registrar salidas de dinero y recibos' 
    },
    { 
      title: 'O. Especial', 
      icon: <FileSpreadsheet size={40} />, 
      path: '/orden-especial', 
      color: '#059669', 
      desc: 'Formato para grandes proveedores' 
    }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoWrapper}>
          <img src={logoAlpha} alt="Alpha Química" style={styles.logoImg} />
        </div>
        <p style={styles.subtitle}>Seleccione un módulo para comenzar</p>
      </header>
      
      <div style={styles.grid}>
        {modules.map((m, i) => (
          <div key={i} style={styles.card} onClick={() => navigate(m.path)}>
            <div style={{ ...styles.iconWrapper, backgroundColor: m.color }}>
              {m.icon}
            </div>
            <h3 style={styles.cardTitle}>{m.title}</h3>
            <p style={styles.cardDesc}>{m.desc}</p>
            <span style={{ ...styles.link, color: m.color }}>Ingresar →</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
  header: { textAlign: 'center', marginBottom: '50px' },
  logoWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '10px' },
  logoImg: { height: '60px', width: 'auto' }, // Ajusta según el tamaño de tu imagen
  subtitle: { color: '#64748b', fontSize: '16px' },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '25px' 
  },
  card: { 
    background: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #f1f5f9'
  },
  iconWrapper: { padding: '18px', borderRadius: '18px', color: 'white', marginBottom: '20px' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' },
  cardDesc: { color: '#64748b', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' },
  link: { fontWeight: '600', fontSize: '14px' }
};

export default Dashboard;