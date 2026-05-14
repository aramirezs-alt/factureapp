import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, TrendingUp, Eye, Download, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      setClient(response.data);
    } catch (err) {
      toast.error('Error al carregar dades del client');
      navigate('/clients');
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

  if (!client) return null;

  const invoices = client.Invoices || [];
  const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const paidInvoiced = invoices.filter(i => i.estat === 'PAGADA').reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const pendingInvoiced = totalInvoiced - paidInvoiced;

  const getStatusClass = (status) => {
    switch (status) {
      case 'PAGADA': return 'badge-paid';
      case 'ENVIADA': return 'badge-sent';
      case 'VENÇUDA': return 'badge-overdue';
      case 'ESBORRANY': return 'badge-draft';
      default: return 'badge-draft';
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button 
              onClick={() => navigate('/clients')} 
              className="btn btn-ghost" 
              style={{ width: '40px', height: '40px', padding: '0', borderRadius: '10px' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#DBEAFE', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                {client.nom.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ marginBottom: '2px' }}>{client.nom}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{client.nif} · Client des de {new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => navigate(`/clients/${id}/edit`)}
              className="btn btn-secondary"
              style={{ height: '42px' }}
            >
              Editar Client
            </button>
            <button 
              onClick={() => navigate(`/invoices/new?client_id=${id}`)}
              className="btn btn-primary"
              style={{ height: '42px' }}
            >
              Nova Factura
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar Info */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards */}
            <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', opacity: 0.9 }}>
                <TrendingUp size={18} />
                <h3 style={{ fontSize: '14px', fontWeight: '600' }}>RESUM FINANCER</h3>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>TOTAL FACTURAT</p>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>€{totalInvoiced.toFixed(2)}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>COBRAT</p>
                  <p style={{ fontWeight: '700' }}>€{paidInvoiced.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>PENDENT</p>
                  <p style={{ fontWeight: '700' }}>€{pendingInvoiced.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="card">
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--primary)" /> DADES DE CONTACTE
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Mail size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>EMAIL</p>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{client.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Phone size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>TELÈFON</p>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{client.telefon || 'No indicat'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={16} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>ADREÇA FISCAL</p>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', fontWeight: '500' }}>
                      {client.adreca}<br/>
                      {client.codi_postal} {client.ciutat}<br/>
                      {client.pais}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content: Invoice History */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px' }}>Historial de Factures</h3>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">NÚMERO</th>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">DATA EMISSIÓ</th>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">VENCIMENT</th>
                    <th style={{ padding: '1rem 1.5rem' }} className="label">ESTAT</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }} className="label">TOTAL</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }} className="label">ACCIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                          <FileText size={40} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Aquest client encara no té factures registrades.</p>
                      </td>
                    </tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700' }} className="mono">{inv.serie}-{inv.numero_Factura}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(inv.data_emissio).toLocaleDateString()}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(inv.data_venciment).toLocaleDateString()}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span className={`badge ${getStatusClass(inv.estat)}`}>
                          {inv.estat}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800' }}>€{parseFloat(inv.total).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="btn btn-ghost"
                          style={{ padding: '8px', color: 'var(--primary)' }}
                          title="Veure factura"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
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

export default ClientDetail;
