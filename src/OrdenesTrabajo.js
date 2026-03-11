import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, FileText, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdenesTrabajo = () => {
  // Reemplaza con tu Base64 real del logo para los reportes
  const LOGO_ALPHA = "data:image/png;base64,..."; 

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
    if (!form.vehiculoId) return alert("Por favor seleccione un vehículo");
    
    setLoading(true);

    // Mapeo alineado a la Entidad y el Service del Backend
    const payload = {
      falla: form.descripcion_falla.trim(),
      tareas: "PENDIENTE DE REVISIÓN", // Estado inicial
      kilometraje: Number(form.kilometraje),
      responsable: form.responsable.trim().toUpperCase(),
      repuestos: {}, // Inicializado para JSONB
      vehiculoId: Number(form.vehiculoId)
    };

    try {
      await api.post('/api/ordenes-trabajo', payload);
      alert("✅ ORDEN DE TRABAJO REGISTRADA CORRECTAMENTE");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) {
      console.error("Error al guardar:", err.response?.data);
      alert("Error al guardar la OT. Verifique los datos e intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    const patente = ot.vehiculo?.patente || 'S-P';
    
    // --- ENCABEZADO CORPORATIVO ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 45, 'F');
    
    try {
      doc.addImage(LOGO_ALPHA, 'PNG', 15, 8, 50, 25);
    } catch (e) { /* Logo fallback */ }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE TRABAJO", 200, 22, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("ALPHA QUÍMICA S.R.L.", 200, 30, { align: 'right' });
    doc.text(`NRO INTERNO: OT-${String(ot.id).padStart(5, '0')}`, 200, 35, { align: 'right' });

    // --- INFORMACIÓN DE LA UNIDAD ---
    autoTable(doc, {
      startY: 55,
      head: [['DATOS DEL VEHÍCULO', 'DETALLES TÉCNICOS']],
      body: [
        ['PATENTE / DOMINIO', patente.toUpperCase()],
        ['MODELO / UNIDAD', (ot.vehiculo?.modelo || 'N/A').toUpperCase()],
        ['KILOMETRAJE AL INGRESO', `${ot.kilometraje.toLocaleString()} KM`],
        ['RESPONSABLE DE UNIDAD', ot.responsable.toUpperCase()],
        ['FECHA DE APERTURA', new Date(ot.fecha).toLocaleString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 9 }
    });

    // --- DETALLE DE LA FALLA ---
    const currentY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN DE LA FALLA O MOTIVO DE INGRESO:", 14, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitFalla = doc.splitTextToSize(ot.descripcion_falla || "Sin descripción", 180);
    doc.text(splitFalla, 14, currentY + 10);

    // --- SECCIÓN DE TALLER (PARA COMPLETAR A MANO) ---
    const tallerY = currentY + 40;
    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, tallerY, 182, 60, 'F');
    doc.rect(14, tallerY, 182, 60, 'S');
    
    doc.setFont("helvetica", "bold");
    doc.text("ESPACIO EXCLUSIVO TALLER (Tareas Realizadas y Repuestos):", 18, tallerY + 8);
    
    // --- PIE DE PÁGINA / FIRMAS ---
    doc.line(30, 260, 85, 260);
    doc.line(125, 260, 180, 260);
    doc.setFontSize(8);
    doc.text("FIRMA RESPONSABLE UNIDAD", 57, 265, { align: 'center' });
    doc.text("FIRMA JEFE DE TALLER", 152, 265, { align: 'center' });

    doc.save(`OT_${patente}_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <div style={styles.iconCircle}><Wrench size={24} color="white" /></div>
          <div>
            <h2 style={styles.title}>Gestión de Mantenimiento</h2>
            <p style={styles.subtitle}>Apertura de Orden de Trabajo - Flota Vehicular</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><ClipboardList size={14}/> Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">-- Seleccionar Unidad --</option>
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
              placeholder="KM de la unidad"
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
              placeholder="Quién entrega la unidad"
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          <div style={{...styles.inputGroup, flex: '1 1 100%'}}>
            <label style={styles.label}><FileText size={14}/> Detalle de la Falla / Pedido</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema, ruidos o mantenimiento preventivo solicitado..."
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> REGISTRAR APERTURA DE OT</>}
          </button>
        </form>

        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Órdenes Recientes</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>OT #</th>
                  <th style={styles.th}>FECHA</th>
                  <th style={styles.th}>VEHÍCULO</th>
                  <th style={styles.th}>RESPONSABLE</th>
                  <th style={{...styles.th, textAlign: 'center'}}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.length > 0 ? [...ordenes].reverse().map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}><strong>{String(ot.id).padStart(4, '0')}</strong></td>
                    <td style={styles.td}>{new Date(ot.fecha).toLocaleDateString()}</td>
                    <td style={styles.td}>{ot.vehiculo?.patente || 'S/P'}</td>
                    <td style={styles.td}>{ot.responsable}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button onClick={() => descargarOT(ot)} style={styles.btnPdf}>
                        <Download size={14} /> Imprimir
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={styles.emptyMsg}>No hay órdenes pendientes</td></tr>
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
  container: { padding: '30px 15px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '35px', maxWidth: '1100px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
  headerArea: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' },
  iconCircle: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  title: { fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '15px', color: '#64748b', margin: 0 },
  formGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px', backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '40px' },
  inputGroup: { flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' },
  input: { padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'all 0.2s', focusBorderColor: '#0f172a' },
  textarea: { padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' },
  btnSubmit: { width: '100%', backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', transition: 'background 0.3s' },
  tableSection: { marginTop: '10px' },
  tableTitle: { fontSize: '19px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #f1f5f9', hover: { backgroundColor: '#f8fafc' } },
  td: { padding: '15px', fontSize: '14px', color: '#334155' },
  btnPdf: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' },
  emptyMsg: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }
};

export default OrdenesTrabajo;