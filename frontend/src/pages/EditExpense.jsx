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
      } catch (err) {
        toast.error('Error al carregar dades');
        navigate('/expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
            <div className="flex gap-4 w-full md:w-auto">
              <button type="button" onClick={handleDelete} className="btn btn-ghost flex-1 md:flex-none" style={{ color: 'var(--danger)' }}>
                <Trash2 size={20} />
              </button>
              <button type="submit" disabled={saving} className="btn btn-danger flex-1 md:flex-none" style={{ padding: '12px 24px' }}>
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Guardar Canvis
              </button>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Base Imposable (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.base_imposable} onChange={e => handleBaseChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Tipus d'IVA (%)</label>
                      <input required className="input" type="number" value={expense.tipus_iva} onChange={e => handleIvaPctChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Import IVA (€)</label>
                      <input className="input" type="number" value={expense.import_iva} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} />
                    </div>
                    <div>
                      <label className="label">Import Total (amb IVA) (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.total} onChange={e => handleTotalChange(e.target.value)} style={{ fontWeight: 'bold' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '13px' }}>
                        <Info size={16} />
                        <span>Pots introduir tant la <b>Base</b> com el <b>Total</b>; l'altre camp es calcularà automàticament.</span>
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="label">Data de la Despesa</label>
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
                  {expense.adjunt_url && (
                    <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px' }}>Tiquet actual guardat</span>
                      <button type="button" onClick={handleDownloadAttachment} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Veure Tiquet</button>
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
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditExpense;
