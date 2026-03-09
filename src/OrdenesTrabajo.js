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
    responsable: '' 
  });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resOt, resVeh] = await api.all([
        api.get('/api/ordenes-trabajo'),
        api.get('/api/vehiculos')
      ]);
      setOrdenes(resOt.data || []);
      setVehiculos(resVeh.data || []);
    } catch (err) { console.error("Error cargando datos", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 SEGÚN TU ENTIDAD:
    // La columna es "descripcion_falla" (string)
    // El ID es "vehiculoId" (number)
    // repuestos_utilizados es jsonb (debe ir como objeto)
    
    const payload = {
      descripcion_falla: String(form.descripcion_falla),
      kilometraje: Number(form.kilometraje),
      responsable: String(form.responsable),
      vehiculoId: Number(form.vehiculoId),
      // Enviamos null o un objeto vacío para el JSONB, 
      // nunca un string como "Ninguno"
      repuestos_utilizados: {}, 
      tareas_realizadas: "Pendiente"
    };

    console.log("Payload final antes del POST:", payload);

    try {
      const response = await api.post('/api/ordenes-trabajo', payload); 
      alert("✅ ¡ORDEN CREADA!");
      setForm({ vehiculoId: '', descripcion_falla: '', kilometraje: '', responsable: '' });
      fetchDatos();
    } catch (err) { 
      console.error("Detalle del error 500:", err.response?.data);
      alert("Error 500: El servidor recibió los datos pero la base de datos los rechazó. Revisa la consola (F12)."); 
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Wrench /> Ordenes de Trabajo</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
        <select 
          value={form.vehiculoId} 
          onChange={e => setForm({...form, vehiculoId: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        >
          <option value="">Seleccionar Vehículo</option>
          {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}
        </select>

        <input 
          type="number" 
          placeholder="Kilometraje" 
          value={form.kilometraje} 
          onChange={e => setForm({...form, kilometraje: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />

        <input 
          type="text" 
          placeholder="Responsable" 
          value={form.responsable} 
          onChange={e => setForm({...form, responsable: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />

        <textarea 
          placeholder="Descripción de la falla" 
          value={form.descripcion_falla} 
          onChange={e => setForm({...form, descripcion_falla: e.target.value})} 
          required 
          style={{ padding: '10px', minHeight: '100px' }}
        />

        <button type="submit" style={{ background: '#0f172a', color: 'white', padding: '12px', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>
          CREAR ORDEN
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        {ordenes.map(ot => (
          <div key={ot.id} style={{ borderBottom: '1px solid #eee', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{new Date(ot.fecha).toLocaleDateString()} - <strong>{ot.vehiculo?.patente}</strong></span>
            <span>{ot.responsable}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdenesTrabajo;