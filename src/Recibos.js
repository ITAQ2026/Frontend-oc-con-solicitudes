import React, { useState, useEffect } from 'react';
import api from '../api';
import { Receipt, Plus, DollarSign, FileDown } from 'lucide-react';

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [form, setForm] = useState({ emisor: 'Alpha Química S.A.', receptor: '', concepto: '', monto: '', metodo_pago: 'Efectivo' });

  useEffect(() => {
    api.get('/api/recibos').then(res => setRecibos(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/recibos', form);
      alert("✅ Recibo emitido correctamente");
      window.location.reload();
    } catch (err) { alert("❌ Error al emitir"); }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
          <Receipt size={28} /> Emisión de Recibos
        </h2>
        <hr style={{ margin: '20px 0', opacity: 0.1 }} />

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input style={inputStyle} placeholder="Emisor" value={form.emisor} onChange={e => setForm({...form, emisor: e.target.value})} required />
          <input style={inputStyle} placeholder="Receptor" value={form.receptor} onChange={e => setForm({...form, receptor: e.target.value})} required />
          <input style={inputStyle} type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
          <select style={inputStyle} value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cheque">Cheque</option>
          </select>
          <textarea style={{ ...inputStyle, gridColumn: 'span 2', height: '80px' }} placeholder="Concepto del pago..." onChange={e => setForm({...form, concepto: e.target.value})} required />
          <button type="submit" style={btnStyle}><Plus size={18} /> GENERAR RECIBO</button>
        </form>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '15px' }}>Historial de Movimientos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                <th style={{ padding: '10px' }}>FECHA</th>
                <th>RECEPTOR</th>
                <th>CONCEPTO</th>
                <th>MONTO</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(r.fecha).toLocaleDateString()}</td>
                  <td style={{ fontSize: '14px' }}>{r.receptor}</td>
                  <td style={{ fontSize: '14px', color: '#64748b' }}>{r.concepto}</td>
                  <td style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>${Number(r.monto).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const btnStyle = { gridColumn: 'span 2', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '10px' };

export default Recibos;