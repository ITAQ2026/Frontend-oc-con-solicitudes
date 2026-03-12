import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, FileText, Loader2, ClipboardList } from 'lucide-react';
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
    if (!form.vehiculoId) return alert("Seleccione un vehículo");
    setLoading(true);

    const payload = {
      falla: form.descripcion_falla.trim(),
      tareas: "PENDIENTE",
      kilometraje: Number(form.kilometraje),
      responsable: form.responsable.trim().toUpperCase(),
      repuestos: {},
      vehiculoId: Number(form.vehiculoId)
    };

    try {
      await api.post('/api/ordenes-trabajo', payload);
      alert("✅ Orden registrada");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) {
      alert("Error al guardar la OT");
    } finally {
      setLoading(false);
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    const patente = ot.vehiculo?.patente || 'S-P';
    doc.setFontSize(18);
    doc.text("ORDEN DE TRABAJO - ALPHA QUÍMICA", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Detalle']],
      body: [
        ['OT #', String(ot.id).padStart(5, '0')],
        ['Vehículo', patente],
        ['KM', ot.kilometraje],
        ['Responsable', ot.responsable],
        ['Falla', ot.falla || ot.descripcion_falla]
      ],
    });
    doc.save(`OT_${patente}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <div style={styles.iconCircle}><Wrench size={24} color="white" /></div>
          <div>
            <h2 style={styles.title}>Gestión de Mantenimiento</h2>
            <p style={styles.subtitle}>Apertura de Orden de Trabajo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          {/* USAMOS FLEX-BASIS PARA CONTROLAR EL ANCHO SIN DESBORDAR */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><ClipboardList size={14}/> Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">-- Seleccionar --</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={14}/> Kilometraje</label>
            <input 
              style={styles.input} 
              type="number" 
              value={form.kilometraje} 
              onChange={e => setForm({...form, kilometraje: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={14}/> Chofer</label>
            <input 
              style={styles.input} 
              type="text" 
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.fullWidthGroup}>
            <label style={styles.label}><FileText size={14}/> Detalle de la Falla</label>
            <textarea 
              style={styles.textarea} 
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "REGISTRAR APERTURA"}
          </button>
        </form>

        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Historial Reciente</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>OT</th>
                  <th style={styles.th}>Vehículo</th>
                  <th style={styles.th}>Chofer</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}>{ot.id}</td>
                    <td style={styles.td}>{ot.vehiculo?.patente}</td>
                    <td style={styles.td}>{ot.responsable}</td>
                    <td style={styles.td}>
                      <button onClick={() => descargarOT(ot)} style={styles.btnPdf}>PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    padding: '20px', 
    backgroundColor: '#f1f5f9', 
    minHeight: '100vh', 
    boxSizing: 'border-box' // Fundamental para que el padding no sume ancho
  },
  card: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: 'clamp(15px, 5%, 30px)', 
    maxWidth: '1000px', 
    margin: '0 auto', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    boxSizing: 'border-box',
    overflow: 'hidden' 
  },
  headerArea: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  iconCircle: { backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px' },
  title: { fontSize: '22px', fontWeight: '800', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  
  // FORMULARIO CORREGIDO
  formGrid: { 
    display: 'flex', 
    flexWrap: 'wrap', // Permite que los cuadros bajen si no hay espacio
    gap: '15px', 
    backgroundColor: '#f8fafc', 
    padding: '20px', 
    borderRadius: '12px',
    boxSizing: 'border-box',
    width: '100%' 
  },
  inputGroup: { 
    flex: '1 1 200px', // Crece y se achica, pero intenta medir 200px
    display: 'flex', 
    flexDirection: 'column', 
    gap: '5px',
    boxSizing: 'border-box' 
  },
  fullWidthGroup: { 
    flex: '1 1 100%', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '5px',
    boxSizing: 'border-box'
  },
  label: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569' },
  input: { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box' // Evita que el padding lo saque afuera
  },
  textarea: { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    minHeight: '80px',
    boxSizing: 'border-box'
  },
  btnSubmit: { 
    width: '100%', 
    backgroundColor: '#0f172a', 
    color: 'white', 
    padding: '12px', 
    borderRadius: '8px', 
    fontWeight: '700', 
    cursor: 'pointer',
    marginTop: '10px'
  },

  // TABLA CORREGIDA
  tableSection: { marginTop: '30px', width: '100%' },
  tableTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '15px' },
  tableWrapper: { 
    width: '100%', 
    overflowX: 'auto', // Scroll lateral solo si es necesario
    borderRadius: '8px', 
    border: '1px solid #e2e8f0' 
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
  th: { padding: '12px', textAlign: 'left', backgroundColor: '#f8fafc', fontSize: '12px', color: '#64748b' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '14px' },
  btnPdf: { padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', border: '1px solid #cbd5e1' }
};

export default OrdenesTrabajo;