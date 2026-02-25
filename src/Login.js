import React, { useState } from 'react';
import api from './api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Intenta buscar el usuario en la DB
      const res = await api.get('/usuarios');
      const user = res.data.find(u => u.email === email && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Alpha Química</h2>
        <input style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }} 
               type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd' }} 
               type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;