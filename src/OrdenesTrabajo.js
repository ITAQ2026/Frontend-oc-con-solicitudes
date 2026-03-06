import React, { useState, useEffect } from 'react';
// CORRECCIÓN: Se cambia la ruta para que coincida con la ubicación en src/
import api from './api'; 
import { Wrench, Plus, Trash2, Save } from 'lucide-react';

const OrdenesTrabajo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [repuestos, setRepuestos] = useState([{ descripcion: '', cantidad: 1 }]);
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    falla: '', 
    tareas: '', 
    kilometraje: '', 
    responsable: '' 
  });

  useEffect(() => {
    // Carga de vehículos para el selector
    api.get('/api/vehiculos')
      .then(res => setVehiculos(res.data))
      .catch(err => console.error("Error al cargar vehículos", err));
  }, []);

  const agregarRepuesto = () => setRepuestos([...repuestos, { descripcion: '', cantidad: 1 }]);

  const guardarOT = async (e) => {
    e.preventDefault();
    const data = { ...form, repuestos };
    try {
      await api.post('/api/ordenes-trabajo', data);
      alert("✅ Orden de Trabajo registrada con éxito");
      // Limpieza manual de estados para evitar recarga forzada si prefieres
      setForm({ vehiculoId: '', falla: '', tareas: '', kilometraje: '', responsable: '' });
      setRepuestos([{ descripcion: '', cantidad: 1 }]);
      window.location.reload(); 
    } catch (err) { 
      alert("❌ Error al guardar la orden. Verifique los datos."); 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Nueva Orden de Trabajo</h2>
        
        <form onSubmit={guardarOT}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Vehículo</label>
              <select 
                style={styles.input} 
                required 
                value={form.vehiculoId} 
                onChange={e => setForm({...form, vehiculoId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Kilometraje Actual</label>
              <input 
                style={styles.input} 
                type="number" 
                placeholder="Ej: 150000" 
                value={form.kilometraje}
                onChange={e => setForm({...form, kilometraje: e.target.value})} 
              />
            </div>
          </div>

          <label style={styles.label}>Falla Reportada / Diagnóstico</label>
          <textarea 
            style={styles.textarea} 
            placeholder="Describa el problema reportado por el conductor..." 
            value={form.falla}
            onChange={e => setForm({...form, falla: e.target.value})} 
          />

          <div style={styles.sectionRepuestos}>
            <label style={styles.label}>Repuestos / Insumos Utilizados</label>
            {repuestos.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  style={{ ...styles.input, flex: 3 }} 
                  placeholder="Descripción del repuesto" 
                  value={r.descripcion} 
                  onChange={e => { 
                    const n = [...repuestos]; 
                    n[i].descripcion = e.target.value; 
                    setRepuestos(n); 
                  }} 
                />
                <input 
                  style={{ ...styles.input, flex: 1 }} 
                  type="number" 
                  value={r.cantidad} 
                  onChange={e => { 
                    const n = [...repuestos]; 
                    n[i].cantidad = e.target.value; 
                    setRepuestos(n); 
                  }} 
                />
                <button 
                  type="button" 
                  onClick={() => setRepuestos(repuestos.filter((_, idx) => idx !== i))} 
                  style={styles.btnDel}
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
            <button type="button" onClick={agregarRepuesto} style={styles.btnAdd}>
              <Plus size={14}/> Agregar Repuesto
            </button>
          </div>

          <button type="submit" style={styles.btnSubmit}>
            <Save size={20}/> GUARDAR ORDEN DE TRABAJO
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#1e293b' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px', marginBottom: '20px', fontSize: '14px' },
  sectionRepuestos: { background: '#f1f5f9', padding: '15px', borderRadius: '10px', marginBottom: '20px' },
  btnAdd: { background: 'white', border: '1px dashed #64748b', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '500' },
  btnSubmit: { width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' },
  btnDel: { background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};

export default OrdenesTrabajo;