import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Shield, Mail, Trash2 } from 'lucide-react';

const UsuariosGestion = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', password: '', rol: 'user' });

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios");
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/registro', nuevo);
      alert("Usuario creado con éxito");
      setNuevo({ nombre: '', email: '', password: '', rol: 'user' });
      cargarUsuarios();
    } catch (err) {
      alert("Error al crear usuario. ¿Email duplicado?");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3><UserPlus /> Crear Nuevo Usuario</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Nombre Completo" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
          <input style={styles.input} type="email" placeholder="Email" value={nuevo.email} onChange={e => setNuevo({...nuevo, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Contraseña" value={nuevo.password} onChange={e => setNuevo({...nuevo, password: e.target.value})} required />
          <select style={styles.input} value={nuevo.rol} onChange={e => setNuevo({...nuevo, rol: e.target.value})}>
            <option value="user">Usuario (Solicitante)</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" style={styles.btnSave}>Guardar Usuario</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Existentes</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><span style={u.rol === 'admin' ? styles.badgeAdmin : styles.badgeUser}>{u.rol}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' },
  btnSave: { gridColumn: 'span 2', background: '#1e293b', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tr: { borderBottom: '1px solid #eee', textAlign: 'left', height: '40px' },
  badgeAdmin: { background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  badgeUser: { background: '#e0f2fe', color: '#075985', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
};

export default UsuariosGestion;