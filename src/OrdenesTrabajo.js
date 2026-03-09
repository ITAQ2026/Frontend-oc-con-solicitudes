import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    descripcion_falla: '', 
    kilometraje: '', 
    responsable: '' 
  });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resOt, resVeh] = await Promise.all([
        api.get('/api/ordenes-trabajo'),
        api.get('/api/vehiculos')
      ]);
      setOrdenes(resOt.data || []);
      setVehiculos(resVeh.data || []);
    } catch (err) { console.error("Error cargando datos:", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚀 MAPEO SEGÚN TU SERVICE.TS
    const payload = {
      falla: form.descripcion_falla.trim(), // Tu Service busca .falla
      tareas: "Pendiente",                  // Tu Service busca .tareas
      kilometraje: Number(form.kilometraje),// Tu Service busca .kilometraje
      responsable: form.responsable.trim(), // Tu Service busca .responsable
      repuestos: {},                        // Tu Service busca .repuestos (JSONB)
      vehiculoId: Number(form.vehiculoId)   // Tu Service busca .vehiculoId
    };

    console.log("📤 Enviando Payload compatible con el Service:", payload);

    try {
      const res = await api.post('/api/ordenes-trabajo', payload);
      alert("✅ ¡ÉXITO! La orden se creó correctamente.");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) {
      console.error("❌ Error persistente:", err.response?.data);
      alert("Error 500: Revisa la consola.");
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.text("ORDEN DE TRABAJO", 105, 20, { align: 'center' });
    doc.autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: [
        ['ID', `#${ot.id}`],
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable],
        ['KM', ot.kilometraje],
        ['Falla', ot.descripcion_falla]
      ]
    });
    doc.save(`OT_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench /> Gestión de Órdenes</h2>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehículo</label>
            <select style={styles.input} value={form.vehiculoId} onChange={e => setForm({...form, vehiculoId: e.target.value})} required>
              <option value="">Seleccionar...</option>
              {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kilometraje</label>
            <input style={styles.input} type="number" value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Responsable</label>
            <input style={styles.input} type="text" value={form.responsable} onChange={e => setForm({...form, responsable: e.target.value})} required />
          </div>
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Falla Reportada</label>
            <textarea style={styles.textarea} value={form.descripcion_falla} onChange={e => setForm({...form, descripcion_falla: e.target.value})} required />
          </div>
          <button type="submit" style={styles.btnSave}>REGISTRAR ORDEN</button>
        </form>

        <table style={styles.table}>
          <thead>
            <tr><th>FECHA</th><th>UNIDAD</th><th>RESPONSABLE</th><th>PDF</th></tr>
          </thead>
          <tbody>
            {ordenes.map(ot => (
              <tr key={ot.id}>
                <td>{new Date(ot.fecha).toLocaleDateString()}</td>
                <td>{ot.vehiculo?.patente}</td>
                <td>{ot.responsable}</td>
                <td><button onClick={() => descargarOT(ot)}><Download size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#f1f5f9' },
  card: { background: 'white', borderRadius: '12px', padding: '25px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', gap: '10px', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#64748b' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' },
  textarea: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '60px' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', padding: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none' },
  table: { width: '100%', marginTop: '20px', borderCollapse: 'collapse' }
};

export default OrdenesTrabajo;