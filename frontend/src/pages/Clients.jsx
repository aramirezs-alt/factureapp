import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import Papa from 'papaparse';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Eye, User, Loader2, Upload, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // CSV Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const csvInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => { fetchClients(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/clients', { params: { page, limit: 12, q: search } });
      setClients(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Error al carregar els clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Estàs segur de que vols eliminar aquest client?')) {
      try {
        await api.delete(`/clients/${id}`);
        toast.success('Client eliminat');
        fetchClients(currentPage);
      } catch {
        toast.error('No es pot eliminar el client perquè té factures associades');
      }
    }
  };

  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PapaParse preview: parse client-side to validate before sending
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          toast.error('El fitxer CSV és buit');
          return;
        }

        setShowImportModal(true);
        setCsvImporting(true);
        setImportResult(null);

        const toastId = toast.loading(`Important ${results.data.length} clients...`);

        // Send the raw file to the backend for server-side processing
        const formData = new FormData();
        formData.append('csv', file);

        try {
          const response = await api.post('/clients/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setImportResult(response.data);
          toast.success(response.data.message, { id: toastId, duration: 5000 });
          fetchClients(1);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error important el CSV', { id: toastId });
          setImportResult({ imported: 0, errors: [{ error: err.response?.data?.message || 'Error desconegut' }] });
        } finally {
          setCsvImporting(false);
          if (csvInputRef.current) csvInputRef.current.value = '';
        }
      },
      error: () => toast.error('Error llegint el fitxer CSV')
    });
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Clients</h1>
            <p>Gestiona la teva cartera de clients i les seves dades.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => csvInputRef.current?.click()}
              className="btn btn-secondary"
              title="Importar clients des de CSV"
            >
              <Upload size={18} /> Importar CSV
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleCSVFile}
            />
            <button onClick={() => navigate('/clients/new')} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Plus size={20} /> Nou Client
            </button>
          </div>
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
            {clients.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
                <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No s'han trobat clients.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {clients.map((client) => (
                  <div key={client.id} className="card client-card" style={{ padding: '1.5rem', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DBEAFE', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {client.nom.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => navigate(`/clients/${client.id}`)} className="btn btn-ghost" style={{ padding: '8px' }} title="Veure historial"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/clients/${client.id}/edit`)} className="btn btn-ghost" style={{ padding: '8px' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(client.id)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '18px', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.nom}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontWeight: '600' }}>{client.nif}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {client.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {client.telefon || 'Sense telèfon'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> {client.ciutat}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchClients} />
          </>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90vw', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Importació CSV</h3>
              {!csvImporting && <button onClick={() => { setShowImportModal(false); setImportResult(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>}
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border)' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>💡 Format requerit (separador ;):</p>
              <code>nom;email;nif;telefon;adreca;codi_postal;ciutat;pais</code>
            </div>


            {csvImporting && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                <p>Processant importació...</p>
              </div>
            )}

            {importResult && !csvImporting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: '600' }}>
                  <CheckCircle2 size={20} /> {importResult.imported} clients importats correctament
                </div>
                {importResult.errors?.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontWeight: '600' }}>
                      <AlertTriangle size={20} /> {importResult.errors.length} errors
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                      {importResult.errors.map((err, i) => (
                        <div key={i} style={{ marginBottom: '0.5rem', color: 'var(--danger)' }}>
                          <b>Fila {err.row}:</b> {err.error}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => { setShowImportModal(false); setImportResult(null); }} className="btn btn-primary">
                  Tancar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Clients;
