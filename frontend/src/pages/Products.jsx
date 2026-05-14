import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import Papa from 'papaparse';
import { Plus, Search, Tag, Edit2, Trash2, Loader2, Package, Upload, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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
    const timer = setTimeout(() => { fetchProducts(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/products', { params: { page, limit: 12, q: search } });
      setProducts(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (err) {
      toast.error('Error al carregar els productes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Estàs segur de que vols eliminar aquest producte?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Producte eliminat');
        fetchProducts(currentPage);
      } catch {
        toast.error('No es pot eliminar el producte perquè està sent usat en factures');
      }
    }
  };

  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PapaParse preview client-side, then send to server
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

        const toastId = toast.loading(`Important ${results.data.length} productes...`);

        const formData = new FormData();
        formData.append('csv', file);

        try {
          const response = await api.post('/products/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setImportResult(response.data);
          toast.success(response.data.message, { id: toastId, duration: 5000 });
          fetchProducts(1);
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
            <h1>Catàleg de Productes</h1>
            <p>Gestiona els teus serveis i productes.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => csvInputRef.current?.click()}
              className="btn btn-secondary"
              title="Importar productes des de CSV"
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
            <button onClick={() => navigate('/products/new')} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Plus size={20} /> Nou Producte
            </button>
          </div>
        </header>

        {/* CSV format hint */}
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--primary)' }}>
          💡 Format CSV per importar (separador <b>;</b>): <code>nom;descripcio;preu_unitari;tipus_iva</code> — el camp <b>tipus_iva</b> és opcional (per defecte: 21)
        </div>

        <div className="card" style={{ padding: '0 1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: '48px', border: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Cerca per nom o codi..."
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
            {products.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No s'han trobat productes.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {products.map((product) => (
                  <div key={product.id} className="card product-card" style={{ padding: '1.5rem', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)' }}>
                        <Tag size={24} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          className="btn btn-secondary"
                          style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', justifyContent: 'center' }}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn btn-danger"
                          style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', justifyContent: 'center' }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--primary)', fontWeight: '800' }}>€{parseFloat(product.preu_unitari).toFixed(2)}</h3>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.nom}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', minHeight: '3em' }}>{product.descripcio || 'Sense descripció'}</p>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      IVA: {parseFloat(product.tipus_iva)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchProducts} />
          </>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90vw', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Importació CSV — Productes</h3>
              {!csvImporting && (
                <button onClick={() => { setShowImportModal(false); setImportResult(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              )}
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
                  <CheckCircle2 size={20} /> {importResult.imported} productes importats correctament
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

export default Products;
