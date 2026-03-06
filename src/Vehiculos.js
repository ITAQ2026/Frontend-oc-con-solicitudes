import React, { useState, useEffect } from 'react';
// CORRECCIÓN: Como Vehiculos.js está en la raíz de src, usamos ./api
import api from './api'; 
import { Truck, Plus, Trash2 } from 'lucide-react';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({ patente: '', modelo: '', anio: '', vencimiento_vtv: '' });

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const res = await api.get('/api/vehiculos');
      setVehiculos(res.data);
    } catch (err) { 
      console.error("Error al cargar flota"); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/vehiculos', form);
      alert("✅ Vehículo guardado");
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
          <input 
            style={styles.input} 
            placeholder="PATENTE" 
            required 
            value={form.patente} 
            onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} 
          />
          <input 
            style={styles.input} 
            placeholder="MODELO" 
            required 
            value={form.modelo} 
            onChange={e => setForm({...form, modelo: e.target.value})} 
          />
          <input 
            style={styles.input} 
            type="number" 
            placeholder="AÑO" 
            value={form.anio} 
            onChange={e => setForm({...form, anio: e.target.value})} 
          />
          <input 
            style={styles.input} 
            type="date" 
            value={form.vencimiento_vtv} 
            onChange={e => setForm({...form, vencimiento_vtv: e.target.value})} 
          />
          <button type="submit" style={styles.btnSave}>
            <Plus size={18}/> AGREGAR
          </button>
        </form>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th>PATENTE</th>
              <th>MODELO</th>
              <th>VTV VENCE</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map(v => (
              <tr key={v.id} style={styles.tdRow}>
                <td><strong>{v.patente}</strong></td>
                <td>{v.modelo}</td>
                <td>{v.vencimiento_vtv || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={async () => { 
                      if(window.confirm("¿Desea eliminar este vehículo?")) { 
                        try {
                          await api.delete(`/api/vehiculos/${v.id}`); 
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
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '12px', padding: '25px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#1e293b' },
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
    gap: '10px', 
    marginBottom: '30px' 
  },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
  btnSave: { 
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
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px', padding: '10px' },
  tdRow: { borderBottom: '1px solid #f1f5f9', height: '50px', fontSize: '14px' },
  btnDel: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }
};

export default Vehiculos;