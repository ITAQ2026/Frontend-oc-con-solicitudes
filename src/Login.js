import React, { useState } from 'react';
import api from './api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/usuarios/login', {
        email: email.trim(),
        password,
      });
      const { token, user } = res.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>AQ</span>
          <h2 style={styles.title}>Alpha Quimica</h2>
          <p style={styles.subtitle}>Gestion de Compras e Inventario</p>
        </div>

        <label style={styles.label} htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label style={styles.label} htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        {error && <p style={styles.errorText}>{error}</p>}
        <p style={styles.footerText}>Solo usuarios cargados en Usuarios pueden ingresar.</p>
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
    background: '#0f172a',
  },
  form: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '420px',
  },
  logoContainer: { textAlign: 'center', marginBottom: '30px' },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: '#0f172a',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  title: { margin: '12px 0 5px 0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0, lineHeight: 1.5 },
  button: {
    width: '100%',
    padding: '14px',
    color: 'white',
    background: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '15px',
    marginBottom: '16px',
  },
  errorText: { color: '#b91c1c', fontSize: '13px', marginTop: '14px', textAlign: 'center' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' },
};

export default Login;
