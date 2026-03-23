import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2, MapPin, Search, Loader2, Phone, Mail } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '',
    email: '',
    telefono: '',
    direccion: '',
    localidad: '',
    provincia: '',
    codigoPostal: ''
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    cargarProveedores();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const res = await api.get('/api/proveedores');
      setProveedores(res.data || []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'cuit') {
      let numeros = value.replace(/\D/g, '').slice(0, 11);
      let formatted = numeros;
      if (numeros.length > 2 && numeros.length <= 10) {
        formatted = `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
      } else if (numeros.length > 10) {
        formatted = `${numeros.slice(0, 2)}-${numeros.slice(2, 10)}-${numeros.slice(10)}`;
      }
      setNuevoProveedor({ ...nuevoProveedor, cuit: formatted });
    } else {
      setNuevoProveedor({ ...nuevoProveedor, [name]: value });
    }
  };

  const agregarProveedor = async (e) => {
    e.preventDefault();
    if (!nuevoProveedor.nombre || !nuevoProveedor.cuit) {
      return alert("⚠️ El nombre y el CUIT son obligatorios");
    }

    // Ahora enviamos el objeto completo porque el DTO y la Entity ya lo aceptan
    const payload = {
      ...nuevoProveedor,
      nombre: nuevoProveedor.nombre.trim().toUpperCase(),
      direccion: nuevoProveedor.direccion.trim().toUpperCase(),
      localidad: nuevoProveedor.localidad.trim().toUpperCase(),
      provincia: nuevoProveedor.provincia.trim().toUpperCase(),
    };

    try {
      await api.post('/api/proveedores', payload);
      setNuevoProveedor({
        nombre: '', cuit: '', email: '', telefono: '',
        direccion: '', localidad: '', provincia: '', codigoPostal: ''
      });
      alert("✅ Proveedor registrado y guardado en la base de datos");
      cargarProveedores();
    } catch (err) {
      alert(`❌ Error al guardar: ${err.message}`);
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await api.delete(`/api/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        alert("Error al eliminar.");
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.cuit?.includes(busqueda)
  );

  return (
    <div style={styles.container}>
      {/* CARD DE REGISTRO */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}><UserPlus size={22} color="white" /></div>
          <div>
            <h2 style={styles.title}>Gestión de Proveedores</h2>
            <p style={styles.subtitle}>Alta completa de proveedores comerciales</p>
          </div>
        </div>

        <form onSubmit={agregarProveedor} style={styles.formGrid}>
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
            <label style={styles.label}>Nombre / Razón Social</label>
            <input style={styles.input} name="nombre" value={nuevoProveedor.nombre} onChange={manejarCambio} required />
          </div>
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
            <label style={{...styles.label, color: '#3b82f6'}}>CUIT</label>
            <input style={{...styles.input, borderColor: '#3b82f6'}} name="cuit" value={nuevoProveedor.cuit} onChange={manejarCambio} required />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Email de contacto</label>
            <input style={styles.input} type="email" name="email" value={nuevoProveedor.email} onChange={manejarCambio} />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} name="telefono" value={nuevoProveedor.telefono} onChange={manejarCambio} />
          </div>

          <div style={{ gridColumn: 'span 2' }}><hr style={styles.hr} /></div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Calle y Número</label>
            <input style={styles.input} name="direccion" value={nuevoProveedor.direccion} onChange={manejarCambio} />
          </div>
          <div>
            <label style={styles.label}>Localidad</label>
            <input style={styles.input} name="localidad" value={nuevoProveedor.localidad} onChange={manejarCambio} />
          </div>
          <div>
            <label style={styles.label}>Provincia</label>
            <input style={styles.input} name="provincia" value={nuevoProveedor.provincia} onChange={manejarCambio} />
          </div>

          <button type="submit" style={styles.btnPrimary}>GUARDAR PROVEEDOR</button>
        </form>
      </div>

      {/* LISTADO SINCRONIZADO */}
      <div style={{ ...styles.card, marginTop: '30px' }}>
        <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Registros en Sistema</h3>
            <div style={styles.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input style={styles.searchInput} placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Ubicación</th>
                <th style={styles.th}>Contacto</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" style={styles.emptyState}><Loader2 style={{animation: 'spin 1s linear infinite'}} /></td></tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.pNombre}>{p.nombre}</div>
                      <div style={styles.pCuit}>{p.cuit}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{display:'flex', alignItems:'center', gap: '4px', fontSize: '13px'}}>
                        <MapPin size={12} color="#3b82f6"/>
                        {p.localidad}, {p.provincia}
                      </div>
                      <small style={{color:'#64748b'}}>{p.direccion}</small>
                    </td>
                    <td style={styles.td}>
                      <div style={{fontSize: '13px'}}><Phone size={12} style={{marginRight: 4}}/>{p.telefono || '-'}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}><Mail size={12} style={{marginRight: 4}}/>{p.email || '-'}</div>
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button onClick={() => eliminarProveedor(p.id)} style={styles.btnDelete}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px 20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  iconBox: { background: '#0f172a', padding: '10px', borderRadius: '12px' },
  title: { margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '700' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  hr: { border: '0', borderTop: '1px solid #f1f5f9', margin: '10px 0' },
  btnPrimary: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '10px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  tableTitle: { margin: 0, fontSize: '16px', color: '#1e293b', borderLeft: '4px solid #3b82f6', paddingLeft: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 15px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  searchInput: { background: 'none', border: 'none', outline: 'none', fontSize: '13px', width: '200px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #f1f5f9' },
  th: { textAlign: 'left', padding: '12px 15px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px 15px', fontSize: '14px' },
  pNombre: { fontWeight: '600', color: '#1e293b' },
  pCuit: { color: '#3b82f6', fontSize: '12px', fontWeight: '500' },
  btnDelete: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '6px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8' }
};

export default GestionProveedores;