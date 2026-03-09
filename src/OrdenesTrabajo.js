import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, ClipboardList } from 'lucide-react';
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
      console.error("Error al cargar datos:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛠️ PAYLOAD BASADO EN LA ENTIDAD TYPEORM:
    // descripcion_falla: text
    // repuestos_utilizados: jsonb (Enviamos array vacío [])
    // vehiculoId: number (Columna explícita en el Backend)
    const payload = {
      descripcion_falla: form.descripcion_falla.trim(),
      tareas_realizadas: "Pendiente",
      
      // 🚨 CRÍTICO: Debe ser un objeto/array para el tipo JSONB de PostgreSQL
      repuestos_utilizados: [], 
      
      kilometraje: parseInt(form.kilometraje),
      responsable: form.responsable.trim(),
      vehiculoId: parseInt(form.vehiculoId),
      
      // El Backend usa @CreateDateColumn, pero mandamos tipo para el form
      tipo: form.tipo 
    };

    console.log("📤 Enviando Payload Certificado:", payload);

    try {
      await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ ¡ORDEN DE TRABAJO REGISTRADA!");
      
      // Limpiar formulario
      setForm({ 
        vehiculoId: '', 
        descripcion_falla: '', 
        kilometraje: '', 
        responsable: '', 
        tipo: 'Preventivo' 
      });
      fetchDatos();
    } catch (err) { 
      console.error("❌ Error del servidor:", err.response?.data);
      const serverMsg = err.response?.data?.message;
      alert(`Error: ${Array.isArray(serverMsg) ? serverMsg.join(", ") : "Error en la base de datos"}`); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("ALPHA QUÍMICA S.A.", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("ORDEN DE TRABAJO Y MANTENIMIENTO", 105, 28, { align: 'center' });

    // Tabla de datos
    doc.autoTable({
      startY: 35,
      head: [['Campo', 'Información']],
      body: [
        ['ID Orden', `#${ot.id}`],
        ['Fecha Emisión', new Date(ot.fecha).toLocaleDateString()],
        ['Vehículo / Patente', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable || 'No asignado'],
        ['Kilometraje', `${ot.kilometraje || 0} KM`],
        ['Tipo de Servicio', ot.tipo || 'General'],
        ['Estado de Tareas', ot.tareas_realizadas || 'Pendiente']
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });

    // Sección de Falla
    const finalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.text("Descripción de la Falla:", 14, finalY + 15);
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize(ot.descripcion_falla || "Sin descripción", 180);
    doc.text(splitDesc, 14, finalY + 22);

    doc.save(`OT_Sistema_${ot.id}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <Wrench size={32} color="#0f172a" />
          <h2 style={styles.title}>Nueva Orden de Trabajo</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          {/* Vehículo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Unidad / Vehículo</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">Seleccione patente...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          {/* Kilometraje */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={12}/> Kilometraje</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Ej: 150000"
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
              placeholder="Nombre del chofer/mecánico"
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          {/* Tipo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Mantenimiento</label>
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

          {/* Descripción */}
          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}><ClipboardList size={12}/> Detalle de la Falla o Pedido</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema detalladamente..."
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit}>
            <Plus size={18} /> REGISTRAR ORDEN DE TRABAJO
          </button>
        </form>

        <div style={styles.tableSection}>
          <h3 style={styles.subTitle}>Órdenes Recientes</h3>
          <div style={styles.scrollTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th>ID</th>
                  <th>FECHA</th>
                  <th>UNIDAD</th>
                  <th>RESPONSABLE</th>
                  <th style={{textAlign: 'center'}}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(ot => (
                  <tr key={ot.id} style={styles.tdRow}>
                    <td style={styles.td}>#{ot.id}</td>
                    <td style={styles.td}>{new Date(ot.fecha).toLocaleDateString()}</td>
                    <td style={styles.td}><strong>{ot.vehiculo?.patente}</strong></td>
                    <td style={styles.td}>{ot.responsable}</td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button onClick={() => descargarOT(ot)} style={styles.btnPdf}>
                        <Download size={16} /> PDF
                      </button>
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

// Estilos Scaneables y Modernos
const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '950px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
  headerArea: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subTitle: { fontSize: '18px', fontWeight: '700', color: '#334155', marginBottom: '15px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', transition: 'border 0.2s', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' },
  btnSubmit: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s' },
  tableSection: { marginTop: '20px' },
  scrollTable: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' },
  tdRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '16px 8px', fontSize: '14px', color: '#334155' },
  btnPdf: { background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#0f172a', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }
};

export default OrdenesTrabajo;