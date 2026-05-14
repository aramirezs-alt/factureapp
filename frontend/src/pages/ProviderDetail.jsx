import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, Building, Mail, Phone, MapPin, Tag, TrendingDown, Eye, Paperclip, ExternalLink, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/providers/${id}`);
      setProvider(response.data);
    } catch (err) {
      toast.error('Error al carregar dades del proveïdor');
      navigate('/providers');
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

  if (!provider) return null;

  const expenses = provider.Expenses || [];
  const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.total), 0);
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button 
              onClick={() => navigate('/providers')} 
              className="btn btn-ghost" 
              style={{ width: '40px', height: '40px', padding: '0', borderRadius: '10px' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>
                {provider.nom.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ marginBottom: '2px' }}>{provider.nom}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{provider.nif} · Proveïdor de {provider.categoria}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => navigate(`/providers/${id}/edit`)}
              className="btn btn-secondary"
              style={{ height: '42px' }}
            >
              Editar Proveïdor
            </button>
            <button 
              onClick={() => navigate(`/expenses/new?proveidor_id=${id}`)}
              className="btn btn-danger"
              style={{ height: '42px' }}
            >
              <Plus size={18} /> Registrar Despesa
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar Info */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards */}
            <div className="card" style={{ background: '#EF4444', color: 'white', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', opacity: 0.9 }}>
                <TrendingDown size={18} />
                <h3 style={{ fontSize: '14px', fontWeight: '600' }}>DESPESA ACUMULADA</h3>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>TOTAL PAGAT</p>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>€{totalExpense.toFixed(2)}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>MITJANA</p>
                  <p style={{ fontWeight: '700' }}>€{avgExpense.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>Nº PAGAMENTS</p>
                  <p style={{ fontWeight: '700' }}>{expenses.length}</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="card">
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} color="var(--primary)" /> DADES FISCALS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Mail size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>EMAIL</p>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{provider.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Phone size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>TELÈFON</p>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{provider.telefon || 'No indicat'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>ADREÇA</p>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', fontWeight: '500' }}>
                      {provider.adreca}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content: Expense History */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px' }}>Historial de Despeses</h3>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">DATA</th>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">CONCEPTE</th>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">ADJUNT</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }} className="label">IMPORT</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                          <TrendingDown size={40} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>No hi ha despeses registrades per a aquest proveïdor.</p>
                      </td>
                    </tr>
                  ) : expenses.map(exp => (
                    <tr key={exp.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>{new Date(exp.data_despesa).toLocaleDateString()}</td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{exp.descripcio}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {exp.adjunt_url ? (
                          <a 
                            href={`${BACKEND_URL}${exp.adjunt_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ 
                              color: 'var(--primary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '13px', 
                              textDecoration: 'none',
                              fontWeight: '600'
                            }}
                          >
                            <Paperclip size={14} /> Factura / Ticket
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Sense adjunt</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', color: 'var(--danger)' }}>€{parseFloat(exp.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProviderDetail;
