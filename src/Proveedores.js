import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Trash2 } from 'lucide-react';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    cuit: '', // <--- AGREGADO
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
      const res = await api.get('/proveedores');
      setProveedores(res.data);
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
      return alert("El nombre y el CUIT son obligatorios");
    }

    try {
      await api.post('/proveedores', nuevoProveedor);
      setNuevoProveedor({
        nombre: '',
        cuit: '', // <--- LIMPIAR DESPUÉS DE GUARDAR
        direccion: '',
        localidad: '',
        provincia: '',
        telefono: '',
        codigoPostal: ''
      });
      cargarProveedores();
    } catch (err) {
      console.error("Error al agregar:", err);
      alert("Error al guardar en la base de datos");
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await api.delete(`/proveedores/${id}`);
        cargarProveedores();
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <UserPlus size={24} color="#1e293b" />
          <h2 style={{ margin: 0, color: '#1e293b' }}>Registro de Proveedores</h2>
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
            />
          </div>

          {/* NUEVO CAMPO CUIT EN EL FORMULARIO */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{...styles.label, color: '#2563eb'}}>CUIT / CUIL</label>
            <input 
              style={{...styles.input, borderColor: '#bfdbfe'}} 
              name="cuit" 
              value={nuevoProveedor.cuit} 
              onChange={manejarCambio} 
              placeholder="20-XXXXXXXX-X" 
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
              placeholder="Ej: +54 9 11 0000-0000" 
            />
          </div>

          <button type="submit" style={styles.btnPrimary}>Guardar en Base de Datos</button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>Lista de Proveedores</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Nombre y CUIT</th>
                <th style={styles.th}>Ubicación</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{p.nombre}</strong><br/>
                    <small style={{color: '#3b82f6', fontWeight: 'bold'}}>CUIT: {p.cuit}</small>
                  </td>
                  <td style={styles.td}>
                    {p.direccion && `${p.direccion}, `}
                    {p.localidad && `${p.localidad} `}
                    {p.codigoPostal && `(${p.codigoPostal})`}
                    <br />
                    <small style={{ color: '#64748b' }}>{p.provincia}</small>
                  </td>
                  <td style={styles.td}>{p.telefono || '---'}</td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => eliminarProveedor(p.id)} 
                      style={styles.btnIconDelete}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' },
  btnPrimary: { gridColumn: 'span 2', background: '#1e293b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { textAlign: 'left', padding: '12px', fontSize: '13px', color: '#475569' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '14px', color: '#1e293b' },
  btnIconDelete: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '6px' }
};

export default GestionProveedores;