import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { Plus, FileText, Search, Eye, Download, Copy, Share, Euro, Filter, Calendar, X, Mail, Loader2, FileDown, Send } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [searchParams] = useSearchParams();
  const initialEstat = searchParams.get('estat') || '';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(!!initialEstat);
  const [statusFilter, setStatusFilter] = useState(initialEstat);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Email Customizer Modal
  const [profile, setProfile] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/business/profile');
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

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

  const getHtmlEmailContent = () => {
    if (!selectedInvoice) return '';
    const invoiceName = `${selectedInvoice.serie}-${selectedInvoice.numero_Factura}`;
    const businessName = profile?.nom_negoci || 'TronDisc Solucions Digitals';
    const formattedMessage = mailMessage.replace(/\n/g, '<br/>');
    
    return `
      <div style="background-color:#f3f4f6; padding: 40px 20px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#1f2937;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${businessName}</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Document Comercial Oficial</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Hola ${selectedInvoice.Client?.nom},</h2>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">${formattedMessage}</p>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Detalls de la Factura</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Número de Factura:</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 700;">${invoiceName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Data d'Emissió:</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 600;">${new Date(selectedInvoice.data_emissio).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Data de Venciment:</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 600;">${new Date(selectedInvoice.data_venciment).toLocaleDateString()}</td>
                </tr>
                <tr style="border-top: 1px dashed #e5e7eb;">
                  <td style="padding: 16px 0 0 0; color: #111827; font-weight: 800; font-size: 16px;">TOTAL NET:</td>
                  <td style="padding: 16px 0 0 0; text-align: right; color: #2563eb; font-weight: 900; font-size: 24px;">€${parseFloat(selectedInvoice.total).toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="display: flex; align-items: center; background-color: #eff6ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
              <span style="font-size: 20px; margin-right: 12px;">📎</span>
              <span style="font-size: 14px; color: #1e40af; font-weight: 600;">S'ha adjuntat el PDF de la factura a aquest correu.</span>
            </div>
            
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #6b7280; font-weight: 500;">Cordialment,</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">${businessName}</p>
          </div>
          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 8px 0;">Aquest és un correu automàtic de facturació.</p>
            <p style="margin: 0;">© 2026 ${businessName}. Tots els drets reservats.</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleQuickSend = (id) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    if (!inv.Client?.email) {
      return toast.error('El client no té email configurat');
    }
    const invoiceName = `${inv.serie}-${inv.numero_Factura}`;
    const businessName = profile?.nom_negoci || 'TronDisc Solucions Digitals';
    
    setSelectedInvoice(inv);
    setMailSubject(`Factura ${invoiceName} - ${businessName}`);
    setMailMessage(`Hola ${inv.Client?.nom || ''},\n\nUs adjuntem en aquest correu la factura corresponent als darrers serveis i productes prestats.\n\nSi us plau, reviseu els detalls adjunts i no dubteu a respondre directament a aquest correu en cas de tenir qualsevol pregunta.\n\nAtentament,`);
    setRecipientEmail(inv.Client?.email);
    setIsMailModalOpen(true);
  };

  const sendEmailApi = async () => {
    if (!selectedInvoice) return;
    setSending(true);
    const toastId = toast.loading('Enviant factura personalitzada...');
    try {
      const emailHtml = getHtmlEmailContent();
      await api.post(`/invoices/${selectedInvoice.id}/send`, {
        subject: mailSubject,
        html: emailHtml
      });
      toast.success('Factura enviada correctament', { id: toastId });
      setIsMailModalOpen(false);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar la factura', { id: toastId });
    } finally {
      setSending(false);
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
            <h1>Factures</h1>
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
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Estado</label>
                <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">Tots els estats</option>
                  <option value="PENDENTS">Pendents de Cobrar</option>
                  <option value="ESBORRANY">Esborrany</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="VENÇUDA">Vençuda</option>
                  <option value="CANCEL·LADA">Cancel·lada</option>
                </select>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rango de Importe</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="Mín" className="input" value={minAmount} onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }} style={{ minWidth: 0 }} />
                  <input type="number" placeholder="Máx" className="input" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }} style={{ minWidth: 0 }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rango de Fechas</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="date" className="input" value={fromDate} onChange={e => { setFromDate(e.target.value); setCurrentPage(1); }} style={{ minWidth: 0 }} />
                  <input type="date" className="input" value={toDate} onChange={e => { setToDate(e.target.value); setCurrentPage(1); }} style={{ minWidth: 0 }} />
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
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{inv.Client?.nom || 'Client desconocido'}</td>
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

      <Modal 
        isOpen={isMailModalOpen} 
        onClose={() => setIsMailModalOpen(false)} 
        title="Enviar Factura Personalitzada" 
        width="1100px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', minHeight: '500px' }}>
          
          {/* Left Column: Editor Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
              Personalitza el correu que rebrà el teu client. S'adjuntarà automàticament el PDF de la factura.
            </p>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Destinatari
              </label>
              <input 
                type="email" 
                className="input" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)} 
                placeholder="correu@client.com"
                style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assumpte del Correu
              </label>
              <input 
                type="text" 
                className="input" 
                value={mailSubject} 
                onChange={(e) => setMailSubject(e.target.value)} 
                placeholder="Assumpte"
                style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border)' }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Missatge del Correu
              </label>
              <textarea 
                className="input" 
                value={mailMessage} 
                onChange={(e) => setMailMessage(e.target.value)} 
                placeholder="Escriu el teu missatge aquí..."
                rows={8}
                style={{ 
                  width: '100%', 
                  flex: 1, 
                  background: 'var(--bg-app)', 
                  border: '1px solid var(--border)', 
                  resize: 'none', 
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  padding: '12px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => setIsMailModalOpen(false)} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel·lar
              </button>
              <button 
                onClick={sendEmailApi} 
                disabled={sending}
                className="btn btn-primary" 
                style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Enviar Factura
              </button>
            </div>
          </div>

          {/* Right Column: Live Premium Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px', fontWeight: '600' }}>Vista Prèvia del Correu Rebut</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', background: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem 1rem' }}>
              <div style={{ maxWidth: '500px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', fontFamily: 'sans-serif', color: '#1f2937' }}>
                
                {/* Header Gradient */}
                <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', padding: '24px', textAlign: 'center', color: '#ffffff' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>{profile?.nom_negoci || 'TronDisc Solucions Digitals'}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.8 }}>Document Comercial Oficial</p>
                </div>
                
                {/* Email Body */}
                <div style={{ padding: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Hola {selectedInvoice?.Client?.nom || 'Client'},</h4>
                  <p style={{ margin: '0 0 20px 0', color: '#4b5563', whiteSpace: 'pre-wrap' }}>{mailMessage}</p>
                  
                  {/* Styled Invoice Details Box */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detalls de la Factura</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Número de Factura:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '700' }}>{selectedInvoice?.serie}-{selectedInvoice?.numero_Factura}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Data d'Emissió:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '600' }}>{selectedInvoice ? new Date(selectedInvoice.data_emissio).toLocaleDateString() : ''}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Data de Venciment:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '600' }}>{selectedInvoice ? new Date(selectedInvoice.data_venciment).toLocaleDateString() : ''}</td>
                        </tr>
                        <tr style={{ borderTop: '1px dashed #e5e7eb' }}>
                          <td style={{ padding: '12px 0 0 0', color: '#111827', fontWeight: '800' }}>TOTAL NET:</td>
                          <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '18px' }}>€{selectedInvoice ? parseFloat(selectedInvoice.total).toFixed(2) : '0.00'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Attachment Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#eff6ff', borderRadius: '6px', padding: '8px 12px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>📎</span>
                    <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>S'ha adjuntat el PDF de la factura a aquest correu.</span>
                  </div>

                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>Cordialment,</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>{profile?.nom_negoci || 'TronDisc Solucions Digitals'}</p>
                </div>
                
                {/* Footer */}
                <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '10px' }}>
                  <p style={{ margin: '0 0 4px 0' }}>Aquest és un correu automàtic de facturació.</p>
                  <p style={{ margin: 0 }}>© 2026 {profile?.nom_negoci || 'TronDisc Solucions Digitals'}. Tots els drets reservats.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Modal>
    </Layout>
  );
};

export default Invoices;
