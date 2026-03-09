import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Truck, Plus, Trash2, Calendar } from 'lucide-react';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({ patente: '', modelo: '', anio: '', vencimiento_vtv: '' });

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      // CORRECCIÓN FINAL: Solo ponemos '/vehiculos' 
      // porque el '/api' ya viene de la baseURL en api.js
      const res = await api.get('/vehiculos'); 
      setVehiculos(res.data);
    } catch (err) { 
      console.error("Error al cargar flota", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // CORRECCIÓN: Se quita /api/
      await api.post('/vehiculos', form);
      alert("✅ Vehículo guardado con éxito");
      setForm({ patente: '', modelo: '', anio: '', vencimiento_vtv: '' });
      fetchVehiculos();
    } catch (err) { 
      alert("❌ Error: Posible patente duplicada o error de conexión"); 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Truck size={24} /> Gestión de Flota (Logística)</h2>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div>
            <label style={styles.miniLabel}>Patente</label>
            <input 
              style={styles.input} 
              placeholder="Ej: ABC-123" 
              required 
              value={form.patente} 
              onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} 
            />
          </div>
          <div>
            <label style={styles.miniLabel}>Modelo / Marca</label>
            <input 
              style={styles.input} 
              placeholder="Ej: Hilux" 
              required 
              value={form.modelo} 
              onChange={e => setForm({...form, modelo: e.target.value})} 
            />
          </div>
          <div>
            <label style={styles.miniLabel}>Año</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="2024" 
              value={form.anio} 
              onChange={e => setForm({...form, anio: e.target.value})} 
            />
          </div>
          <div>
            <label style={styles.miniLabel}>Vence VTV</label>
            <input 
              style={styles.input} 
              type="date" 
              value={form.vencimiento_vtv} 
              onChange={e => setForm({...form, vencimiento_vtv: e.target.value})} 
            />
          </div>
          <button type="submit" style={styles.btnSave}>
            <Plus size={18}/> AGREGAR
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>PATENTE</th>
                <th>MODELO</th>
                <th>AÑO</th>
                <th>VENCIMIENTO VTV</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map(v => (
                <tr key={v.id} style={styles.tdRow}>
                  <td style={styles.td}><strong>{v.patente}</strong></td>
                  <td style={styles.td}>{v.modelo}</td>
                  <td style={styles.td}>{v.anio || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} color="#64748b" />
                      {v.vencimiento_vtv ? new Date(v.vencimiento_vtv).toLocaleDateString() : 'Pendiente'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={async () => { 
                        if(window.confirm(`¿Eliminar vehículo ${v.patente}?`)) { 
                          try {
                            // CORRECCIÓN: Se quita /api/
                            await api.delete(`/vehiculos/${v.id}`); 
                            fetchVehiculos(); 
                          } catch(e) { alert("Error al eliminar"); }
                        } 
                      }} 
                      style={styles.btnDel}
                    >
                      <Trash2 size={16}/>
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
  container: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#1e293b' },
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
    gap: '15px', 
    marginBottom: '40px',
    background: '#f1f5f9',
    padding: '20px',
    borderRadius: '10px'
  },
  miniLabel: { display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
  btnSave: { 
    height: '40px',
    marginTop: 'auto',
    background: '#0f172a', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px 5px', fontSize: '14px', color: '#334155' },
  btnDel: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '6px' }
};

export default Vehiculos;