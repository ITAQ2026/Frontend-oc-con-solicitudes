import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    descripcion_falla: '', 
    costo_estimado: '', 
    tipo: 'Preventivo' 
  });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resOt, resVeh] = await Promise.all([
        api.get('/api/ordenes-trabajo'),
        api.get('/api/vehiculos')
      ]);
      setOrdenes(resOt.data || []);
      setVehiculos(resVeh.data || []);
    } catch (err) { console.error("Error cargando datos", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 REVISIÓN TOTAL DEL PAYLOAD
    // Forzamos manualmente que los nombres coincidan con lo que pide la DB en el log
    const payload = {
      descripcion_falla: String(form.descripcion_falla).trim(), // <--- ESTO ES LO QUE FALLABA
      tareas_realizadas: "Pendiente de inicio",
      repuestos_utilizados: "Ninguno",
      kilometraje: 0,
      responsable: "M. Moreno",
      tipo: form.tipo,
      costo_estimado: parseFloat(form.costo_estimado) || 0,
      vehiculoId: parseInt(form.vehiculoId),
      fecha: new Date().toISOString()
    };

    console.log("DATOS QUE SALEN DEL FRONTEND:", payload);

    try {
      // ✅ Usamos directamente el objeto 'payload'
      await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ Orden de Trabajo creada con éxito");
      setForm({ vehiculoId: '', descripcion_falla: '', costo_estimado: '', tipo: 'Preventivo' });
      fetchDatos();
    } catch (err) { 
      console.error("ERROR DETALLADO AXIOS:", err.response?.data);
      alert("❌ Error 500: La base de datos sigue rechazando el campo descripcion_falla."); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.text("ALPHA QUÍMICA S.A. - ORDEN DE TRABAJO", 105, 20, { align: 'center' });
    doc.autoTable({
      startY: 30,
      head: [['Campo', 'Detalle']],
      body: [
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Tipo', ot.tipo],
        ['Falla Reportada', ot.descripcion_falla || 'No descrita'],
        ['Costo Est.', `$${ot.costo_estimado}`]
      ],
    });
    doc.save(`OT_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Gestión de Órdenes (Logística)</h2>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">Seleccionar...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo</label>
            <select 
              style={styles.input} 
              value={form.tipo} 
              onChange={e => setForm({...form, tipo: e.target.value})}
            >
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Costo Estimado</label>
            <input 
              style={styles.input} 
              type="number" 
              value={form.costo_estimado} 
              onChange={e => setForm({...form, costo_estimado: e.target.value})} 
            />
          </div>

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Descripción de la Falla</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Ej: El camión pierde aceite..." 
              required
              // ✅ Vínculo directo al estado corregido
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
            />
          </div>

          <button type="submit" style={styles.btnSave}>
            <Plus size={18}/> CREAR ORDEN
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>FECHA</th>
                <th>PATENTE</th>
                <th>TIPO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(ot => (
                <tr key={ot.id} style={styles.tdRow}>
                  <td style={styles.td}>{new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}><strong>{ot.vehiculo?.patente}</strong></td>
                  <td style={styles.td}>{ot.tipo}</td>
                  <td style={styles.td}>
                    <button onClick={() => descargarOT(ot)} style={styles.btnIcon}>
                      <Download size={16} />
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
  container: { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '12px', padding: '25px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', background: '#f1f5f9', padding: '20px', borderRadius: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#475569' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  textarea: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px' },
  btnSave: { gridColumn: 'span 2', background: '#1e293b', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 5px' },
  btnIcon: { background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }
};

export default OrdenesTrabajo;