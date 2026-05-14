import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, rol);
      toast.success('¡Cuenta creada! Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: '800' }}>
            FactureApp
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Crea tu cuenta profesional</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email Corporativo</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Tipo de cuenta</label>
            <select
              className="input"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="USER">Empresa / Autónomo</option>
              <option value="ASSESSOR">Asesor / Gestor</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2',
              padding: '10px',
              borderRadius: 'var(--radius-btn)',
              color: 'var(--danger)',
              fontSize: '13px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <UserPlus size={20} />
                <span>Registrarse ahora</span>
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
          ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
