import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Gauge, User, FileText, Loader2, ClipboardList, Download } from 'lucide-react';
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
      setOrdenes(resOt.data?.sort((a, b) => b.id - a.id) || []);
      setVehiculos(resVeh.data || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehiculoId) return alert("Seleccione un vehículo");
    setLoading(true);

    // IMPORTANTE: Mapeamos 'descripcion_falla' del form a 'falla' para el Backend
    const payload = {
      falla: form.descripcion_falla.trim().toUpperCase(),
      tareas: "PENDIENTE DE REVISIÓN",
      kilometraje: Number(form.kilometraje),
      responsable: form.responsable.trim().toUpperCase(),
      repuestos: [], 
      vehiculoId: Number(form.vehiculoId)
    };

    try {
      await api.post('/api/ordenes-trabajo', payload);
      alert("✅ Orden de Trabajo registrada con éxito");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) {
      alert(err.message || "Error al guardar la OT");
    } finally {
      setLoading(false);
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    const lightBlue = [224, 242, 254]; 
    const textColor = [0, 0, 0];      
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Fondo del Encabezado
    doc.setFillColor(...lightBlue);
    doc.rect(0, 0, pageWidth, 45, 'F'); 

    // Texto Encabezado Izquierda
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ALPHA QUÍMICA S.R.L.", margin, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Mantenimiento de Flota y Logística", margin, 28);
    doc.text("CUIT: 30-60968636-3", margin, 33);
    doc.text("Av Brigadier Gral San Martin 235 - Villa María, Cba.", margin, 38);

    // Texto Encabezado Derecha
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE TRABAJO", pageWidth - margin, 25, { align: 'right' });
    doc.setFontSize(14);
    doc.text(` OT-${String(ot.id).padStart(5, '0')}`, pageWidth - margin, 35, { align: 'right' });

    let currentY = 55;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA UNIDAD", margin, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha Emisión: ${new Date(ot.createdAt || Date.now()).toLocaleDateString('es-AR')}`, margin, currentY + 7);
    doc.text(`Estado: ACTIVA / PENDIENTE`, pageWidth - margin, currentY + 7, { align: 'right' });

    // TABLA PRINCIPAL DEL PDF
    autoTable(doc, {
      startY: currentY + 12,
      head: [['ESPECIFICACIÓN', 'DETALLE']],
      body: [
        ['DOMINIO / PATENTE', (ot.vehiculo?.patente || 'N/A').toUpperCase()],
        ['VEHÍCULO', (ot.vehiculo?.modelo || 'N/A').toUpperCase()],
        ['KILOMETRAJE', `${Number(ot.kilometraje).toLocaleString()} KM`],
        ['CHOFER / RESPONSABLE', (ot.responsable || 'N/A').toUpperCase()],
        ['DESCRIPCIÓN DE FALLA', (ot.falla || 'MANTENIMIENTO GENERAL').toUpperCase()],
      ],
      theme: 'grid',
      headStyles: { fillColor: lightBlue, textColor: textColor, fontStyle: 'bold' },
      styles: { cellPadding: 5, fontSize: 10, textColor: textColor },
      columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold', fillColor: [250, 250, 250] } }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Espacio para el Taller
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("INFORME TÉCNICO DE REPARACIÓN (Uso exclusivo Taller)", margin + 5, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.text("TAREAS REALIZADAS / DIAGNÓSTICO FINAL:", margin, currentY + 20);
    
    doc.setDrawColor(180, 180, 180);
    for (let i = 0; i < 6; i++) {
      doc.line(margin, currentY + 28 + (i * 10), pageWidth - margin, currentY + 28 + (i * 10));
    }

    // Firmas al pie
    const footerY = 265;
    doc.setDrawColor(0);
    doc.line(margin + 10, footerY, margin + 70, footerY); 
    doc.line(pageWidth - margin - 70, footerY, pageWidth - margin - 10, footerY);
    
    doc.setFontSize(8);
    doc.text("FIRMA Y ACLARACIÓN CHOFER", margin + 40, footerY + 5, { align: 'center' });
    doc.text("RESPONSABLE DE TALLER", pageWidth - margin - 40, footerY + 5, { align: 'center' });

    doc.save(`OT_${ot.vehiculo?.patente || 'S_P'}_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <div style={styles.iconCircle}><Wrench size={24} color="white" /></div>
          <div>
            <h2 style={styles.title}>Alpha Química - Mantenimiento</h2>
            <p style={styles.subtitle}>Gestión de Órdenes de Trabajo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><ClipboardList size={14}/> Unidad / Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">Seleccione vehículo...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={14}/> Kilometraje Actual</label>
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
            <label style={styles.label}><User size={14}/> Responsable / Chofer</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Nombre completo"
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.fullWidthGroup}>
            <label style={styles.label}><FileText size={14}/> Descripción de la Falla / Pedido</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema detalladamente..."
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "REGISTRAR APERTURA DE OT"}
          </button>
        </form>

        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Historial de Órdenes</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>OT #</th>
                  <th style={styles.th}>Patente</th>
                  <th style={styles.th}>Responsable</th>
                  <th style={styles.th}>Falla</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.length > 0 ? ordenes.map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}><b>{String(ot.id).padStart(4, '0')}</b></td>
                    <td style={styles.td}>{ot.vehiculo?.patente || 'N/A'}</td>
                    <td style={styles.td}>{ot.responsable}</td>
                    <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ot.falla}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => descargarOT(ot)} style={styles.btnPdf}>
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>No hay órdenes registradas.</td></tr>
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
  container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '1100px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', boxSizing: 'border-box' },
  headerArea: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  iconCircle: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px' },
  title: { fontSize: '24px', fontWeight: '800', margin: 0, color: '#0f172a' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  formGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px', backgroundColor: '#e0f2fe', padding: '25px', borderRadius: '12px', border: '1px solid #bae6fd' },
  inputGroup: { flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' },
  fullWidthGroup: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '5px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outlineColor: '#3b82f6' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontSize: '14px', resize: 'vertical' },
  btnSubmit: { width: '100%', backgroundColor: '#0f172a', color: 'white', padding: '15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none' },
  tableSection: { marginTop: '40px' },
  tableTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', textAlign: 'left', backgroundColor: '#f1f5f9', fontSize: '12px', color: '#475569', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px', fontSize: '14px', color: '#1e293b' },
  btnPdf: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', color: '#0f172a' }
};

export default OrdenesTrabajo;