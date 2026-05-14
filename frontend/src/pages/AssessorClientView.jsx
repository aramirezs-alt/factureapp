import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, Building, TrendingUp, TrendingDown, Clock, AlertCircle, Eye, Download, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthenticatedImage from '../components/AuthenticatedImage';

const getStatusClass = (status) => {
  switch (status) {
    case 'PAGADA': return 'badge-paid';
    case 'ENVIADA': return 'badge-sent';
    case 'VENÇUDA': return 'badge-overdue';
    case 'ESBORRANY': return 'badge-draft';
    case 'CANCEL·LADA': return 'badge-overdue';
    default: return 'badge-draft';
  }
};

const AssessorClientView = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [resSummary, resInvoices] = await Promise.all([
        api.get(`/advisors/client/${clientId}/summary`),
        api.get(`/advisors/client/${clientId}/invoices`)
      ]);
      setSummary(resSummary.data);
      setInvoices(resInvoices.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('No tens accés a aquest client');
        navigate('/assessor');
      } else {
        toast.error('Error al carregar les dades del client');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      toast.loading('Generant PDF...', { id: 'pdf-toast' });
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF descarregat', { id: 'pdf-toast' });
    } catch {
      toast.error('Error al descarregar el PDF', { id: 'pdf-toast' });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (
      `${inv.serie}-${inv.numero_Factura}`.toLowerCase().includes(q) ||
      (inv.Client?.nom || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        </div>
      </Layout>
    );
  }

  const { profile, stats } = summary || {};

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/assessor')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem', fontSize: '14px' }}
          >
            <ArrowLeft size={16} /> Tornar al panell
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#DBEAFE', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {profile?.logo_url
                ? <AuthenticatedImage src={profile.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <Building size={28} color="var(--primary)" />
              }
            </div>
            <div>
              <h1 style={{ marginBottom: '0.1rem' }}>{profile?.nom_negoci || 'Client'}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {profile?.nom} {profile?.cognoms} · {profile?.nif_cif}
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D1FAE5', color: '#10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="label" style={{ fontSize: '11px' }}>TOTAL FACTURAT</p>
                <h3 style={{ fontSize: '1.2rem' }}>€{stats.totalInvoiced.toFixed(2)}</h3>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEE2E2', color: '#EF4444', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <TrendingDown size={20} />
              </div>
              <div>
                <p className="label" style={{ fontSize: '11px' }}>TOTAL DESPESES</p>
                <h3 style={{ fontSize: '1.2rem' }}>€{stats.totalExpenses.toFixed(2)}</h3>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', color: '#F59E0B', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <p className="label" style={{ fontSize: '11px' }}>PENDENTS DE COBRAR</p>
                <h3 style={{ fontSize: '1.2rem' }}>{stats.pendingInvoices} fact.</h3>
              </div>
            </div>
            {stats.overdueInvoices > 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: '#FCA5A5' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEE2E2', color: '#EF4444', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="label" style={{ fontSize: '11px', color: '#EF4444' }}>⚠ VENÇUDES</p>
                  <h3 style={{ fontSize: '1.2rem', color: '#EF4444' }}>{stats.overdueInvoices} fact.</h3>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invoices table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px' }}>Factures</h2>
            <input
              type="text"
              placeholder="Cercar per número o client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ width: '250px', height: '36px', fontSize: '13px' }}
            />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1rem' }} className="label">NÚMERO</th>
                <th style={{ padding: '0.875rem 1rem' }} className="label">CLIENT</th>
                <th style={{ padding: '0.875rem 1rem' }} className="label">EMISSIÓ</th>
                <th style={{ padding: '0.875rem 1rem' }} className="label">VENCIMENT</th>
                <th style={{ padding: '0.875rem 1rem' }} className="label">TOTAL</th>
                <th style={{ padding: '0.875rem 1rem' }} className="label">ESTAT</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }} className="label">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hi ha factures per mostrar.
                  </td>
                </tr>
              ) : filteredInvoices.map(inv => {
                const fullNum = `${inv.serie}-${inv.numero_Factura}`;
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }} className="mono">{fullNum}</td>
                    <td style={{ padding: '1rem' }}>{inv.Client?.nom || '—'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(inv.data_emissio).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: inv.estat === 'VENÇUDA' ? '#EF4444' : 'var(--text-secondary)' }}>
                      {new Date(inv.data_venciment).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>€{parseFloat(inv.total).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusClass(inv.estat)}`}>{inv.estat}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDownloadPDF(inv.id, fullNum)}
                        className="btn btn-ghost"
                        style={{ padding: '6px' }}
                        title="Descarregar PDF"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AssessorClientView;
