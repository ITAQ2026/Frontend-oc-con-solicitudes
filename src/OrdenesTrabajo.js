import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Wrench, Plus, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdenesTrabajo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [historial, setHistorial] = useState([]); // Nuevo estado para el historial
  const [repuestos, setRepuestos] = useState([{ descripcion: '', cantidad: 1 }]);
  const [form, setForm] = useState({ 
    vehiculoId: '', 
    falla: '', 
    tareas: '', 
    kilometraje: '', 
    responsable: '' 
  });

  useEffect(() => {
    fetchVehiculos();
    fetchHistorial();
  }, []);

  const fetchVehiculos = () => {
    api.get('/api/vehiculos')
      .then(res => setVehiculos(res.data))
      .catch(err => console.error("Error al cargar vehículos", err));
  };

  const fetchHistorial = () => {
    api.get('/api/ordenes-trabajo')
      .then(res => setHistorial(res.data))
      .catch(err => console.error("Error al cargar historial", err));
  };

  const agregarRepuesto = () => setRepuestos([...repuestos, { descripcion: '', cantidad: 1 }]);

  // Función para generar el PDF de la OT
  const descargarOT = (ot) => {
    const doc = jsPDF();
    
    // Header Estilizado
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("ALPHA QUÍMICA - ORDEN DE TRABAJO", 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`NRO ORDEN: #${String(ot.id).padStart(5, '0')}`, 105, 28, { align: 'center' });

    // Datos del Vehículo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL VEHÍCULO", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Patente: ${ot.vehiculo?.patente || 'N/A'}`, 20, 60);
    doc.text(`Modelo: ${ot.vehiculo?.modelo || 'N/A'}`, 20, 65);
    doc.text(`Kilometraje: ${Number(ot.kilometraje).toLocaleString()} KM`, 120, 60);
    doc.text(`Fecha: ${new Date(ot.fecha).toLocaleDateString()}`, 120, 65);

    doc.line(20, 70, 190, 70);

    // Falla y Diagnóstico
    doc.setFont("helvetica", "bold");
    doc.text("FALLA REPORTADA / TRABAJOS:", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(ot.falla || "Sin descripción", 20, 88, { maxWidth: 170 });

    // Tabla de Repuestos
    doc.autoTable({
      startY: 110,
      head: [['Descripción del Repuesto / Insumo', 'Cantidad']],
      body: ot.repuestos ? ot.repuestos.map(r => [r.descripcion, r.cantidad]) : [],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    // Pie de página
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.line(130, finalY, 180, finalY);
    doc.text("Firma Responsable Taller", 130, finalY + 5);

    doc.save(`OT_Alpha_${ot.id}.pdf`);
  };

  const guardarOT = async (e) => {
    e.preventDefault();
    const data = { ...form, repuestos };
    try {
      await api.post('/api/ordenes-trabajo', data);
      alert("✅ Orden de Trabajo registrada con éxito");
      setForm({ vehiculoId: '', falla: '', tareas: '', kilometraje: '', responsable: '' });
      setRepuestos([{ descripcion: '', cantidad: 1 }]);
      fetchHistorial(); // Actualiza la lista sin recargar toda la web
    } catch (err) { 
      alert("❌ Error al guardar la orden."); 
    }
  };

  return (
    <div style={styles.container}>
      {/* FORMULARIO DE NUEVA OT */}
      <div style={styles.card}>
        <h2 style={styles.header}><Wrench size={24} /> Nueva Orden de Trabajo</h2>
        <form onSubmit={guardarOT}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Vehículo</label>
              <select 
                style={styles.input} 
                required 
                value={form.vehiculoId} 
                onChange={e => setForm({...form, vehiculoId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Kilometraje Actual</label>
              <input 
                style={styles.input} 
                type="number" 
                placeholder="Ej: 150000" 
                value={form.kilometraje}
                onChange={e => setForm({...form, kilometraje: e.target.value})} 
              />
            </div>
          </div>

          <label style={styles.label}>Falla Reportada / Diagnóstico</label>
          <textarea 
            style={styles.textarea} 
            placeholder="Describa el problema..." 
            value={form.falla}
            onChange={e => setForm({...form, falla: e.target.value})} 
          />

          <div style={styles.sectionRepuestos}>
            <label style={styles.label}>Repuestos / Insumos Utilizados</label>
            {repuestos.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  style={{ ...styles.input, flex: 3 }} 
                  placeholder="Descripción" 
                  value={r.descripcion} 
                  onChange={e => { 
                    const n = [...repuestos]; n[i].descripcion = e.target.value; setRepuestos(n); 
                  }} 
                />
                <input 
                  style={{ ...styles.input, flex: 1 }} 
                  type="number" 
                  value={r.cantidad} 
                  onChange={e => { 
                    const n = [...repuestos]; n[i].cantidad = e.target.value; setRepuestos(n); 
                  }} 
                />
                <button type="button" onClick={() => setRepuestos(repuestos.filter((_, idx) => idx !== i))} style={styles.btnDel}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
            <button type="button" onClick={agregarRepuesto} style={styles.btnAdd}>
              <Plus size={14}/> Agregar Repuesto
            </button>
          </div>

          <button type="submit" style={styles.btnSubmit}><Save size={20}/> GUARDAR ORDEN</button>
        </form>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div style={{...styles.card, marginTop: '30px'}}>
        <h3 style={styles.header}>Historial de Mantenimiento</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th>ORDEN</th>
              <th>FECHA</th>
              <th>VEHÍCULO</th>
              <th>KILOMETRAJE</th>
              <th style={{textAlign: 'center'}}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(ot => (
              <tr key={ot.id} style={styles.tr}>
                <td style={styles.td}>#{String(ot.id).padStart(4, '0')}</td>
                <td style={styles.td}>{new Date(ot.fecha).toLocaleDateString()}</td>
                <td style={styles.td}>{ot.vehiculo?.patente}</td>
                <td style={styles.td}>{Number(ot.kilometraje).toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <Download 
                    size={20} 
                    style={{cursor: 'pointer', color: '#0ea5e9'}} 
                    onClick={() => descargarOT(ot)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#1e293b' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px', marginBottom: '20px', fontSize: '14px' },
  sectionRepuestos: { background: '#f1f5f9', padding: '15px', borderRadius: '10px', marginBottom: '20px' },
  btnAdd: { background: 'white', border: '1px dashed #64748b', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '500' },
  btnSubmit: { width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' },
  btnDel: { background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 5px', fontSize: '14px', color: '#334155' }
};

export default OrdenesTrabajo;