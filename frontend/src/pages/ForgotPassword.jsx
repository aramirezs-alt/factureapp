import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Correu enviat correctament');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al processar la sol·licitud');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '20px' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
          <CheckCircle size={60} color="#10B981" style={{ marginBottom: '1.5rem', marginInline: 'auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>Correu enviat</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Hem enviat un enllaç de recuperació a <strong>{email}</strong>. Revisa la teva bústia d'entrada (i la carpeta de spam).
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            Tornar al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '20px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Tornar al login
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>Recuperar clau</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Introducció el teu email i t'enviarem un enllaç per restablir la teva contrasenya.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@correu.com"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Enviar enllaç de recuperació'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
