import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    descripcion_falla: '', 
    kilometraje: '', 
    responsable: '',
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

    // 🛠️ CAMBIO CLAVE: Estructura de relación de TypeORM
    // Muchos Backend de NestJS no aceptan "vehiculoId", 
    // sino un objeto "vehiculo" con el ID dentro.
    const payload = {
      // 1. La descripción (intentamos ambos nombres otra vez)
      descripcion_falla: form.descripcion_falla,
      descripcion: form.descripcion_falla,

      // 2. La Relación (Esto suele ser el motivo del Error 500)
      vehiculo: { id: parseInt(form.vehiculoId) }, 
      
      // 3. Campos obligatorios segun log de Render
      kilometraje: parseInt(form.kilometraje),
      responsable: form.responsable,
      tipo: form.tipo,
      costo_estimado: parseFloat(form.costo_estimado) || 0,
      
      // 4. Valores por defecto para evitar el "DEFAULT" de PostgreSQL
      tareas_realizadas: "Pendiente",
      repuestos_utilizados: "Ninguno",
      fecha: new Date().toISOString()
    };

    console.log("Enviando Payload Estructurado:", payload);

    try {
      await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ ¡ORDEN CREADA EXITOSAMENTE!");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '', costo_estimado: '', tipo: 'Preventivo' });
      fetchDatos();
    } catch (err) { 
      console.error("Respuesta fallida del servidor:", err.response?.data);
      alert(`Error 500: Revisa si el nombre en el Backend es 'descripcion' o 'descripcion_falla'`); 
    }
  };

  // --- El resto del componente (descargarOT y return) se mantiene igual que la versión anterior ---
  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    doc.autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: [
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable],
        ['KM', ot.kilometraje],
        ['Falla', ot.descripcion_falla || ot.descripcion],
      ],
    });
    doc.save(`OT_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Nueva Orden de Trabajo</h2>
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo</label>
            <select style={styles.input} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Descripción de la Falla</label>
            <textarea style={styles.textarea} value={form.descripcion_falla} onChange={e => setForm({...form, descripcion_falla: e.target.value})} required />
          </div>
          <button type="submit" style={styles.btnSave}><Plus size={18}/> ABRIR ORDEN</button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>FECHA</th>
                <th>VEHÍCULO</th>
                <th>RESPONSABLE</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(ot => (
                <tr key={ot.id} style={styles.tdRow}>
                  <td style={styles.td}>{new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}>{ot.vehiculo?.patente}</td>
                  <td style={styles.td}>{ot.responsable}</td>
                  <td style={styles.td}><button onClick={() => descargarOT(ot)} style={styles.btnIcon}><Download size={16} /></button></td>
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
  card: { background: 'white', borderRadius: '12px', padding: '25px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', background: '#f1f5f9', padding: '15px', borderRadius: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  textarea: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 5px' },
  btnIcon: { border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }
};

export default OrdenesTrabajo;