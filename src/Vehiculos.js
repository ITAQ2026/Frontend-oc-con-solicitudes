import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Truck, Plus, Trash2 } from 'lucide-react';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    patente: '', 
    marca: '', 
    modelo: '', 
    anio: '', 
    kilometraje_actual: 0,
    estado: 'Disponible' 
  });

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // 1. LISTAR: Se agrega /api manualmente
  const fetchVehiculos = async () => {
    try {
      const res = await api.get('/api/vehiculos'); 
      setVehiculos(res.data || []);
    } catch (err) {
      console.error("Error al cargar flota", err);
    }
  };

  // 2. CREAR: Se agrega /api manualmente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/vehiculos', {
        ...form,
        anio: Number(form.anio),
        kilometraje_actual: Number(form.kilometraje_actual)
      }); 
      
      alert("✅ Vehículo registrado correctamente");
      setForm({ patente: '', marca: '', modelo: '', anio: '', kilometraje_actual: 0, estado: 'Disponible' });
      fetchVehiculos();
    } catch (err) { 
      alert("❌ " + (err.message || "Error al registrar")); 
    } finally {
      setLoading(false);
    }
  };

  // 3. CAMBIAR ESTADO: Se agrega /api manualmente
  const handleCambioEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/api/vehiculos/${id}/estado`, { estado: nuevoEstado });
      // Actualización optimista en la interfaz
      setVehiculos(prev => prev.map(v => v.id === id ? { ...v, estado: nuevoEstado } : v));
    } catch (err) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  // 4. ELIMINAR: Se agrega /api manualmente
  const eliminarVehiculo = async (id, patente) => {
    if(window.confirm(`¿Desea dar de baja el vehículo ${patente}?`)) { 
      try {
        await api.delete(`/api/vehiculos/${id}`); 
        fetchVehiculos(); 
      } catch(e) { 
        alert("Error: " + e.message); 
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <h2 style={styles.header}><Truck size={28} color="#0f172a" /> Control de Flota Logística</h2>
          <p style={styles.subtitle}>Gestión de unidades y estado de activos</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Patente</label>
            <input 
              style={styles.input} 
              placeholder="AE123KL" required 
              value={form.patente} 
              onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Marca</label>
            <input 
              style={styles.input} 
              placeholder="Toyota" required 
              value={form.marca} 
              onChange={e => setForm({...form, marca: e.target.value})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Modelo</label>
            <input 
              style={styles.input} 
              placeholder="Hilux" required 
              value={form.modelo} 
              onChange={e => setForm({...form, modelo: e.target.value})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Año</label>
            <input 
              style={styles.input} 
              type="number" value={form.anio} 
              placeholder="2024"
              onChange={e => setForm({...form, anio: e.target.value})} 
            />
          </div>
          <button type="submit" style={styles.btnSave} disabled={loading}>
            <Plus size={18}/> {loading ? '...' : 'AÑADIR'}
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>UNIDAD</th>
                <th style={styles.th}>DATOS</th>
                <th style={styles.th}>ESTADO ACTUAL</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.length > 0 ? vehiculos.map(v => (
                <tr key={v.id} style={styles.tdRow}>
                  <td style={styles.td}>
                    <div style={styles.patenteBadge}>{v.patente}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{fontWeight: '600'}}>{v.marca} {v.modelo}</div>
                    <div style={{fontSize: '12px', color: '#64748b'}}>Año: {v.anio || 'N/D'}</div>
                  </td>
                  <td style={styles.td}>
                    <select 
                      value={v.estado}
                      onChange={(e) => handleCambioEstado(v.id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor: getStatusColor(v.estado).bg,
                        color: getStatusColor(v.estado).text
                      }}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="En Uso">En Uso</option>
                      <option value="En Taller">En Taller</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => eliminarVehiculo(v.id, v.patente)} 
                      style={styles.btnDel} title="Dar de baja"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={styles.empty}>No hay unidades registradas en la flota.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Disponible': return { bg: '#dcfce7', text: '#166534' };
    case 'En Uso': return { bg: '#e0f2fe', text: '#0369a1' };
    case 'En Taller': return { bg: '#fef3c7', text: '#92400e' };
    default: return { bg: '#fee2e2', text: '#991b1b' };
  }
};

const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '35px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  headerContainer: { marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '40px', background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  miniLabel: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  statusSelect: { padding: '6px 10px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
  btnSave: { height: '42px', marginTop: 'auto', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #f1f5f9', fontWeight: '700', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '15px 12px', fontSize: '14px', color: '#334155' },
  patenteBadge: { background: '#0f172a', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', width: 'fit-content' },
  btnDel: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '6px' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8' }
};

export default Vehiculos;