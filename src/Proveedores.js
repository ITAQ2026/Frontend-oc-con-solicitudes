import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2, MapPin, Search, Loader2, Phone, Home } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Estado inicial siguiendo los campos de tu Entidad de TypeORM
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '',
    direccion: '',
    telefono: '',
    email: '' // Añadido ya que figura en tu Entity
  });

  useEffect(() => {
    cargarProveedores();
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
      return alert("⚠️ El nombre y el CUIT son campos obligatorios");
    }

    // PAYLOAD FILTRADO: Solo enviamos lo que existe en tu archivo Proveedor.entity.ts
    const payload = {
      nombre: nuevoProveedor.nombre.trim().toUpperCase(),
      cuit: nuevoProveedor.cuit,
      direccion: nuevoProveedor.direccion.trim().toUpperCase(),
      telefono: nuevoProveedor.telefono.trim(),
      email: nuevoProveedor.email.toLowerCase().trim()
    };

    try {
      await api.post('/api/proveedores', payload);
      
      setNuevoProveedor({
        nombre: '', cuit: '', direccion: '', telefono: '', email: ''
      });
      
      alert("✅ Proveedor registrado correctamente");
      cargarProveedores();
    } catch (err) {
      // Si el error es por CUIT duplicado, NestJS suele devolver un mensaje específico
      alert(`❌ Error al guardar: ${err.message}`);
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente este proveedor?")) {
      try {
        await api.delete(`/api/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        alert("No se pudo eliminar: Verifique si tiene órdenes asociadas.");
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
            <p style={styles.subtitle}>Sincronizado con Base de Datos Alpha Química</p>
          </div>
        </div>

        <form onSubmit={agregarProveedor} style={styles.formGrid}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Razón Social / Nombre</label>
            <input style={styles.input} name="nombre" value={nuevoProveedor.nombre} onChange={manejarCambio} placeholder="Ej: ALPHA QUIMICA S.A." required />
          </div>

          <div>
            <label style={{...styles.label, color: '#3b82f6'}}>CUIT</label>
            <input style={{...styles.input, borderColor: '#3b82f6'}} name="cuit" value={nuevoProveedor.cuit} onChange={manejarCambio} placeholder="30-60968636-3" required />
          </div>

          <div>
            <label style={styles.label}>Correo Electrónico</label>
            <input style={styles.input} type="email" name="email" value={nuevoProveedor.email} onChange={manejarCambio} placeholder="proveedor@empresa.com" />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Dirección Comercial</label>
            <input style={styles.input} name="direccion" value={nuevoProveedor.direccion} onChange={manejarCambio} placeholder="Calle, Número, Localidad" />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} name="telefono" value={nuevoProveedor.telefono} onChange={manejarCambio} placeholder="Ej: 0353 453-XXXX" />
          </div>

          <button type="submit" style={styles.btnPrimary}>GUARDAR PROVEEDOR</button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '30px' }}>
        <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Proveedores en Sistema</h3>
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
                <th style={styles.th}>Proveedor / CUIT</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Dirección</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" style={styles.emptyState}><Loader2 className="animate-spin" /> Conectando con servidor...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan="4" style={styles.emptyState}>No se encontraron registros.</td></tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.pNombre}>{p.nombre}</div>
                      <div style={styles.pCuit}>{p.cuit}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.pInfo}><Phone size={12}/> {p.telefono || 'N/A'}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{p.email || '-'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.pInfo}><Home size={12}/> {p.direccion || 'No especificada'}</div>
                    </td>
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

const styles = {
  container: { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '950px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  iconBox: { background: '#0f172a', padding: '10px', borderRadius: '10px' },
  title: { margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' },
  subtitle: { margin: 0, fontSize: '12px', color: '#64748b' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  tableTitle: { margin: 0, fontSize: '16px', color: '#1e293b' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 15px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  searchInput: { background: 'none', border: 'none', outline: 'none', fontSize: '13px', width: '200px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '14px' },
  pNombre: { fontWeight: 'bold', color: '#0f172a' },
  pCuit: { color: '#3b82f6', fontSize: '12px', fontWeight: '500' },
  pInfo: { display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '13px' },
  btnDelete: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '6px' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8' }
};

export default GestionProveedores;