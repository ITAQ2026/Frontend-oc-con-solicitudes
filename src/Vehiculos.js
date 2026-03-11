import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Truck, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patente: '', modelo: '', anio: '', vencimiento_vtv: '' });

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const res = await api.get('/api/vehiculos'); 
      setVehiculos(res.data || []);
    } catch (err) {
      console.error("Error al cargar flota", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/vehiculos', form); 
      alert("✅ Vehículo registrado en la flota");
      setForm({ patente: '', modelo: '', anio: '', vencimiento_vtv: '' });
      fetchVehiculos();
    } catch (err) { 
      alert("❌ Error: Verifique que la patente no esté duplicada."); 
    } finally {
      setLoading(false);
    }
  };

  const eliminarVehiculo = async (id, patente) => {
    if(window.confirm(`¿Desea dar de baja el vehículo ${patente} de la flota?`)) { 
      try {
        await api.delete(`/api/vehiculos/${id}`); 
        fetchVehiculos(); 
      } catch(e) { 
        alert("Error al eliminar"); 
      }
    }
  };

  // Función para detectar VTV vencida o próxima a vencer (30 días)
  const getVtvStatus = (fecha) => {
    if (!fecha) return { color: '#64748b', text: 'Sin fecha' };
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diff = (vencimiento - hoy) / (1000 * 60 * 60 * 24);
    
    if (diff < 0) return { color: '#ef4444', text: 'VENCIDA', alert: true };
    if (diff < 30) return { color: '#f59e0b', text: 'Próxima a vencer', alert: true };
    return { color: '#10b981', text: 'Al día' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <h2 style={styles.header}><Truck size={28} color="#0f172a" /> Control de Flota Logística</h2>
          <p style={styles.subtitle}>Seguimiento de unidades y vencimientos técnicos</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Patente / Dominio</label>
            <input 
              style={styles.input} 
              placeholder="Ej: AE123KL" 
              required 
              value={form.patente} 
              onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Marca y Modelo</label>
            <input 
              style={styles.input} 
              placeholder="Ej: Mercedes Sprinter" 
              required 
              value={form.modelo} 
              onChange={e => setForm({...form, modelo: e.target.value})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Año Unidad</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="2024" 
              value={form.anio} 
              onChange={e => setForm({...form, anio: e.target.value})} 
            />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.miniLabel}>Vencimiento VTV</label>
            <input 
              style={styles.input} 
              type="date" 
              value={form.vencimiento_vtv} 
              onChange={e => setForm({...form, vencimiento_vtv: e.target.value})} 
            />
          </div>
          <button type="submit" style={styles.btnSave} disabled={loading}>
            <Plus size={18}/> {loading ? '...' : 'REGISTRAR'}
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>UNIDAD</th>
                <th style={styles.th}>MODELO</th>
                <th style={styles.th}>VTV / ESTADO</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.length > 0 ? vehiculos.map(v => {
                const status = getVtvStatus(v.vencimiento_vtv);
                return (
                  <tr key={v.id} style={styles.tdRow}>
                    <td style={styles.td}>
                      <div style={styles.patenteBadge}>{v.patente}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{fontWeight: '600'}}>{v.modelo}</div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>Año: {v.anio || 'N/D'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', color: status.color, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {status.alert && <AlertCircle size={14} />} {status.text}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Vence: {v.vencimiento_vtv ? new Date(v.vencimiento_vtv).toLocaleDateString() : 'No cargada'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => eliminarVehiculo(v.id, v.patente)} 
                        style={styles.btnDel}
                        title="Eliminar de flota"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" style={styles.empty}>No hay vehículos registrados en la flota.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '35px', maxWidth: '950px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  headerContainer: { marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '40px', background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  miniLabel: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outlineColor: '#0f172a' },
  btnSave: { height: '45px', marginTop: 'auto', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #f1f5f9', fontWeight: '700', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f8fafc', transition: '0.2s' },
  td: { padding: '15px 12px', fontSize: '14px', color: '#334155' },
  patenteBadge: { background: '#0f172a', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', display: 'inline-block', letterSpacing: '1px' },
  btnDel: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '10px', borderRadius: '8px' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }
};

export default Vehiculos;