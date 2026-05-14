import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { UserPlus, Shield, ShieldOff, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdvisorAccess = () => {
  const [advisors, setAdvisors] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advisors/my-advisors');
      setAdvisors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setGranting(true);
    try {
      const res = await api.post('/advisors/grant', { email });
      toast.success(res.data.message);
      setEmail('');
      fetchAdvisors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revocar accés a aquest assessor?')) return;
    try {
      await api.put(`/advisors/${id}/revoke`);
      toast.success('Accés revocat');
      fetchAdvisors();
    } catch (err) {
      toast.error('Error al revocar');
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1>Gestió d'Assessors</h1>
          <p>Convida un assessor fiscal perquè pugui consultar les teves dades.</p>
        </header>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            <UserPlus size={20} />
            <h3>Convidar Assessor</h3>
          </div>
          <form onSubmit={handleGrant} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="input"
              type="email"
              required
              placeholder="Email de l'assessor registrat..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={granting} className="btn btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
              {granting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Atorgar Accés
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--primary)" />
            <h3>Assessors amb accés</h3>
          </div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Carregant...</div>
          ) : advisors.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Shield size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No has donat accés a cap assessor.</p>
            </div>
          ) : (
            advisors.map((access) => (
              <div key={access.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: access.estat === 'ACTIU' ? '#D1FAE5' : '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Mail size={16} color={access.estat === 'ACTIU' ? '#10B981' : '#EF4444'} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{access.Assessor?.email}</p>
                    <span className={`badge ${access.estat === 'ACTIU' ? 'badge-paid' : 'badge-overdue'}`} style={{ fontSize: '10px' }}>
                      {access.estat}
                    </span>
                  </div>
                </div>
                {access.estat === 'ACTIU' && (
                  <button onClick={() => handleRevoke(access.id)} className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '6px 12px', fontSize: '12px' }}>
                    <ShieldOff size={16} />
                    Revocar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdvisorAccess;
