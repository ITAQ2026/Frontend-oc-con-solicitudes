import React, { useState, useEffect } from 'react';
import api from './api';
import { Receipt, Plus, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [form, setForm] = useState({ 
    emisor: 'Alpha Química S.A.', 
    receptor: '', 
    concepto: '', 
    monto: '', 
    condicion_pago: 'Transferencia' 
  });

  useEffect(() => {
    fetchRecibos();
  }, []);

  const fetchRecibos = async () => {
    try {
      const res = await api.get('/recibos');
      setRecibos(res.data);
    } catch (err) {
      console.error("Error al cargar recibos:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recibos', form);
      alert("✅ Recibo generado exitosamente");
      setForm({ emisor: 'Alpha Química S.A.', receptor: '', concepto: '', monto: '', condicion_pago: 'Transferencia' });
      fetchRecibos();
    } catch (err) {
      alert("❌ Error al guardar el recibo");
    }
  };

  // --- FUNCIÓN PARA GENERAR EL PDF ---
  const descargarPDF = (r) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("Soluciones Químicas Industriales", 105, 27, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    // Título del documento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGO", 20, 45);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Número: #REC-00${r.id}`, 20, 52);
    doc.text(`Fecha: ${new Date(r.fecha).toLocaleDateString()}`, 150, 52);

    // Tabla de contenido
    doc.autoTable({
      startY: 60,
      head: [['Descripción', 'Detalle']],
      body: [
        ['Pagador / Emisor', r.emisor],
        ['Beneficiario', r.receptor],
        ['Concepto', r.concepto],
        ['Método de Pago', r.condicion_pago],
        ['Monto Total', `$${Number(r.monto).toLocaleString('es-AR')}`],
      ],
      headStyles: { fillColor: [30, 41, 59] },
      styles: { cellPadding: 5 }
    });

    // Pie de página con firmas
    const finalY = doc.lastAutoTable.finalY + 40;
    doc.line(30, finalY, 80, finalY);
    doc.text("Firma Entregué", 45, finalY + 5);
    
    doc.line(130, finalY, 180, finalY);
    doc.text("Firma Recibí", 145, finalY + 5);

    doc.save(`Recibo_Alpha_${r.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <h2 style={styles.header}><Receipt size={28} /> Administración: Recibos</h2>
          <span style={styles.subtitle}>Registro de ingresos y egresos de caja</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Pagador / Emisor</label>
            <input style={styles.input} value={form.emisor} onChange={e => setForm({...form, emisor: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Cobrador / Receptor</label>
            <input style={styles.input} placeholder="Nombre del beneficiario" value={form.receptor} onChange={e => setForm({...form, receptor: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Importe ($)</label>
            <input style={styles.input} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Condición</label>
            <select style={styles.input} value={form.condicion_pago} onChange={e => setForm({...form, condicion_pago: e.target.value})}>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Concepto del Pago</label>
            <textarea style={styles.textarea} placeholder="Detalle el motivo del pago..." value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} required />
          </div>
          <button type="submit" style={styles.btnSave}>
            <Plus size={18} /> GENERAR COMPROBANTE
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>NRO</th>
                <th>FECHA</th>
                <th>RECEPTOR</th>
                <th>MONTO</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map(r => (
                <tr key={r.id} style={styles.tdRow}>
                  <td style={styles.td}>#REC-{r.id}</td>
                  <td style={styles.td}>{new Date(r.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}>{r.receptor}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#16a34a'}}>
                    ${Number(r.monto).toLocaleString('es-AR')}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button 
                      onClick={() => descargarPDF(r)} 
                      style={styles.btnIcon}
                      title="Descargar PDF"
                    >
                      <Download size={18} />
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
  container: { padding: '40px 20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  headerContainer: { marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px', background: '#f8fafc', padding: '25px', borderRadius: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', height: '40px' },
  tdRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '15px 10px', fontSize: '14px', color: '#334155' },
  btnIcon: { background: '#e2e8f0', border: 'none', color: '#475569', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s' },
};

export default Recibos;