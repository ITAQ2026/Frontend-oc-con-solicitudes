import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  
  // ✅ Estado inicial con TODOS los campos que la base de datos exige (NOT NULL)
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
    } catch (err) { 
      console.error("Error cargando datos:", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛠️ Construcción del objeto exactamente como lo espera NestJS + TypeORM
    const payload = {
      vehiculoId: parseInt(form.vehiculoId),
      descripcion_falla: form.descripcion_falla.trim(),
      kilometraje: parseInt(form.kilometraje) || 0,
      responsable: form.responsable.trim(),
      tipo: form.tipo,
      costo_estimado: parseFloat(form.costo_estimado) || 0,
      // Campos técnicos que el backend pide pero el form no edita aún
      tareas_realizadas: "Pendiente",
      repuestos_utilizados: "Ninguno",
      fecha: new Date().toISOString()
    };

    console.log("🚀 Enviando Payload:", payload);

    try {
      await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ Orden de Trabajo creada con éxito");
      
      // Reiniciar formulario
      setForm({ 
        vehiculoId: '', 
        descripcion_falla: '', 
        kilometraje: '', 
        responsable: '',
        costo_estimado: '', 
        tipo: 'Preventivo' 
      });
      fetchDatos();
    } catch (err) { 
      console.error("❌ Error 500 detectado:", err.response?.data);
      alert(`Error al guardar: ${err.response?.data?.message || "Faltan campos obligatorios"}`); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("ORDEN DE TRABAJO Y MANTENIMIENTO", 105, 30, { align: 'center' });
    
    doc.autoTable({
      startY: 40,
      head: [['Campo', 'Información']],
      body: [
        ['OT Número', `#OT-00${ot.id}`],
        ['Fecha', new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()],
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable || 'M. Moreno'],
        ['Kilometraje', `${ot.kilometraje} KM`],
        ['Tipo', ot.tipo],
        ['Costo Est.', `$${ot.costo_estimado}`],
      ],
      theme: 'striped'
    });

    doc.setFont("helvetica", "bold");
    doc.text("Descripción de la Falla:", 20, doc.lastAutoTable.finalY + 10);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(ot.descripcion_falla || "Sin descripción", 170);
    doc.text(splitText, 20, doc.lastAutoTable.finalY + 17);

    doc.save(`OT_${ot.id}_${ot.vehiculo?.patente}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Mantenimiento Moreno</h2>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          {/* Vehículo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">Seleccionar Unidad...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo</label>
            <select 
              style={styles.input} 
              value={form.tipo} 
              onChange={e => setForm({...form, tipo: e.target.value})}
            >
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          {/* Kilometraje */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={12}/> Kilometraje</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="KM del camión" 
              value={form.kilometraje} 
              onChange={e => setForm({...form, kilometraje: e.target.value})} 
              required
            />
          </div>

          {/* Responsable */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={12}/> Responsable</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Chofer / Mecánico" 
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required
            />
          </div>

          {/* Costo */}
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Presupuesto Estimado ($)</label>
            <input 
              style={styles.input} 
              type="number" 
              value={form.costo_estimado} 
              onChange={e => setForm({...form, costo_estimado: e.target.value})} 
            />
          </div>

          {/* Falla */}
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Descripción de la Falla</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema reportado..." 
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSave}>
            <Plus size={18}/> ABRIR ORDEN DE TRABAJO
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>FECHA</th>
                <th>VEHÍCULO</th>
                <th>TIPO</th>
                <th>RESPONSABLE</th>
                <th style={{ textAlign: 'center' }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(ot => (
                <tr key={ot.id} style={styles.tdRow}>
                  <td style={styles.td}>{new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}><strong>{ot.vehiculo?.patente || 'N/A'}</strong></td>
                  <td style={styles.td}>{ot.tipo}</td>
                  <td style={styles.td}>{ot.responsable}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
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
  card: { background: 'white', borderRadius: '12px', padding: '25px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#1e293b' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px', background: '#f1f5f9', padding: '20px', borderRadius: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  textarea: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '60px', fontFamily: 'inherit' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 5px', fontSize: '14px' },
  btnIcon: { background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: '6px', borderRadius: '4px' }
};

export default OrdenesTrabajo;