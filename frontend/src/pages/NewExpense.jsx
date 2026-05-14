import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, FileText, Tag, Truck, Loader2, Paperclip, MessageSquare, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import OcrScanner from '../components/OcrScanner';

const NewExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [file, setFile] = useState(null);
  const [expense, setExpense] = useState({
    descripcio: '', 
    base_imposable: 0,
    import_iva: 0,
    total: 0, 
    tipus_iva: 21,
    data_despesa: new Date().toISOString().split('T')[0],
    categoria: 'Otros',
    proveidor_id: '',
    periodicitat: 'CAP',
    notes: ''
  });

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const duplicateId = query.get('duplicate');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/providers', { params: { limit: 'all' } });
        setProviders(response.data.data);

        if (duplicateId) {
          const resExp = await api.get(`/expenses/${duplicateId}`);
          const data = resExp.data;
          setExpense({
            descripcio: `${data.descripcio} (Còpia)`,
            base_imposable: data.import_net,
            import_iva: data.import_iva,
            total: data.total,
            tipus_iva: data.tipus_iva,
            data_despesa: new Date().toISOString().split('T')[0], // Reset date to today
            categoria: data.categoria,
            proveidor_id: data.proveidor_id || '',
            periodicitat: data.periodicitat || 'CAP',
            notes: data.notes || ''
          });
          toast.success('Dades de despesa copiades');
        }
      } catch (err) {
        toast.error('Error al carregar dades');
      }
    };
    fetchData();
  }, [duplicateId]);

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
    if (parseFloat(expense.total) <= 0) return toast.error('L\'import ha de ser superior a 0');
    
    setLoading(true);
    const toastId = toast.loading('Registrant despesa...');
    
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
      await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Despesa registrada correctament', { id: toastId });
      navigate('/expenses');
    } catch (err) {
      toast.error('Error al registrar la despesa', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="button" onClick={() => navigate('/expenses')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Registrar Despesa</h1>
                <p>Introdueix els detalls de la teva compra o factura de proveïdor.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-danger" style={{ padding: '12px 24px' }}>
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Confirmar Despesa
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                  <FileText size={20} />
                  <h3>Detalls del Registre</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Concepte o Descripció</label>
                    <input required className="input" type="text" value={expense.descripcio} onChange={e => setExpense({...expense, descripcio: e.target.value})} placeholder="Ex: Compra material oficina" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Base Imposable (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.base_imposable} onChange={e => handleBaseChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Tipus d'IVA (%)</label>
                      <input required className="input" type="number" value={expense.tipus_iva} onChange={e => handleIvaPctChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Import IVA (€)</label>
                      <input className="input" type="number" value={expense.import_iva} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} />
                    </div>
                    <div>
                      <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Import Total (amb IVA) (€)</label>
                      <input required className="input" type="number" step="0.01" value={expense.total} onChange={e => handleTotalChange(e.target.value)} style={{ fontWeight: 'bold' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '13px' }}>
                        <Info size={16} />
                        <span>Pots introduir tant la <b>Base</b> com el <b>Total</b>; l'altre camp es calcularà automàticament.</span>
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Data de la Despesa</label>
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
                  <h3>Adjuntar Document (Opcional)</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="label" style={{ display: 'block' }}>Factura o Tiquet (PDF, JPG, PNG)</label>
                  <input 
                    type="file" 
                    className="input" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ padding: '0.5rem' }}
                  />
                  {file && <span style={{ fontSize: '13px', color: 'var(--secondary)' }}>Arxiu seleccionat: {file.name}</span>}

                  {/* OCR scanner – image is also used as the attachment */}
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
                <select 
                  className="input" 
                  value={expense.proveidor_id} 
                  onChange={e => setExpense({...expense, proveidor_id: e.target.value})}
                >
                  <option value="">Seleccionar proveïdor...</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Tag size={20} />
                  <h3>Classificació</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Categoria</label>
                    <select className="input" value={expense.categoria} onChange={e => setExpense({...expense, categoria: e.target.value})}>
                      <option value="Subministraments">Subministraments (Llum, Aigua, Internet)</option>
                      <option value="Lloguer">Lloguer de Local / Oficina</option>
                      <option value="Màrqueting">Publicitat i Màrqueting</option>
                      <option value="Software">Eines i Programari</option>
                      <option value="Transport">Transport i Viatges</option>
                      <option value="Menjars">Menjars i Dietes</option>
                      <option value="Altres">Altres despeses</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Periodicitat</label>
                    <select className="input" value={expense.periodicitat} onChange={e => setExpense({...expense, periodicitat: e.target.value})}>
                      <option value="CAP">Puntual (un sol cop)</option>
                      <option value="MENSUAL">Mensual (es repeteix cada mes)</option>
                      <option value="ANUAL">Anual (es repeteix cada any)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewExpense;
