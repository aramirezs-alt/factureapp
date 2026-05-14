import React, { useState, useEffect, useCallback } from 'react';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { Plus, TrendingDown, Eye, Download, Edit, Trash2, Loader2, Calendar, Tag, Truck, Search, Filter, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Filtros
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [providerFilter, setProviderFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');


  const fetchProviders = async () => {
    try {
      const response = await api.get('/providers', { params: { limit: 'all' } });
      setProviders(response.data.data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        q: search,
        proveidor_id: providerFilter,
        minAmount,
        maxAmount,
        fromDate,
        toDate,
        categoria: categoryFilter
      };
      const response = await api.get('/expenses', { params });
      setExpenses(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error al carregar les despeses');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, providerFilter, minAmount, maxAmount, fromDate, toDate, categoryFilter]);


  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Estàs segur d\'eliminar aquesta despesa?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Despesa eliminada');
      fetchExpenses();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = { fromDate, toDate, categoria: categoryFilter };
      const response = await api.get('/expenses/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'despeses.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exportat');
    } catch (err) {
      toast.error('Error al exportar CSV');
    }
  };

  const handleDownloadAttachment = async (urlStr, e) => {
    e.preventDefault();
    try {
      const toastId = toast.loading('Descarregant...');
      const response = await api.get(urlStr.replace(/.*\/uploads\//, '/uploads/'), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', urlStr.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.dismiss(toastId);
    } catch (err) {
      toast.error('Error al descarregar el document');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setProviderFilter('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Despeses</h1>
            <p>Controla les teves compres i factures de proveïdors.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '12px 24px' }}>
              <Download size={20} /> Exportar CSV
            </button>
            <button onClick={() => navigate('/expenses/new')} className="btn btn-danger" style={{ padding: '12px 24px' }}>
              <Plus size={20} /> Registrar Despesa
            </button>
          </div>
        </header>

        {/* Search & Filter Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ flex: 1, padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: '44px', margin: 0 }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Cerca per concepte o proveïdor..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: '44px', padding: '0 20px' }}
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtres' : 'Filtres'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card animate-fade-in" style={{ marginBottom: '1.5rem', background: '#F9FAFB', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Proveïdor</label>
                <select 
                  className="input" 
                  value={providerFilter} 
                  onChange={e => { setProviderFilter(e.target.value); setCurrentPage(1); }} 
                  style={{ height: '38px' }}
                >
                  <option value="">Tots els proveïdors</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rang d'Import</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" placeholder="Mín" className="input" value={minAmount} onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                  <input type="number" placeholder="Máx" className="input" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Dates</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="date" className="input" value={fromDate} onChange={e => { setFromDate(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                  <input type="date" className="input" value={toDate} onChange={e => { setToDate(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Categoria</label>
                <select 
                  className="input" 
                  value={categoryFilter} 
                  onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                  style={{ height: '38px', width: '100%' }}
                >
                  <option value="">Totes les categories</option>
                  <option value="Compres">Compres</option>
                  <option value="Serveis Exteriors">Serveis Exteriors</option>
                  <option value="Subministraments">Subministraments</option>
                  <option value="Dietes i Viatges">Dietes i Viatges</option>
                  <option value="Personal">Personal</option>
                  <option value="Tributs">Tributs</option>
                  <option value="Altres">Altres</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} className="btn btn-ghost" style={{ color: 'var(--danger)', fontSize: '13px', padding: '0' }}>
                  <X size={16} /> Netejar filtres
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }} className="label">CONCEPTE</th>
                <th style={{ padding: '1rem' }} className="label">PROVEÏDOR</th>
                <th style={{ padding: '1rem' }} className="label">DATA</th>
                <th style={{ padding: '1rem' }} className="label">CATEGORIA</th>
                <th style={{ padding: '1rem', textAlign: 'right' }} className="label">TOTAL</th>
                <th style={{ padding: '1rem', textAlign: 'right' }} className="label">ACCIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{marginInline: 'auto'}} /></td></tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <TrendingDown size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No s'han trobat despeses amb aquests criteris.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{exp.descripcio}</td>
                    <td style={{ padding: '1rem' }}>{exp.Provider?.nom || 'Sense proveïdor'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(exp.data_despesa).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-draft">{exp.categoria}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'var(--danger)' }}>
                      -€{parseFloat(exp.total).toFixed(2)}
                    </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {exp.adjunt_url && (
                            <button 
                              type="button"
                              onClick={(e) => handleDownloadAttachment(exp.adjunt_url, e)} 
                              title="Veure tiquet" 
                              className="btn btn-ghost" 
                              style={{ padding: '6px' }}
                            >
                              <Download size={18} />
                            </button>
                          )}
                        <button onClick={() => navigate(`/expenses/${exp.id}`)} title="Veure Detalls" className="btn btn-ghost" style={{ padding: '6px' }}>
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/expenses/new?duplicate=${exp.id}`)} 
                          title="Duplicar Despesa" 
                          className="btn btn-ghost" 
                          style={{ padding: '6px', color: 'var(--secondary)' }}
                        >
                          <Copy size={18} />
                        </button>
                        <button onClick={() => navigate(`/expenses/${exp.id}/edit`)} title="Editar" className="btn btn-ghost" style={{ padding: '6px' }}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} title="Eliminar" className="btn btn-ghost" style={{ padding: '6px', color: 'var(--danger)' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={page => setCurrentPage(page)} 
        />
      </div>
    </Layout>
  );
};

export default Expenses;
