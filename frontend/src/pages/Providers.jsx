import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Tag, Eye, Loader2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Providers = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProviders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/providers', {
        params: {
          page,
          limit: 12,
          q: search
        }
      });
      setProviders(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error al carregar els proveïdors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Estàs segur de que vols eliminar aquest proveïdor?')) {
      try {
        await api.delete(`/providers/${id}`);
        toast.success('Proveïdor eliminat');
        fetchProviders(currentPage);
      } catch (error) {
        toast.error('Error al eliminar el proveïdor');
      }
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Proveïdors</h1>
            <p>Gestiona els teus contactes de subministraments i serveis externs.</p>
          </div>
          <button 
            onClick={() => navigate('/providers/new')}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <Plus size={20} />
            Nou Proveïdor
          </button>
        </header>

        <div className="card" style={{ padding: '0 1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: '48px', border: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Cerca per nom, NIF o email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '14px' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
          </div>
        ) : (
          <>
            {providers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
                <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No s'han trobat proveïdors.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {providers.map((provider) => (
                  <div key={provider.id} className="card provider-card" style={{ padding: '1.5rem', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {provider.nom.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => navigate(`/providers/${provider.id}`)}
                          className="btn btn-ghost"
                          style={{ padding: '8px' }}
                          title="Veure historial"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/providers/${provider.id}/edit`)}
                          className="btn btn-ghost"
                          style={{ padding: '8px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(provider.id)}
                          className="btn btn-ghost"
                          style={{ padding: '8px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '18px', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{provider.nom}</h3>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span className="badge badge-draft" style={{ fontSize: '11px', background: '#F3F4F6', color: '#374151' }}>
                        <Tag size={10} style={{ marginRight: '4px' }} />
                        {provider.categoria}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {provider.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {provider.telefon || 'Sense telèfon'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> {provider.adreca}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={fetchProviders}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Providers;
