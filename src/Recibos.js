import React, { useState, useEffect } from 'react';
// IMPORTANTE: Ruta relativa corregida para el build de Vercel
import api from './api'; 
import { Receipt, Plus, Download, Trash2 } from 'lucide-react';

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [form, setForm] = useState({ 
    emisor: 'Alpha Química', 
    receptor: '', 
    concepto: '', 
    monto: '', 
    condicion_pago: 'Efectivo' 
  });

  useEffect(() => { 
    fetchRecibos(); 
  }, []);

  const fetchRecibos = async () => {
    try {
      const res = await api.get('/api/recibos');
      setRecibos(res.data);
    } catch (err) {
      console.error("Error al cargar recibos", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/recibos', form);
      alert("✅ Recibo generado exitosamente");
      // Limpiamos el formulario después de guardar
      setForm({ emisor: 'Alpha Química', receptor: '', concepto: '', monto: '', condicion_pago: 'Efectivo' });
      fetchRecibos();
    } catch (err) {
      alert("❌ Error al generar recibo");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Receipt size={24} /> Administración: Recibos de Caja</h2>
        
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.row}>
            <input 
              placeholder="Receptor (Quién recibe el dinero)" 
              style={styles.input} 
              required
              value={form.receptor}
              onChange={e => setForm({...form, receptor: e.target.value})} 
            />
            <input 
              placeholder="Importe $" 
              type="number" 
              style={styles.input} 
              required
              value={form.monto}
              onChange={e => setForm({...form, monto: e.target.value})} 
            />
          </div>
          <textarea 
            placeholder="Concepto del pago / Detalle" 
            style={styles.textarea} 
            required
            value={form.concepto}
            onChange={e => setForm({...form, concepto: e.target.value})} 
          />
          <button type="submit" style={styles.btn}>
            <Plus size={18} /> Generar Comprobante
          </button>
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>N° RECIBO</th>
                <th>FECHA</th>
                <th>RECEPTOR</th>
                <th>IMPORTE</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map(r => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}><strong>#A-{String(r.id).padStart(4, '0')}</strong></td>
                  <td style={styles.td}>{new Date(r.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}>{r.receptor}</td>
                  <td style={{ ...styles.td, color: '#16a34a', fontWeight: 'bold' }}>
                    ${Number(r.monto).toLocaleString()}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <Download size={18} style={{ cursor: 'pointer', color: '#64748b' }} title="Descargar PDF" />
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
  container: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  card: { background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#1e293b' },
  form: { display: 'grid', gap: '15px', marginBottom: '40px', backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' },
  textarea: { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', minHeight: '80px', fontSize: '14px', resize: 'vertical' },
  btn: { padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px 10px', fontSize: '14px', color: '#334155' }
};

export default Recibos;