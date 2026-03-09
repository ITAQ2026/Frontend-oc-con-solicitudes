import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, FileText, Loader2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    descripcion_falla: '', 
    kilometraje: '', 
    responsable: ''
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
    setLoading(true);

    // 🚀 MAPEADO SEGÚN TU ordenes-trabajo.service.ts
    // El backend busca: data.falla, data.tareas, data.kilometraje, data.responsable, data.repuestos, data.vehiculoId
    const payload = {
      falla: form.descripcion_falla.trim(),
      tareas: "Pendiente de revisión",
      kilometraje: Number(form.kilometraje),
      responsable: form.responsable.trim(),
      repuestos: {}, // Objeto vacío para JSONB
      vehiculoId: Number(form.vehiculoId)
    };

    try {
      await api.post('/api/ordenes-trabajo', payload);
      alert("✅ ¡ORDEN DE TRABAJO CREADA!");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) {
      console.error("Error al guardar:", err.response?.data);
      alert("Error 500: Revisa la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    
    // Encabezado Estilizado
    doc.setFillColor(15, 23, 42); // Azul oscuro
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text("SISTEMA DE GESTIÓN LOGÍSTICA - ORDEN DE TRABAJO", 105, 30, { align: 'center' });

    // Tabla de Datos
    autoTable(doc, {
      startY: 50,
      head: [['Descripción', 'Información Detallada']],
      body: [
        ['Nro. de Orden', `#${ot.id}`],
        ['Fecha de Apertura', new Date(ot.fecha).toLocaleDateString()],
        ['Vehículo / Patente', ot.vehiculo?.patente || 'N/A'],
        ['Modelo de Unidad', ot.vehiculo?.modelo || 'N/A'],
        ['Kilometraje Reportado', `${ot.kilometraje} KM`],
        ['Responsable', ot.responsable],
        ['Estado Actual', ot.tareas_realizadas || 'Pendiente']
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 10, cellPadding: 4 }
    });

    // Cuadro de Falla
    const finalY = doc.lastAutoTable.finalY;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LA FALLA REPORTADA:", 14, finalY + 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const textLines = doc.splitTextToSize(ot.descripcion_falla || "Sin descripción detallada", 180);
    doc.text(textLines, 14, finalY + 25);

    // Pie de página / Firma
    doc.setDrawColor(200, 200, 200);
    doc.line(60, 260, 150, 260);
    doc.setFontSize(9);
    doc.text("Firma y Aclaración del Responsable", 105, 265, { align: 'center' });

    doc.save(`OT_${ot.id}_${ot.vehiculo?.patente || 'UNIDAD'}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <div style={styles.iconCircle}><Wrench size={24} color="white" /></div>
          <div>
            <h2 style={styles.title}>Mantenimiento de Flota</h2>
            <p style={styles.subtitle}>Registro de Órdenes de Trabajo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Seleccionar Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">-- Buscar Patente --</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} ({v.modelo})</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={14}/> Kilometraje</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Ej: 125000"
              value={form.kilometraje} 
              onChange={e => setForm({...form, kilometraje: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={14}/> Responsable</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Nombre del chofer/mecánico"
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}><FileText size={14}/> Descripción de la Falla</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema detectado en la unidad..."
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> GENERAR ORDEN</>}
          </button>
        </form>

        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Historial de Reparaciones</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th>ID</th>
                  <th>FECHA</th>
                  <th>VEHÍCULO</th>
                  <th>RESPONSABLE</th>
                  <th style={{textAlign: 'center'}}>DOCUMENTO</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.length > 0 ? ordenes.map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}>#{ot.id}</td>
                    <td style={styles.td}>{new Date(ot.fecha).toLocaleDateString()}</td>
                    <td style={styles.td}><strong>{ot.vehiculo?.patente || 'S/P'}</strong></td>
                    <td style={styles.td}>{ot.responsable}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button onClick={() => descargarOT(ot)} style={styles.btnPdf}>
                        <Download size={16} /> Descargar
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No hay órdenes registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  headerArea: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  iconCircle: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f1f5f9', padding: '25px', borderRadius: '12px', marginBottom: '40px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outlineColor: '#0f172a' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', minHeight: '100px', fontFamily: 'inherit' },
  btnSubmit: { gridColumn: 'span 2', backgroundColor: '#0f172a', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px' },
  tableSection: { marginTop: '20px' },
  tableTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
  thRow: { textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px' },
  tdRow: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
  td: { padding: '14px 10px', fontSize: '14px', color: '#334155' },
  btnPdf: { backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }
};

export default OrdenesTrabajo;