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
    responsable: '',
    tipo: 'Preventivo',
    costo_estimado: ''
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
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔬 PRUEBA FINAL: Usamos nombres planos (SNAKE_CASE)
    // Coincidiendo exactamente con lo que el error de SQL mostró.
    const payload = {
      descripcion_falla: form.descripcion_falla.trim(),
      kilometraje: parseInt(form.kilometraje),
      responsable: form.responsable.trim(),
      tipo: form.tipo,
      costo_estimado: parseFloat(form.costo_estimado) || 0,
      
      // Enviamos el ID directo como "vehiculoId" (como decía el query de Render)
      vehiculoId: parseInt(form.vehiculoId),
      
      // Forzamos valores para evitar el "DEFAULT" que causa el error 500
      tareas_realizadas: "PENDIENTE",
      repuestos_utilizados: "NINGUNO",
      fecha: new Date().toISOString()
    };

    console.log("🚀 Enviando Payload Plano:", payload);

    try {
      const response = await api.post('/api/ordenes-trabajo', payload); 
      console.log("✅ ÉXITO:", response.data);
      alert("✅ ¡ORDEN CREADA!");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '', tipo: 'Preventivo', costo_estimado: '' });
      fetchDatos();
    } catch (err) { 
      console.error("❌ Error persistente:", err.response?.data);
      alert("Error 500: El servidor sigue rechazando los datos. El problema está en el DTO del Backend."); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("ORDEN DE TRABAJO - CONTROL DE FLOTA", 105, 28, { align: 'center' });
    
    doc.autoTable({
      startY: 35,
      head: [['Campo', 'Detalle']],
      body: [
        ['ID Orden', `#${ot.id}`],
        ['Fecha', new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()],
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable],
        ['Kilometraje', `${ot.kilometraje} KM`],
        ['Tipo', ot.tipo],
        ['Estado', ot.tareas_realizadas || 'Pendiente']
      ],
      theme: 'grid'
    });

    doc.setFont("helvetica", "bold");
    doc.text("Descripción del Problema:", 14, doc.lastAutoTable.finalY + 10);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(ot.descripcion_falla || "Sin descripción", 180);
    doc.text(splitText, 14, doc.lastAutoTable.finalY + 17);

    doc.save(`OT_${ot.id}_${ot.vehiculo?.patente || 'unid'}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} color="#1e293b" /> Gestión de Órdenes de Trabajo</h2>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          {/* Selección de Vehículo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehículo / Unidad</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">Seleccionar unidad...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Mantenimiento */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Servicio</label>
            <select 
              style={styles.input} 
              value={form.tipo} 
              onChange={e => setForm({...form, tipo: e.target.value})}
            >
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>

          {/* Kilometraje */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={12}/> Kilometraje Actual</label>
            <input 
              style={styles.input} 
              type="number" 
              value={form.kilometraje} 
              onChange={e => setForm({...form, kilometraje: e.target.value})} 
              required
            />
          </div>

          {/* Responsable */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={12}/> Responsable de Unidad</label>
            <input 
              style={styles.input} 
              type="text" 
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required
            />
          </div>

          {/* Descripción */}
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}><FileText size={12}/> Descripción Detallada de la Falla</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Ej: Ruidos en el tren delantero, pérdida de aceite..." 
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSave}>
            <Plus size={18}/> REGISTRAR NUEVA ORDEN
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>FECHA</th>
                <th>VEHÍCULO</th>
                <th>RESPONSABLE</th>
                <th>TIPO</th>
                <th style={{textAlign: 'center'}}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(ot => (
                <tr key={ot.id} style={styles.tdRow}>
                  <td style={styles.td}>{new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}><strong>{ot.vehiculo?.patente}</strong></td>
                  <td style={styles.td}>{ot.responsable}</td>
                  <td style={styles.td}>{ot.tipo}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
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
  container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#0f172a' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '35px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 5px', fontSize: '14px' },
  btnIcon: { background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', color: '#475569' }
};

export default OrdenesTrabajo;