import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2, MapPin, Search, Loader2, Info } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    codigoPostal: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      // Usamos la ruta directa, el interceptor maneja el resto
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
      return alert("⚠️ El nombre y el CUIT son campos obligatorios");
    }

    try {
      // El interceptor inyecta el adminId automáticamente desde el localStorage
      await api.post('/api/proveedores', nuevoProveedor);
      
      setNuevoProveedor({
        nombre: '', cuit: '', direccion: '', localidad: '',
        provincia: '', telefono: '', codigoPostal: ''
      });
      
      alert("✅ Proveedor registrado correctamente");
      cargarProveedores();
    } catch (err) {
      // Capturamos el error procesado por nuestro interceptor de respuesta
      alert(`❌ ${err.message}`);
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente este proveedor?")) {
      try {
        await api.delete(`/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        alert("No se pudo eliminar: El proveedor podría tener órdenes de compra asociadas.");
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.cuit?.includes(busqueda)
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}><UserPlus size={22} color="white" /></div>
          <div>
            <h2 style={styles.title}>Gestión de Proveedores</h2>
            <p style={styles.subtitle}>Alta y administración de entidades comerciales</p>
          </div>
        </div>

        <form onSubmit={agregarProveedor} style={styles.formGrid}>
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
            <label style={styles.label}>Nombre / Razón Social</label>
            <input style={styles.input} name="nombre" value={nuevoProveedor.nombre} onChange={manejarCambio} placeholder="Ej: Alpha Química S.A." required />
          </div>

          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
            <label style={{...styles.label, color: '#3b82f6'}}>CUIT (Sin puntos)</label>
            <input style={{...styles.input, borderColor: '#3b82f6'}} name="cuit" value={nuevoProveedor.cuit} onChange={manejarCambio} placeholder="30-60968636-3" required />
          </div>

          <div style={{ gridColumn: 'span 2' }}><hr style={styles.hr} /></div>

          <div>
            <label style={styles.label}>Dirección</label>
            <input style={styles.input} name="direccion" value={nuevoProveedor.direccion} onChange={manejarCambio} placeholder="Calle y número" />
          </div>

          <div>
            <label style={styles.label}>Localidad</label>
            <input style={styles.input} name="localidad" value={nuevoProveedor.localidad} onChange={manejarCambio} placeholder="Ciudad" />
          </div>

          <div>
            <label style={styles.label}>Provincia</label>
            <input style={styles.input} name="provincia" value={nuevoProveedor.provincia} onChange={manejarCambio} placeholder="Ej: Córdoba" />
          </div>

          <div>
            <label style={styles.label}>Código Postal</label>
            <input style={styles.input} name="codigoPostal" value={nuevoProveedor.codigoPostal} onChange={manejarCambio} placeholder="CP" />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Contacto Telefónico</label>
            <input style={styles.input} name="telefono" value={nuevoProveedor.telefono} onChange={manejarCambio} placeholder="Ej: 0353 453-XXXX" />
          </div>

          <button type="submit" style={styles.btnPrimary}>REGISTRAR EN BASE DE DATOS</button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '30px' }}>
        <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Registros Existentes</h3>
            <div style={styles.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input 
                    style={styles.searchInput} 
                    placeholder="Buscar por nombre o CUIT..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
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
                <tr><td colSpan="4" style={styles.emptyState}><Loader2 className="spin" /> Cargando...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan="4" style={styles.emptyState}>No se encontraron resultados.</td></tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.pNombre}>{p.nombre}</div>
                      <div style={styles.pCuit}>{p.cuit}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{display:'flex', alignItems:'center', gap: '4px'}}>
                        <MapPin size={12} color="#64748b"/>
                        {p.localidad || 'N/C'}, {p.provincia || '-'}
                      </div>
                      <small style={{color:'#94a3b8'}}>{p.direccion}</small>
                    </td>
                    <td style={styles.td}>{p.telefono || '---'}</td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button onClick={() => eliminarProveedor(p.id)} style={styles.btnDelete} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
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

// Variable auxiliar para responsividad básica en estilos inline
const isMobile = window.innerWidth < 768;

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
  btnPrimary: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '10px', transition: '0.2s' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  tableTitle: { margin: 0, fontSize: '16px', color: '#1e293b', borderLeft: '4px solid #3b82f6', paddingLeft: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 15px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  searchInput: { background: 'none', border: 'none', outline: 'none', fontSize: '13px', width: '200px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #f1f5f9' },
  th: { textAlign: 'left', padding: '12px 15px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px 15px', fontSize: '14px' },
  pNombre: { fontWeight: '600', color: '#1e293b' },
  pCuit: { color: '#3b82f6', fontSize: '12px', fontWeight: '500' },
  btnDelete: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '6px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }
};

export default GestionProveedores;