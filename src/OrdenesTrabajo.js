import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, ClipboardList, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  
  // ✅ CORRECCIÓN: El campo DEBE llamarse 'descripcion_falla' según el log de tu DB
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    descripcion_falla: '', 
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
      console.error("Error cargando datos", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Al enviar 'form', ahora incluimos 'descripcion_falla'
      await api.post('/api/ordenes-trabajo', form); 
      alert("✅ Orden de Trabajo creada con éxito");
      
      // Limpiar formulario con los nombres correctos
      setForm({ 
        vehiculoId: '', 
        descripcion_falla: '', 
        costo_estimado: '', 
        tipo: 'Preventivo' 
      });
      fetchDatos();
    } catch (err) { 
      console.error("Error al guardar:", err);
      alert("❌ Error 500: Verifique que todos los campos obligatorios estén completos"); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text("ORDEN DE TRABAJO Y MANTENIMIENTO", 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);

    // Info General
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`OT Número: #OT-00${ot.id}`, 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(ot.fecha_creacion || Date.now()).toLocaleDateString()}`, 150, 45);

    // Tabla de datos
    doc.autoTable({
      startY: 55,
      head: [['Información del Vehículo', 'Detalle']],
      body: [
        ['Patente', ot.vehiculo?.patente || 'No especificada'],
        ['Modelo / Marca', ot.vehiculo?.modelo || 'No especificado'],
        ['Tipo de Servicio', ot.tipo],
        ['Presupuesto Estimado', `$${Number(ot.costo_estimado || 0).toLocaleString('es-AR')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Descripción del Trabajo (Usando el nombre correcto de la columna)
    const currentY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN TÉCNICA / FALLA REPORTADA:", 20, currentY);
    
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize(ot.descripcion_falla || 'Sin descripción detallada.', 170);
    doc.text(splitDesc, 20, currentY + 7);

    doc.save(`OT_${ot.vehiculo?.patente || 'S-P'}_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Mantenimiento de Flota (Moreno)</h2>
        
        <form onSubmit={handleSubmit} style={styles.formGrid}>
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Servicio</label>
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

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Costo Estimado ($)</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Ej: 50000" 
              value={form.costo_estimado} 
              onChange={e => setForm({...form, costo_estimado: e.target.value})} 
            />
          </div>

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}>Descripción del Trabajo / Falla Reportada</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema detalladamente..." 
              // ✅ VINCULADO A descripcion_falla
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
                <th>ESTADO</th>
                <th style={{ textAlign: 'center' }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>No hay órdenes registradas.</td></tr>
              ) : (
                ordenes.map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}>{new Date(ot.fecha_creacion || ot.fecha).toLocaleDateString()}</td>
                    <td style={styles.td}><strong>{ot.vehiculo?.patente || 'N/A'}</strong></td>
                    <td style={styles.td}>{ot.tipo}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: ot.estado === 'Finalizado' ? '#dcfce7' : '#e0f2fe',
                        color: ot.estado === 'Finalizado' ? '#166534' : '#0369a1'
                      }}>
                        {ot.estado || 'Abierta'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button 
                        onClick={() => descargarOT(ot)} 
                        style={styles.btnIcon}
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#0f172a' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '35px', padding: '20px', background: '#f1f5f9', borderRadius: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit', outline: 'none' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', paddingBottom: '10px' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px 5px', fontSize: '14px', color: '#334155' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  btnIcon: { background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: 'all 0.2s' }
};

export default OrdenesTrabajo;