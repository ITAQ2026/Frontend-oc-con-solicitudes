import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download, Gauge, User, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
      console.error("Error al sincronizar con el servidor:", err);
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🎯 EL CAMBIO RADICAL:
    // El servidor espera nombres en inglés/camelCase para validarlos,
    // aunque en la base de datos se guarden con otros nombres.
    const payload = {
      description: form.descripcion_falla.trim(), // 'descripcion_falla' -> 'description'
      tasks: "Pendiente",                         // 'tareas_realizadas' -> 'tasks'
      spareParts: {},                             // 'repuestos_utilizados' -> 'spareParts'
      kilometraje: parseInt(form.kilometraje),    // Este SI llega ($1)
      responsable: form.responsable.trim(),       // Este SI llega ($2)
      vehiculoId: parseInt(form.vehiculoId),      // Este SI llega ($3)
    };

    console.log("📤 Enviando Payload Traducido al DTO:", payload);

    try {
      const res = await api.post('/api/ordenes-trabajo', payload); 
      console.log("✅ Respuesta:", res.data);
      alert("✅ ¡ORDEN CREADA! El problema eran los nombres de los campos.");
      
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) { 
      console.error("❌ Error persistente:", err.response?.data);
      
      // Si el error de validación dice que falta "description", ya sabemos que es por ahí
      const msg = err.response?.data?.message;
      alert(`Error: ${Array.isArray(msg) ? msg.join(", ") : "Revisa la consola para ver qué campo falta"}`); 
    } finally {
      setLoading(false);
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ALPHA QUÍMICA S.A. - OT", 105, 20, { align: 'center' });
    
    doc.autoTable({
      startY: 30,
      head: [['Propiedad', 'Detalle']],
      body: [
        ['ID Orden', `#${ot.id}`],
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Modelo', ot.vehiculo?.modelo || 'N/A'],
        ['Responsable', ot.responsable || 'No asignado'],
        ['Kilometraje', `${ot.kilometraje} KM`],
        ['Fecha', new Date(ot.fecha).toLocaleDateString()],
      ],
      theme: 'grid'
    });

    doc.setFont("helvetica", "bold");
    doc.text("Descripción de Falla:", 14, doc.lastAutoTable.finalY + 10);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(ot.descripcion_falla || "", 180);
    doc.text(splitText, 14, doc.lastAutoTable.finalY + 17);

    doc.save(`Orden_${ot.id}_${ot.vehiculo?.patente || 'ST'}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Wrench size={28} color="#0f172a" />
          <h2 style={styles.title}>Apertura de Orden de Trabajo</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          {/* SELECCIÓN DE VEHÍCULO - CARGA DINÁMICA */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Seleccionar Unidad</label>
            <select 
              style={styles.input} 
              value={form.vehiculoId} 
              onChange={e => setForm({...form, vehiculoId: e.target.value})} 
              required
            >
              <option value="">-- Patente / Modelo --</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Gauge size={12}/> Kilometraje</label>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="000000"
              value={form.kilometraje} 
              onChange={e => setForm({...form, kilometraje: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={12}/> Responsable</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Nombre del chofer"
              value={form.responsable} 
              onChange={e => setForm({...form, responsable: e.target.value})} 
              required 
            />
          </div>

          <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
            <label style={styles.label}><FileText size={12}/> Descripción de la Falla</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describa el problema reportado..."
              value={form.descripcion_falla} 
              onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={18}/> REGISTRAR OT</>}
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>ID</th>
                <th>FECHA</th>
                <th>UNIDAD</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(ot => (
                <tr key={ot.id} style={styles.tdRow}>
                  <td style={styles.td}>#{ot.id}</td>
                  <td style={styles.td}>{new Date(ot.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}><strong>{ot.vehiculo?.patente}</strong></td>
                  <td style={styles.td}>
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
  card: { background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' },
  btnSubmit: { gridColumn: 'span 2', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px' },
  tdRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 5px', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }
};

export default OrdenesTrabajo;