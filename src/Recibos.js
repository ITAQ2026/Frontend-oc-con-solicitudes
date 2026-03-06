import React, { useState, useEffect } from 'react';
import api from './api';
import { Receipt, Plus, Download, Trash2 } from 'lucide-react';

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [form, setForm] = useState({ emisor: 'Alpha Química', receptor: '', concepto: '', monto: '', condicion_pago: 'Efectivo' });

  useEffect(() => { fetchRecibos(); }, []);

  const fetchRecibos = async () => {
    const res = await api.get('/api/recibos');
    setRecibos(res.data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/api/recibos', form);
    alert("Recibo generado");
    fetchRecibos();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Receipt /> Administración: Recibos</h2>
        <form onSubmit={handleSave} style={styles.form}>
          <input placeholder="Receptor" style={styles.input} onChange={e => setForm({...form, receptor: e.target.value})} />
          <input placeholder="Monto" type="number" style={styles.input} onChange={e => setForm({...form, monto: e.target.value})} />
          <textarea placeholder="Concepto" style={styles.textarea} onChange={e => setForm({...form, concepto: e.target.value})} />
          <button type="submit" style={styles.btn}>Generar Recibo</button>
        </form>

        <table style={styles.table}>
          <thead>
            <tr><th>N°</th><th>Fecha</th><th>Receptor</th><th>Importe</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {recibos.map(r => (
              <tr key={r.id}>
                <td>A000{r.id}</td>
                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                <td>{r.receptor}</td>
                <td>${Number(r.monto).toLocaleString()}</td>
                <td><Download size={16} cursor="pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' },
  card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  header: { display: 'flex', gap: '10px', marginBottom: '20px' },
  form: { display: 'grid', gap: '10px', marginBottom: '30px' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' },
  btn: { padding: '10px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' }
};

export default Recibos;