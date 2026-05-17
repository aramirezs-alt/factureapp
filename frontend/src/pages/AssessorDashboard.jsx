import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { Users, TrendingUp, AlertCircle, ArrowRight, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedImage from '../components/AuthenticatedImage';

const AssessorDashboard = () => {
  const [clients, setClients] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/advisors/my-clients');
      setClients(res.data);

      // Fetch summary for each client in parallel
      const summaryResults = await Promise.allSettled(
        res.data.map(access =>
          api.get(`/advisors/client/${access.Usuari.id}/summary`)
            .then(r => ({ userId: access.Usuari.id, data: r.data }))
        )
      );

      const summaryMap = {};
      summaryResults.forEach(result => {
        if (result.status === 'fulfilled') {
          summaryMap[result.value.userId] = result.value.data;
        }
      });
      setSummaries(summaryMap);
    } catch (err) {
      toast.error('Error al carregar els clients assignats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ marginBottom: '2rem' }}>
          <h1>Panell d'Assessor</h1>
          <p>Clients que t'han donat accés a les seves dades.</p>
        </header>

        {clients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
            <Users size={56} style={{ opacity: 0.2, marginBottom: '1rem', marginInline: 'auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Sense clients assignats</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Quan un negoci et concedeixi accés com a assessor, apareixerà aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {clients.map(access => {
              const user = access.Usuari;
              const profile = user.BusinessProfile;
              const summary = summaries[user.id]?.stats;

              return (
                <div
                  key={access.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                  onClick={() => navigate(`/assessor/client/${user.id}`)}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {profile?.logo_url
                        ? <AuthenticatedImage src={profile.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
                        : <Building size={24} color="var(--primary)" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile?.nom_negoci || user.email}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{profile?.nif_cif || user.email}</p>
                    </div>
                    <ArrowRight size={18} color="var(--text-secondary)" />
                  </div>

                  {/* Stats */}
                  {summary ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>FACTURADO</p>
                        <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--secondary)' }}>€{summary.totalInvoiced.toFixed(0)}</p>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>PENDENT</p>
                        <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--warning)' }}>{summary.pendingInvoices} fact.</p>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: summary.overdueInvoices > 0 ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-app)', borderRadius: '8px', border: `1px solid ${summary.overdueInvoices > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}` }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>VENÇUDES</p>
                        <p style={{ fontWeight: '700', fontSize: '15px', color: summary.overdueInvoices > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {summary.overdueInvoices > 0 && <AlertCircle size={14} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />}
                          {summary.overdueInvoices}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                      Carregant dades...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssessorDashboard;
