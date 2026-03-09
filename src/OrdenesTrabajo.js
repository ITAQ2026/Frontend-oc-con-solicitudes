import React, { useState, useEffect } from 'react';
import api from './api';
import { Wrench, Plus, Download } from 'lucide-react';
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

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resOt, resVeh] = await Promise.all([
        api.get('/api/ordenes-trabajo'),
        api.get('/api/vehiculos')
      ]);
      setOrdenes(resOt.data || []);
      setVehiculos(resVeh.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 ESTE PAYLOAD INTENTA ADIVINAR LOS NOMBRES DEL DTO DEL BACKEND
    const payload = {
      // Intentamos con 'descripcion_falla' y 'descripcion'
      descripcion_falla: form.descripcion_falla,
      descripcion: form.descripcion_falla,
      
      // Intentamos enviar el ID del vehículo de las dos formas comunes
      vehiculoId: Number(form.vehiculoId),
      vehiculo: Number(form.vehiculoId), 
      
      // Otros campos obligatorios
      kilometraje: Number(form.kilometraje),
      responsable: form.responsable,
      tipo: form.tipo,
      
      // Campos que el log de Render mostró como NULL
      tareas_realizadas: "Pendiente",
      repuestos_utilizados: "Ninguno",
      costo_estimado: 0
    };

    console.log("Enviando Payload:", payload);

    try {
      await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ ¡ÉXITO! Orden creada.");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '', tipo: 'Preventivo' });
      fetchDatos();
    } catch (err) { 
      console.error("Error del servidor:", err.response?.data);
      alert("❌ Error 500: El servidor sigue sin ver los campos. Revisa el DTO en el Backend."); 
    }
  };

  const descargarOT = (ot) => {
    const doc = new jsPDF();
    doc.text("ORDEN DE TRABAJO", 105, 20, { align: 'center' });
    doc.autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: [
        ['Vehículo', ot.vehiculo?.patente || 'N/A'],
        ['Responsable', ot.responsable],
        ['KM', ot.kilometraje],
        ['Falla', ot.descripcion_falla || ot.descripcion],
      ],
    });
    doc.save(`OT_${ot.id}.pdf`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2><Wrench /> Nueva Orden</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
          <select value={form.vehiculoId} onChange={e => setForm({...form, vehiculoId: e.target.value})} required style={{ padding: '8px' }}>
            <option value="">Seleccionar Vehículo...</option>
            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}
          </select>
          <input type="number" placeholder="Kilometraje" value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} required style={{ padding: '8px' }} />
          <input type="text" placeholder="Responsable" value={form.responsable} onChange={e => setForm({...form, responsable: e.target.value})} required style={{ padding: '8px' }} />
          <textarea placeholder="Descripción de la falla" value={form.descripcion_falla} onChange={e => setForm({...form, descripcion_falla: e.target.value})} required style={{ padding: '8px', minHeight: '80px' }} />
          <button type="submit" style={{ background: '#000', color: '#fff', padding: '10px', cursor: 'pointer', border: 'none' }}>ABRIR ORDEN</button>
        </form>

        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th>ID</th>
              <th>Vehículo</th>
              <th>Responsable</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(ot => (
              <tr key={ot.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{ot.id}</td>
                <td>{ot.vehiculo?.patente}</td>
                <td>{ot.responsable}</td>
                <td><button onClick={() => descargarOT(ot)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Download size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdenesTrabajo;