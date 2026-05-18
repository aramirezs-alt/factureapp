import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, FileText, Tag, Truck, Loader2, Paperclip, Trash2, MessageSquare, Info, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import OcrScanner from '../components/OcrScanner';
import SearchableSelect from '../components/SearchableSelect';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const [file, setFile] = useState(null);
  
  // Preview states
  const [filePreview, setFilePreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  
  const [savedPreviewUrl, setSavedPreviewUrl] = useState(null);
  const [savedPreviewType, setSavedPreviewType] = useState(null);
  const [savedPreviewLoading, setSavedPreviewLoading] = useState(false);

  const [expense, setExpense] = useState({
    descripcio: '', 
    base_imposable: 0,
    import_iva: 0,
    total: 0, 
    tipus_iva: 21,
    data_despesa: '',
    categoria: 'Otros',
    proveidor_id: '',
    periodicitat: 'CAP',
    adjunt_url: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProviders, resExpense] = await Promise.all([
          api.get('/providers'),
          api.get(`/expenses/${id}`)
        ]);
        setProviders(resProviders.data.data || resProviders.data || []);
        const data = resExpense.data;
        setExpense({
          ...data,
          base_imposable: data.import_net,
          import_iva: data.import_iva,
          data_despesa: new Date(data.data_despesa).toISOString().split('T')[0],
          notes: data.notes || ''
        });

        if (data.adjunt_url) {
          const urlStr = data.adjunt_url;
          const extension = urlStr.split('.').pop().toLowerCase();
          let type = 'other';
          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            type = 'image';
          } else if (extension === 'pdf') {
            type = 'pdf';
          }
          setSavedPreviewType(type);

          if (type === 'image' || type === 'pdf') {
            setSavedPreviewLoading(true);
            try {
              const resFile = await api.get(urlStr.replace(/.*\/uploads\//, '/uploads/'), { responseType: 'blob' });
              const blob = new Blob([resFile.data], { type: resFile.headers['content-type'] });
              const preview = window.URL.createObjectURL(blob);
              setSavedPreviewUrl(preview);
            } catch (err) {
              console.error('Error fetching preview:', err);
            } finally {
              setSavedPreviewLoading(false);
            }
          }
        }
      } catch (err) {
        toast.error('Error al carregar dades');
        navigate('/expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (savedPreviewUrl) {
        window.URL.revokeObjectURL(savedPreviewUrl);
      }
    };
  }, [savedPreviewUrl]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      setPreviewType(null);
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    let type = 'other';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
      type = 'image';
    } else if (extension === 'pdf') {
      type = 'pdf';
    }
    setPreviewType(type);

    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDownloadAttachment = async (e) => {
    e.preventDefault();
    if (!expense.adjunt_url) return;
    try {
      const toastId = toast.loading('Descarregant...');
      const response = await api.get(expense.adjunt_url.replace(/.*\/uploads\//, '/uploads/'), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', expense.adjunt_url.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.dismiss(toastId);
    } catch (err) {
      toast.error('Error al descarregar el document');
    }
  };

  const handleBaseChange = (val) => {
    const base = parseFloat(val) || 0;
    const ivaPct = parseFloat(expense.tipus_iva) || 0;
    const iva = base * (ivaPct / 100);
    const total = base + iva;
    setExpense({
      ...expense,
      base_imposable: val,
      import_iva: parseFloat(iva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  const handleTotalChange = (val) => {
    const total = parseFloat(val) || 0;
    const ivaPct = parseFloat(expense.tipus_iva) || 0;
    const base = total / (1 + ivaPct / 100);
    const iva = total - base;
    setExpense({
      ...expense,
      total: val,
      base_imposable: parseFloat(base.toFixed(2)),
      import_iva: parseFloat(iva.toFixed(2))
    });
  };

  const handleIvaPctChange = (val) => {
    const ivaPct = parseFloat(val) || 0;
    const base = parseFloat(expense.base_imposable) || 0;
    const iva = base * (ivaPct / 100);
    const total = base + iva;
    setExpense({
      ...expense,
      tipus_iva: val,
      import_iva: parseFloat(iva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  // Called by OcrScanner when user clicks "Aplicar" on detected OCR fields
  const handleOcrApply = (fields) => {
    setExpense(prev => {
      const next = { ...prev };
      if (fields.total !== undefined) {
        const total  = parseFloat(fields.total) || 0;
        const ivaPct = parseFloat(next.tipus_iva) || 21;
        const base   = total / (1 + ivaPct / 100);
        const iva    = total - base;
        next.total          = parseFloat(total.toFixed(2));
        next.base_imposable = parseFloat(base.toFixed(2));
        next.import_iva     = parseFloat(iva.toFixed(2));
      }
      if (fields.tipus_iva !== undefined) {
        const ivaPct = parseFloat(fields.tipus_iva) || 0;
        const base   = parseFloat(next.base_imposable) || 0;
        const iva    = base * (ivaPct / 100);
        next.tipus_iva  = ivaPct;
        next.import_iva = parseFloat(iva.toFixed(2));
        next.total      = parseFloat((base + iva).toFixed(2));
      }
      if (fields.data_despesa)                       next.data_despesa = fields.data_despesa;
      if (fields.comerciant && !next.descripcio)     next.descripcio   = fields.comerciant;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Actualitzant despesa...');
    
    const formData = new FormData();
    formData.append('descripcio', expense.descripcio);
    formData.append('total', expense.total);
    formData.append('tipus_iva', expense.tipus_iva);
    formData.append('import_net', expense.base_imposable);
    formData.append('import_iva', expense.import_iva);
    formData.append('data_despesa', expense.data_despesa);
    formData.append('categoria', expense.categoria);
    formData.append('proveidor_id', expense.proveidor_id);
    formData.append('periodicitat', expense.periodicitat);
    formData.append('notes', expense.notes || '');
    
    if (file) {
      formData.append('adjunt', file);
    }

    try {
      await api.put(`/expenses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Despesa actualitzada correctament', { id: toastId });
      navigate('/expenses');
    } catch (err) {
      toast.error('Error al actualitzar la despesa', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Estàs segur d\'eliminar aquesta despesa?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Despesa eliminada');
      navigate('/expenses');
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} /></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate('/expenses')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Editar Despesa</h1>
                <p>Modifica els detalls o afegeix el tiquet de compra.</p>
              </div>
            </div>
          </header>

          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                  <FileText size={20} />
                  <h3>Detalls del Registre</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label className="label">Concepte o Descripció</label>
                    <input required className="input" type="text" value={expense.descripcio} onChange={e => setExpense({...expense, descripcio: e.target.value})} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Base Imposable (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.base_imposable} onChange={e => handleBaseChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Tipus d'IVA (%)</label>
                      <input required className="input" type="number" value={expense.tipus_iva} onChange={e => handleIvaPctChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Import IVA (€)</label>
                      <input className="input" type="number" value={expense.import_iva} disabled style={{ background: 'var(--bg-app)', color: 'var(--text-secondary)', cursor: 'not-allowed', fontWeight: '600' }} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Import Total (amb IVA) (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.total} onChange={e => handleTotalChange(e.target.value)} style={{ fontWeight: '800', borderColor: 'var(--primary)', color: 'var(--primary)' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '13px' }}>
                        <Info size={16} />
                        <span>Pots introduir tant la <b>Base</b> com el <b>Total</b>; l'altre camp es calcularà automàticament.</span>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Data de la Despesa</label>
                      <input required className="input" type="date" value={expense.data_despesa} onChange={e => setExpense({...expense, data_despesa: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <MessageSquare size={20} />
                  <h3>Notes internes</h3>
                </div>
                <textarea 
                  className="input" 
                  style={{ minHeight: '100px', resize: 'vertical' }} 
                  placeholder="Informació addicional sobre la despesa..."
                  value={expense.notes}
                  onChange={e => setExpense({...expense, notes: e.target.value})}
                />
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Paperclip size={20} />
                  <h3>Tiquet / Comprovant</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Preview container (either saved or new file) */}
                  {(file || expense.adjunt_url) && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#F3F4F6', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {file ? 'Vista prèvia del nou tiquet seleccionat:' : 'Vista prèvia del tiquet actual guardat:'}
                      </span>
                      
                      {file ? (
                        /* Local Preview */
                        previewType === 'image' && filePreview ? (
                          <img 
                            src={filePreview} 
                            alt="Nou tiquet seleccionat" 
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                          />
                        ) : previewType === 'pdf' && filePreview ? (
                          <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <iframe 
                              src={filePreview} 
                              title="Nou PDF" 
                              style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Arxiu seleccionat no previsualitzable: {file.name}</span>
                        )
                      ) : (
                        /* Saved Preview from DB */
                        savedPreviewLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem' }}>
                            <Loader2 className="animate-spin" size={18} color="var(--primary)" />
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Carregant vista prèvia...</span>
                          </div>
                        ) : savedPreviewType === 'image' && savedPreviewUrl ? (
                          <img 
                            src={savedPreviewUrl} 
                            alt="Tiquet guardat" 
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', objectFit: 'contain', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            onClick={handleDownloadAttachment}
                            title="Fes clic per obrir o descarregar"
                          />
                        ) : savedPreviewType === 'pdf' && savedPreviewUrl ? (
                          <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <iframe 
                              src={savedPreviewUrl} 
                              title="PDF guardat" 
                              style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hi ha un document adjunt, format no previsualitzable.</span>
                            <button type="button" onClick={handleDownloadAttachment} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Obrir / Descarregar Document</button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">{expense.adjunt_url ? 'Reemplaçar arxiu' : 'Pujar arxiu (Foto o PDF)'}</label>
                    <input 
                      type="file" 
                      className="input" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setFile(e.target.files[0])}
                      style={{ padding: '0.5rem' }}
                    />
                  </div>

                  {/* OCR scanner – image also used as the new attachment */}
                  <OcrScanner
                    onApply={handleOcrApply}
                    onFileSelected={imgFile => setFile(imgFile)}
                    externalFile={file}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Truck size={20} />
                  <h3>Proveïdor</h3>
                </div>
                <SearchableSelect
                  options={providers.map(p => ({
                    id: p.id,
                    label: p.nom
                  }))}
                  value={expense.proveidor_id}
                  onChange={(val) => setExpense({...expense, proveidor_id: val})}
                  placeholder="Selecciona proveïdor..."
                />
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Tag size={20} />
                  <h3>Classificació</h3>
                </div>
                <select className="input" value={expense.categoria} onChange={e => setExpense({...expense, categoria: e.target.value})}>
                  <option value="Subministraments">Subministraments</option>
                  <option value="Lloguer">Lloguer</option>
                  <option value="Màrqueting">Màrqueting</option>
                  <option value="Software">Software</option>
                  <option value="Transport">Transport</option>
                  <option value="Menjars">Menjars</option>
                  <option value="Altres">Altres</option>
                </select>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Calendar size={20} />
                  <h3>Periodicitat</h3>
                </div>
                <select className="input" value={expense.periodicitat} onChange={e => setExpense({...expense, periodicitat: e.target.value})}>
                  <option value="CAP">Puntual (un sol cop)</option>
                  <option value="MENSUAL">Mensual (es repeteix cada mes)</option>
                  <option value="ANUAL">Anual (es repeteix cada any)</option>
                </select>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button type="submit" disabled={saving} className="btn btn-danger w-full" style={{ padding: '12px 24px' }}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Desar Canvis
                  </button>
                  <button type="button" onClick={handleDelete} className="btn btn-ghost w-full" style={{ color: 'var(--danger)', fontSize: '13px' }}>
                    <Trash2 size={18} /> Eliminar Despesa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditExpense;
