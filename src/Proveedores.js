import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2, Search, Loader2, Phone, Home } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '',
    direccion: '',
    telefono: '',
    email: ''
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

    const payload = {
      nombre: nuevoProveedor.nombre.trim().toUpperCase(),
      cuit: nuevoProveedor.cuit,
      direccion: nuevoProveedor.direccion.trim().toUpperCase(),
      telefono: nuevoProveedor.telefono.trim(),
      email: nuevoProveedor.email.toLowerCase().trim()
    };

    try {
      await api.post('/api/proveedores', payload);
      setNuevoProveedor({ nombre: '', cuit: '', direccion: '', telefono: '', email: '' });
      alert("✅ Proveedor registrado correctamente");
      cargarProveedores();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await api.delete(`/api/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        alert("No se pudo eliminar el proveedor.");
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.cuit?.includes(busqueda)
  );

  // --- LOS ESTILOS DEBEN ESTAR DENTRO DEL ARCHIVO PARA QUE NO MARQUE ROJO ---
  const styles = {
    container: { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' },
    card: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    iconBox: { background: '#0f172a', padding: '10px', borderRadius: '10px' },
    title: { margin: 0, fontSize: '18px', color: '#0f172a' },
    subtitle: { margin: 0, fontSize: '12px', color: '#64748b' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
    label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '5px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' },
    btnPrimary: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    tableTitle: { margin: 0, fontSize: '16px', color: '#1e293b' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '5px 12px', borderRadius: '20px' },
    searchInput: { background: 'none', border: 'none', outline: 'none', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { background: '#f8fafc' },
    th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px', fontSize: '14px' },
    pNombre: { fontWeight: 'bold' },
    pCuit: { color: '#3b82f6', fontSize: '12px' },
    pInfo: { display: 'flex', alignItems: 'center', gap: '5px', color: '#475569' },
    btnDelete: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '4px' },
    emptyState: { textAlign: 'center', padding: '20px', color: '#94a3b8' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}><UserPlus size={22} color="white" /></div>
          <div>
            <h2 style={styles.title}>Gestión de Proveedores</h2>
            <p style={styles.subtitle}>Administración de Entidades</p>
          </div>
        </div>

        <form onSubmit={agregarProveedor} style={styles.formGrid}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Razón Social</label>
            <input style={styles.input} name="nombre" value={nuevoProveedor.nombre} onChange={manejarCambio} placeholder="Nombre de la empresa" required />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>CUIT</label>
            <input style={styles.input} name="cuit" value={nuevoProveedor.cuit} onChange={manejarCambio} placeholder="00-00000000-0" required />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={nuevoProveedor.email} onChange={manejarCambio} placeholder="correo@ejemplo.com" />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Dirección</label>
            <input style={styles.input} name="direccion" value={nuevoProveedor.direccion} onChange={manejarCambio} placeholder="Calle y número" />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} name="telefono" value={nuevoProveedor.telefono} onChange={manejarCambio} placeholder="Teléfono de contacto" />
          </div>

          <button type="submit" style={styles.btnPrimary}>REGISTRAR PROVEEDOR</button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '30px' }}>
        <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Registros</h3>
            <div style={styles.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input 
                    style={styles.searchInput} 
                    placeholder="Buscar..." 
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
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Dirección</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" style={styles.emptyState}><Loader2 className="animate-spin" /> Cargando...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan="4" style={styles.emptyState}>No hay datos</td></tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.pNombre}>{p.nombre}</div>
                      <div style={styles.pCuit}>{p.cuit}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.pInfo}><Phone size={12}/> {p.telefono || 'N/A'}</div>
                      <div style={{fontSize: '11px'}}>{p.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.pInfo}><Home size={12}/> {p.direccion || 'N/A'}</div>
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button onClick={() => eliminarProveedor(p.id)} style={styles.btnDelete}>
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

export default GestionProveedores;