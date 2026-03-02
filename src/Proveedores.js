import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2, Globe, Phone, Hash } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    codigoPostal: ''
  });

  // Cargar proveedores al inicio
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      // ✅ Ruta corregida con /api/
      const res = await api.get('/api/proveedores');
      setProveedores(res.data || []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    }
  };

  const manejarCambio = (e) => {
    setNuevoProveedor({ ...nuevoProveedor, [e.target.name]: e.target.value });
  };

  const agregarProveedor = async (e) => {
    e.preventDefault();
    if (!nuevoProveedor.nombre || !nuevoProveedor.cuit) {
      return alert("⚠️ El nombre y el CUIT son campos obligatorios");
    }

    try {
      // ✅ Ruta corregida con /api/
      await api.post('/api/proveedores', nuevoProveedor);
      
      setNuevoProveedor({
        nombre: '',
        cuit: '',
        direccion: '',
        localidad: '',
        provincia: '',
        telefono: '',
        codigoPostal: ''
      });
      
      alert("✅ Proveedor registrado correctamente");
      cargarProveedores();
    } catch (err) {
      console.error("Error al agregar:", err);
      alert("Error al guardar en la base de datos. Verifique los datos e intente nuevamente.");
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente este proveedor?")) {
      try {
        // ✅ Ruta corregida con /api/
        await api.delete(`/api/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el proveedor. Es posible que tenga órdenes asociadas.");
      }
    }
  };

  return (
    <div style={{ padding: '30px 20px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <UserPlus size={24} color="#0f172a" />
          <h2 style={{ margin: 0, color: '#0f172a' }}>Gestión de Proveedores</h2>
        </div>

        <form onSubmit={agregarProveedor} style={styles.formGrid}>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={styles.label}>Nombre / Razón Social</label>
            <input 
              style={styles.input} 
              name="nombre" 
              value={nuevoProveedor.nombre} 
              onChange={manejarCambio} 
              placeholder="Ej: Alpha Química S.A." 
              required
            />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{...styles.label, color: '#3b82f6'}}>CUIT / CUIL</label>
            <input 
              style={{...styles.input, borderColor: '#3b82f6'}} 
              name="cuit" 
              value={nuevoProveedor.cuit} 
              onChange={manejarCambio} 
              placeholder="20-XXXXXXXX-X" 
              required
            />
          </div>

          <div>
            <label style={styles.label}>Dirección</label>
            <input 
              style={styles.input} 
              name="direccion" 
              value={nuevoProveedor.direccion} 
              onChange={manejarCambio} 
              placeholder="Calle y número" 
            />
          </div>

          <div>
            <label style={styles.label}>Código Postal</label>
            <input 
              style={styles.input} 
              name="codigoPostal" 
              value={nuevoProveedor.codigoPostal} 
              onChange={manejarCambio} 
              placeholder="CP" 
            />
          </div>

          <div>
            <label style={styles.label}>Localidad</label>
            <input 
              style={styles.input} 
              name="localidad" 
              value={nuevoProveedor.localidad} 
              onChange={manejarCambio} 
              placeholder="Ciudad" 
            />
          </div>

          <div>
            <label style={styles.label}>Provincia</label>
            <input 
              style={styles.input} 
              name="provincia" 
              value={nuevoProveedor.provincia} 
              onChange={manejarCambio} 
              placeholder="Estado/Provincia" 
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Número de Teléfono</label>
            <input 
              style={styles.input} 
              name="telefono" 
              value={nuevoProveedor.telefono} 
              onChange={manejarCambio} 
              placeholder="Ej: +54 9 353 000-0000" 
            />
          </div>

          <button type="submit" style={styles.btnPrimary}>GUARDAR PROVEEDOR</button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '30px', padding: '20px' }}>
        <h3 style={{ color: '#334155', marginBottom: '20px', fontSize: '18px', borderLeft: '4px solid #3b82f6', paddingLeft: '10px' }}>
            Proveedores Registrados
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}><UserPlus size={14}/> Nombre y CUIT</th>
                <th style={styles.th}><Globe size={14}/> Ubicación</th>
                <th style={styles.th}><Phone size={14}/> Teléfono</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                  <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No hay proveedores cargados.</td></tr>
              ) : (
                proveedores.map((p) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{fontWeight: '700', color: '#1e293b'}}>{p.nombre}</div>
                        <div style={{color: '#3b82f6', fontSize: '12px', fontWeight: '600'}}>{p.cuit}</div>
                      </td>
                      <td style={styles.td}>
                        {p.direccion && `${p.direccion}, `}
                        {p.localidad && `${p.localidad} `}
                        <br />
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{p.provincia} {p.codigoPostal && `(CP: ${p.codigoPostal})`}</span>
                      </td>
                      <td style={styles.td}>{p.telefono || 'Sin teléfono'}</td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => eliminarProveedor(p.id)} 
                          style={styles.btnIconDelete}
                          title="Eliminar proveedor"
                        >
                          <Trash2 size={18} />
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
  card: { background: 'white', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '950px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' },
  btnPrimary: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc' },
  th: { textAlign: 'left', padding: '15px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '15px', fontSize: '14px', color: '#334155' },
  btnIconDelete: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default GestionProveedores;