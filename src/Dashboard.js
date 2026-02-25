import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, CreditCard, FileSpreadsheet, ClipboardList } from 'lucide-react';
// Importamos la imagen (asegúrate de que la ruta sea correcta)
import logoAlpha from './assets/image_f87ff8.png'; 

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    { title: 'Proveedores', icon: <Users size={40} />, path: '/proveedores', color: '#3b82f6', desc: 'Gestionar base de datos de proveedores' },
    { title: 'Solicitudes de Compra', icon: <ClipboardList size={40} />, path: '/solicitudes', color: '#e11d48', desc: 'Crear y autorizar nuevas requisiciones' },
    { title: 'Órdenes de Compra', icon: <ShoppingCart size={40} />, path: '/compras', color: '#10b981', desc: 'Generar pedidos y PDFs de compra' },
    { title: 'Órdenes de Pago', icon: <CreditCard size={40} />, path: '/pagos', color: '#f59e0b', desc: 'Registrar salidas de dinero y recibos' },
    { title: 'Orden de Compra Proveedores', icon: <FileSpreadsheet size={40} />, path: '/orden-especial', color: '#27ae60', desc: 'Formato de compra para grandes proveedores' }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        {/* Contenedor del Logo y Título */}
        <div style={styles.logoContainer}>
          <img src={logoAlpha} alt="Logo Alpha Química" style={styles.logo} />
          <h1 style={styles.title}>Alpha Química</h1>
        </div>
        <p style={styles.subtitle}>Sistema de Gestión Interna</p>
      </header>
      
      <div style={styles.grid}>
        {modules.map((m, i) => (
          <div 
            key={i} 
            style={styles.card} 
            onClick={() => navigate(m.path)}
          >
            <div style={{ ...styles.iconWrapper, backgroundColor: m.color }}>
              {m.icon}
            </div>
            <h3 style={styles.cardTitle}>{m.title}</h3>
            <p style={styles.cardDesc}>{m.desc}</p>
            <button style={{ ...styles.btn, color: m.color }}>Ingresar →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' },
  header: { textAlign: 'center', marginBottom: '50px' },
  logoContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '15px', 
    marginBottom: '10px' 
  },
  logo: { width: '50px', height: 'auto', borderRadius: '8px' }, // Ajusta el tamaño según necesites
  title: { fontSize: '32px', color: '#1e293b', fontWeight: 'bold', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '18px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },
  card: { 
    background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s ease',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  iconWrapper: { padding: '20px', borderRadius: '15px', color: 'white', marginBottom: '20px' },
  cardTitle: { fontSize: '18px', marginBottom: '10px', color: '#334155', fontWeight: 'bold' },
  cardDesc: { color: '#64748b', fontSize: '14px', marginBottom: '20px', height: '40px' },
  btn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
};

export default Dashboard;