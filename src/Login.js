import React, { useState } from 'react';
import api from './api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Normalizamos el email antes de enviar para evitar errores de espacios/mayúsculas
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const res = await api.post('/api/usuarios/login', { 
        email: normalizedEmail, 
        password 
      });
      
      if (res.data) {
        // IMPORTANTE: Si el backend no devuelve el email en res.data, 
        // lo agregamos manualmente del input para que el App.js pueda validar permisos
        const userToSave = {
          ...res.data,
          email: res.data.email || normalizedEmail
        };
        
        onLogin(userToSave);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("❌ Email o contraseña incorrectos");
      } else {
        alert("⚠️ Error de conexión con el servidor");
        console.error("Login error:", err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.logoContainer}>
          <span style={{ fontSize: '40px' }}>🛡️</span>
          <h2 style={styles.title}>Alpha Química</h2>
          <p style={styles.subtitle}>Gestión Integral</p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Correo Electrónico</label>
          <input 
            style={styles.input} 
            type="email" 
            placeholder="ejemplo@alphaquimica.com.ar" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Contraseña</label>
          <input 
            style={styles.input} 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" style={styles.button}>
          Iniciar Sesión
        </button>
        
        <p style={styles.footerText}>Sistema de Uso Interno</p>
      </form>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: '#0f172a' // Un fondo más oscuro y profesional
  },
  form: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
    width: '100%',
    maxWidth: '400px' 
  },
  logoContainer: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '10px 0 5px 0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '5px', textTransform: 'uppercase' },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    boxSizing: 'border-box'
  },
  button: { 
    width: '100%', 
    padding: '14px', 
    background: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }
};

export default Login;