import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, Plus, Trash2, ArrowLeft, Loader2, Calendar, User, FileText, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

const NewInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const duplicateId = query.get('duplicate');

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defaultIva, setDefaultIva] = useState(21);

  const [invoice, setInvoice] = useState({
    serie: `F${new Date().getFullYear()}`,
    data_emissio: new Date().toISOString().split('T')[0],
    data_venciment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client_id: '',
    notes: '',
    estat: 'ESBORRANY',
    tipus_irpf: 0,
  });

  const [lines, setLines] = useState([
    { descripcio: '', quantitat: 1, preu_unitari: 0, tipus_iva: 21, subtotal: 0, import_iva: 0, total_linia: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClients, resProducts, resProfile] = await Promise.all([
          api.get('/clients', { params: { limit: 'all' } }),
          api.get('/products', { params: { limit: 'all' } }),
          api.get('/business/profile')
        ]);
        setClients(resClients.data.data || resClients.data || []);
        const fetchedProducts = resProducts.data.data || resProducts.data || [];
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        console.log('Products fetched:', fetchedProducts);
        
        if (resProfile.data && resProfile.data.iva_defecte) {
          const iva = parseFloat(resProfile.data.iva_defecte);
          setDefaultIva(iva);
          // If it's a fresh invoice (not a duplicate), update the first line's IVA
          if (!duplicateId) {
            setLines([{ descripcio: '', quantitat: 1, preu_unitari: 0, tipus_iva: iva, subtotal: 0, import_iva: 0, total_linia: 0 }]);
          }
        }

        if (duplicateId) {
          const resDup = await api.get(`/invoices/${duplicateId}`);
          const dup = resDup.data;
          setInvoice(prev => ({
            ...prev,
            client_id: dup.client_id,
            notes: dup.notes,
            serie: dup.serie,
            tipus_irpf: parseFloat(dup.tipus_irpf) || 0,
          }));
          setLines(dup.InvoiceLines.map(l => ({
            descripcio: l.descripcio,
            quantitat: parseFloat(l.quantitat),
            preu_unitari: parseFloat(l.preu_unitari),
            tipus_iva: parseFloat(l.tipus_iva),
            subtotal: parseFloat(l.subtotal),
            import_iva: parseFloat(l.import_iva),
            total_linia: parseFloat(l.total_linia)
          })));
          toast.success('Datos duplicados cargados', { id: 'dup-load' });
        } else if (resProfile.data) {
          const profile = resProfile.data;
          setInvoice(prev => ({ 
            ...prev, 
            serie: profile.serie_defecte || prev.serie,
            tipus_irpf: profile.irpf_defecte || 0
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [duplicateId]);

  const calculateLine = (line) => {
    const quantitat = parseFloat(line.quantitat) || 0;
    const preu_unitari = parseFloat(line.preu_unitari) || 0;
    const subtotal = quantitat * preu_unitari;
    const import_iva = subtotal * (line.tipus_iva / 100);
    const total_linia = subtotal + import_iva;
    return { ...line, subtotal, import_iva, total_linia };
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    newLines[index] = calculateLine(newLines[index]);
    setLines(newLines);
  };

  const handleProductSelect = (index, productId) => {
    if (!productId) return;
    const product = products.find(p => p.id === productId);
    if (product) {
      const newLines = [...lines];
      newLines[index].descripcio = product.nom;
      newLines[index].preu_unitari = parseFloat(product.preu_unitari);
      newLines[index].tipus_iva = parseFloat(product.tipus_iva);
      newLines[index] = calculateLine(newLines[index]);
      setLines(newLines);
    }
  };

  const addLine = () => {
    setLines([...lines, { descripcio: '', quantitat: 1, preu_unitari: 0, tipus_iva: defaultIva, subtotal: 0, import_iva: 0, total_linia: 0 }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== index));
  };

  const totals = lines.reduce((acc, current) => {
    const base = acc.base + current.subtotal;
    const iva = acc.iva + current.import_iva;
    return { base, iva };
  }, { base: 0, iva: 0 });

  const totalIrpf = totals.base * (invoice.tipus_irpf / 100);
  const totalFinal = totals.base + totals.iva - totalIrpf;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FRONTEND VALIDATION
    if (!invoice.client_id) {
      return toast.error('Has de seleccionar un client');
    }

    if (lines.length === 0) {
      return toast.error('La factura ha de tenir almenys una línia');
    }

    const invalidLines = lines.some(line => !line.descripcio || line.quantitat <= 0 || line.preu_unitari < 0);
    if (invalidLines) {
      return toast.error('Revisa les línies: descripció obligatòria, quantitat > 0 i preu >= 0');
    }

    setLoading(true);
    const toastId = toast.loading('Creando factura...');
    try {
      await api.post('/invoices', { ...invoice, lines });
      toast.success('Factura creada', { id: toastId });
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error en desar', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate('/invoices')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>{duplicateId ? 'Duplicar Factura' : 'Nova Factura'}</h1>
                <p>{duplicateId ? 'Creant una còpia...': 'Genera un nou document.'}</p>
              </div>
            </div>
          </header>

          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ minHeight: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <FileText size={20} color="var(--primary)" />
              <h3>Conceptes de la Factura ({products.length} productes carregats)</h3>
            </div>
            
            <div className="table-responsive" style={{ border: 'none', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '150px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }} className="label">CONCEPTE / PRODUCTE</th>
                        <th style={{ padding: '0.5rem', width: '80px' }} className="label">CANT.</th>
                        <th style={{ padding: '0.5rem', width: '110px' }} className="label">PRECIO</th>
                        <th style={{ padding: '0.5rem', width: '80px' }} className="label">IVA %</th>
                        <th style={{ padding: '0.5rem', width: '100px', textAlign: 'right' }} className="label">TOTAL</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <SearchableSelect
                                options={products.map(p => ({
                                  id: p.id,
                                  label: p.nom,
                                  sublabel: `€${parseFloat(p.preu_unitari).toFixed(2)}`
                                }))}
                                value=""
                                onChange={(val) => handleProductSelect(idx, val)}
                                placeholder="Cerca producte..."
                              />
                              <input 
                                className="input" 
                                required 
                                value={line.descripcio} 
                                onChange={e => handleLineChange(idx, 'descripcio', e.target.value)} 
                                placeholder="Descripción..." 
                              />
                            </div>
                          </td>
                          <td style={{ padding: '0.5rem', verticalAlign: 'bottom' }}>
                            <input className="input" type="number" step="0.01" required value={line.quantitat} onChange={e => handleLineChange(idx, 'quantitat', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', verticalAlign: 'bottom' }}>
                            <input className="input" type="number" step="0.01" required value={line.preu_unitari} onChange={e => handleLineChange(idx, 'preu_unitari', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', verticalAlign: 'bottom' }}>
                            <input className="input" type="number" required value={line.tipus_iva} onChange={e => handleLineChange(idx, 'tipus_iva', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '700', verticalAlign: 'bottom', paddingBottom: '15px' }}>
                            €{line.total_linia.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '10px' }}>
                            <button type="button" onClick={() => removeLine(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button type="button" onClick={addLine} className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}>
                  <Plus size={18} />
                  Afegir Línia
                </button>
              </div>

              <div className="card">
                <h3>Notas adicionales</h3>
                <textarea 
                  className="input" 
                  style={{ marginTop: '1rem', minHeight: '100px', resize: 'vertical' }} 
                  placeholder="Información adicional..."
                  value={invoice.notes}
                  onChange={e => setInvoice({...invoice, notes: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <User size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px' }}>Client</h3>
                </div>
                <SearchableSelect
                  options={clients.map(c => ({
                    id: c.id,
                    label: c.nom,
                    sublabel: c.nif
                  }))}
                  value={invoice.client_id}
                  onChange={(val) => setInvoice({...invoice, client_id: val})}
                  placeholder="Selecciona client..."
                />
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px' }}>Fechas y Serie</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span className="label">Serie</span>
                    <input className="input" style={{ marginTop: '4px' }} value={invoice.serie} onChange={e => setInvoice({...invoice, serie: e.target.value})} />
                  </div>
                  <div>
                    <span className="label">Fecha Emisión</span>
                    <input className="input" type="date" style={{ marginTop: '4px' }} value={invoice.data_emissio} onChange={e => setInvoice({...invoice, data_emissio: e.target.value})} />
                  </div>
                  <div>
                    <span className="label">Vencimiento</span>
                    <input className="input" type="date" style={{ marginTop: '4px' }} value={invoice.data_venciment} onChange={e => setInvoice({...invoice, data_venciment: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <FileText size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px' }}>Estado</h3>
                </div>
                <select 
                  className="input" 
                  required 
                  value={invoice.estat} 
                  onChange={e => setInvoice({...invoice, estat: e.target.value})}
                >
                  <option value="ESBORRANY">Esborrany</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="VENÇUDA">Vençuda</option>
                  <option value="CANCEL·LADA">Cancel·lada</option>
                </select>
              </div>

              <div className="card" style={{ background: 'var(--bg-app)', borderStyle: 'dashed' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '1rem' }}>Resumen</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Base Imponible</span>
                    <span>€{totals.base.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>IVA Total</span>
                    <span>€{totals.iva.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>IRPF (%)</span>
                    <input 
                      type="number" 
                      className="input" 
                      style={{ width: '80px', padding: '4px 8px', height: '32px', textAlign: 'right' }}
                      value={invoice.tipus_irpf}
                      onChange={e => setInvoice({ ...invoice, tipus_irpf: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  {totalIrpf > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                      <span>Retenció IRPF</span>
                      <span>-€{totalIrpf.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '1.1rem', fontWeight: '700' }}>
                    <span>TOTAL</span>
                    <span style={{ color: 'var(--primary)' }}>€{totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '12px 24px' }}>
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Desar Factura
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
};

export default NewInvoice;
