import React, { useState, useEffect } from 'react';
import api from './api';
import { Receipt, Plus, Download, Loader2, DollarSign, User, FileText, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const res = await api.get('/api/recibos');
      // Ordenar por ID descendente para ver los últimos primero
      setRecibos(res.data?.sort((a, b) => b.id - a.id) || []);
    } catch (err) { 
      console.error("Error al cargar recibos", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Aseguramos que el monto sea enviado como número
      const payload = { ...form, monto: Number(form.monto) };
      await api.post('/api/recibos', payload);
      
      alert("✅ Recibo generado y registrado");
      setForm({ 
        emisor: 'Alpha Química S.A.', 
        receptor: '', 
        concepto: '', 
        monto: '', 
        condicion_pago: 'Transferencia' 
      });
      fetchRecibos();
    } catch (err) { 
      alert("❌ Error al procesar el recibo"); 
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = (r) => {
    const doc = new jsPDF();
    const primaryColor = [15, 23, 42]; // Slate-900

    // Banner Superior Estilo Alpha
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("COMPROBANTE DE PAGO NO VÁLIDO COMO FACTURA", 105, 30, { align: 'center' });

    // Encabezado de Datos
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`RECIBO DE CAJA #R-${String(r.id).padStart(5, '0')}`, 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Emisión: ${new Date(r.fecha).toLocaleDateString('es-AR')}`, 150, 55);

    // Tabla de Detalle
    autoTable(doc, {
      startY: 65,
      head: [['Concepto', 'Información']],
      body: [
        ['EMISOR / PAGADOR', r.emisor.toUpperCase()],
        ['RECEPTOR / BENEFICIARIO', r.receptor.toUpperCase()],
        ['MOTIVO DEL PAGO', r.concepto],
        ['MÉTODO UTILIZADO', r.condicion_pago.toUpperCase()],
        ['MONTO TOTAL', `$ ${Number(r.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // Cuadro de Cierre
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.rect(20, finalY, 170, 20, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`VALOR RECIBIDO: $ ${Number(r.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 105, finalY + 13, { align: 'center' });

    // Área de Firmas
    const firmaY = finalY + 50;
    doc.line(30, firmaY, 80, firmaY);
    doc.setFontSize(9);
    doc.text("Firma Autorizada", 55, firmaY + 5, { align: 'center' });
    
    doc.line(130, firmaY, 180, firmaY);
    doc.text("Aclaración Receptor", 155, firmaY + 5, { align: 'center' });

    doc.save(`Recibo_Alpha_${r.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <h2 style={styles.header}><Receipt size={28} color="#0f172a" /> Gestión de Recibos</h2>
          <span style={styles.subtitle}>Emisión de comprobantes de pago y movimientos de caja</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={13}/> Emisor (Pagador)</label>
            <input style={styles.input} value={form.emisor} onChange={e => setForm({...form, emisor: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={13}/> Receptor (Beneficiario)</label>
            <input style={styles.input} placeholder="Quién recibe el dinero" value={form.receptor} onChange={e => setForm({...form, receptor: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}><DollarSign size={13}/> Importe Total</label>
            <input style={styles.input} type="number" step="0.01" placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}><CreditCard size={13}/> Forma de Pago</label>
            <select style={styles.input} value={form.condicion_pago} onChange={e => setForm({...form, condicion_pago: e.target.value})}>
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo / Caja Chic</option>
              <option value="Cheque">Efectivización de Cheque</option>
            </select>
          </div>
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}><FileText size={13}/> Concepto Detallado</label>
            <textarea style={styles.textarea} placeholder="Ej: Pago de flete unidad Patente ABC-123..." value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} required />
          </div>
          <button type="submit" style={styles.btnSave} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> REGISTRAR Y GENERAR</>}
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <h3 style={styles.tableTitle}>Historial de Comprobantes</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>RECIBO</th>
                <th style={styles.th}>FECHA</th>
                <th style={styles.th}>BENEFICIARIO</th>
                <th style={styles.th}>MONTO</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {recibos.length > 0 ? recibos.map(r => (
                <tr key={r.id} style={styles.tdRow}>
                  <td style={styles.td}># {String(r.id).padStart(4, '0')}</td>
                  <td style={styles.td}>{new Date(r.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}>{r.receptor}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#15803d'}}>
                    $ {Number(r.monto).toLocaleString('es-AR')}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button onClick={() => descargarPDF(r)} style={styles.btnIcon}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={styles.empty}>No hay registros de caja disponibles.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 15px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '20px', padding: '35px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  headerContainer: { marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', color: '#0f172a', margin: 0, fontWeight: '800' },
  subtitle: { fontSize: '14px', color: '#64748b', marginLeft: '43px', display: 'block' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px', background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', transition: '0.2s', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.2s' },
  tableWrapper: { marginTop: '20px' },
  tableTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
  td: { padding: '14px 12px', fontSize: '14px', color: '#334155' },
  btnIcon: { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' },
  empty: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }
};

export default Recibos;