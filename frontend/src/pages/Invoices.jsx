import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { Plus, FileText, Search, Eye, Download, Copy, Share, Euro, Filter, Calendar, X, Mail, Loader2, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const navigate = useNavigate();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        q: search,
        estat: statusFilter,
        minAmount,
        maxAmount,
        fromDate,
        toDate
      };
      
      const response = await api.get('/invoices', { params });
      setInvoices(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, minAmount, maxAmount, fromDate, toDate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchInvoices]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      toast.loading('Generant PDF...', { id: 'pdf-toast' });
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF descarregat correctament', { id: 'pdf-toast' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Si és un error de blob, intentem llegir-lo com a JSON
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        const errorJson = JSON.parse(text);
        toast.error(errorJson.message || 'Error al descarregar el PDF', { id: 'pdf-toast' });
      } else {
        toast.error('Error al generar el PDF', { id: 'pdf-toast' });
      }
    }
  };

  const handleQuickSend = async (id) => {
    const toastId = toast.loading('Enviando factura...');
    try {
      await api.post(`/invoices/${id}/send`);
      toast.success('Factura enviada por email', { id: toastId });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar email', { id: toastId });
    }
  };

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

  const handleStatusChange = async (id, newStatus) => {
    const toastId = toast.loading('Actualitzant estat...');
    try {
      await api.patch(`/invoices/${id}/status`, { estat: newStatus });
      toast.success('Estat actualitzat', { id: toastId });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualitzar estat', { id: toastId });
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
    setSearch('');
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    const toastId = toast.loading('Exportant factures...');
    try {
      const response = await api.get('/invoices/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV descarregat', { id: toastId });
    } catch (err) {
      toast.error('Error exportant el CSV', { id: toastId });
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ 
          display: 'flex', 
          flexDirection: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'flex-start' : 'center', 
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <div>
            <h1>Facturas</h1>
            <p>Historial completo de tus ventas y estados de cobro.</p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            width: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : 'auto'
          }}>
            <button onClick={handleExportCSV} className="btn btn-secondary" style={{ flex: 1 }} title="Exportar llistat a CSV">
              <FileDown size={18} /> <span style={{ display: typeof window !== 'undefined' && window.innerWidth <= 480 ? 'none' : 'inline' }}>Exportar</span> CSV
            </button>
            <button onClick={() => navigate('/invoices/new')} className="btn btn-primary" style={{ flex: 1, padding: '12px 24px' }}>
              <Plus size={20} /> Crear Factura
            </button>
          </div>
        </header>

        {/* Search & Filter Toggle */}
        <div style={{ 
          display: 'flex', 
          flexDirection: typeof window !== 'undefined' && window.innerWidth <= 640 ? 'column' : 'row',
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div className="card" style={{ flex: 1, padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: '44px', margin: 0 }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Buscar por número o cliente..." 
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
            style={{ height: '44px', padding: '0 20px', width: typeof window !== 'undefined' && window.innerWidth <= 640 ? '100%' : 'auto' }}
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Filtros'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card animate-fade-in" style={{ marginBottom: '1.5rem', background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Estado</label>
                <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }}>
                  <option value="">Tots els estats</option>
                  <option value="ESBORRANY">Esborrany</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="VENÇUDA">Vençuda</option>
                  <option value="CANCEL·LADA">Cancel·lada</option>
                </select>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rango de Importe</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" placeholder="Mín" className="input" value={minAmount} onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                  <input type="number" placeholder="Máx" className="input" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rango de Fechas</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="date" className="input" value={fromDate} onChange={e => { setFromDate(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                  <input type="date" className="input" value={toDate} onChange={e => { setToDate(e.target.value); setCurrentPage(1); }} style={{ height: '38px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} className="btn btn-ghost" style={{ color: 'var(--danger)', fontSize: '13px', padding: '0', width: '100%', justifyContent: 'flex-start' }}>
                  <X size={16} /> Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }} className="label">NÚMERO</th>
                <th style={{ padding: '1rem' }} className="label">CLIENTE</th>
                <th style={{ padding: '1rem' }} className="label">EMISIÓN</th>
                <th style={{ padding: '1rem' }} className="label">TOTAL</th>
                <th style={{ padding: '1rem' }} className="label">ESTADO</th>
                <th style={{ padding: '1rem', textAlign: 'right' }} className="label">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{marginInline: 'auto'}} /></td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No se encontraron facturas con los criterios seleccionados.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const invoiceFullNumber = `${inv.serie}-${inv.numero_Factura}`;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                      <td style={{ padding: '1rem', fontWeight: '600' }} className="mono">{invoiceFullNumber}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{inv.Client?.nom || 'Cliente desconocido'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(inv.data_emissio).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', fontWeight: '700' }}>€{parseFloat(inv.total).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className={`badge ${getStatusClass(inv.estat)}`}
                          value={inv.estat}
                          onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                          style={{ 
                            border: 'none', 
                            cursor: 'pointer', 
                            outline: 'none',
                            fontWeight: '600',
                            padding: '4px 8px',
                            appearance: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <option value="ESBORRANY">ESBORRANY</option>
                          <option value="ENVIADA">ENVIADA</option>
                          <option value="PAGADA">PAGADA</option>
                          <option value="VENÇUDA">VENÇUDA</option>
                          <option value="CANCEL·LADA">CANCEL·LADA</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => navigate(`/invoices/${inv.id}`)} title="Ver detalle" className="btn btn-ghost" style={{ padding: '6px' }}>
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleQuickSend(inv.id)} title="Enviar por Email" className="btn btn-ghost" style={{ padding: '6px', color: 'var(--primary)' }}>
                            <Mail size={18} />
                          </button>
                          <button onClick={() => handleDownloadPDF(inv.id, invoiceFullNumber)} title="Descargar PDF" className="btn btn-ghost" style={{ padding: '6px' }}>
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    </Layout>
  );
};

export default Invoices;
