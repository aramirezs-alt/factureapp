import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Truck, 
  Tag, 
  Loader2, 
  Edit, 
  Trash2, 
  Paperclip,
  MessageSquare,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image', 'pdf', or 'other'
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchExpense = async () => {
    try {
      const response = await api.get(`/expenses/${id}`);
      setExpense(response.data);

      if (response.data.adjunt_url) {
        const urlStr = response.data.adjunt_url;
        const extension = urlStr.split('.').pop().toLowerCase();
        let type = 'other';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
          type = 'image';
        } else if (extension === 'pdf') {
          type = 'pdf';
        }
        setPreviewType(type);

        if (type === 'image' || type === 'pdf') {
          setPreviewLoading(true);
          try {
            const resFile = await api.get(urlStr.replace(/.*\/uploads\//, '/uploads/'), { responseType: 'blob' });
            const blob = new Blob([resFile.data], { type: resFile.headers['content-type'] });
            const preview = window.URL.createObjectURL(blob);
            setPreviewUrl(preview);
          } catch (err) {
            console.error('Error fetching preview:', err);
          } finally {
            setPreviewLoading(false);
          }
        }
      }
    } catch (err) {
      toast.error('Error al carregar la despesa');
      navigate('/expenses');
    } finally {
      setLoading(false);
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

  const handleDownloadAttachment = async () => {
    try {
      if (previewUrl) {
        // If we already have the object URL, we can download it directly!
        const link = document.createElement('a');
        link.href = previewUrl;
        link.setAttribute('download', expense.adjunt_url.split('/').pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
      const toastId = toast.loading('Descarregant fitxer...');
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

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0' }}>
        <Loader2 className="animate-spin" size={48} color="var(--danger)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregant detalls de la despesa...</p>
      </div>
    </Layout>
  );

  if (!expense) return null;

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/expenses')} className="btn btn-ghost" style={{ padding: '8px' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0 }}>Detall de Despesa</h1>
              <p style={{ margin: '4px 0 0 0' }}>Vista de lectura del registre de compra.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate(`/expenses/${expense.id}/edit`)} 
              className="btn btn-secondary" 
              style={{ padding: '10px 18px' }}
            >
              <Edit size={18} />
              Editar Despesa
            </button>
            <button 
              onClick={handleDelete} 
              className="btn btn-ghost" 
              style={{ padding: '10px 18px', color: 'var(--danger)' }}
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Main Info Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Informació General</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '4px' }}>CONCEPTE</p>
                <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{expense.descripcio}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p className="label" style={{ marginBottom: '4px' }}>DATA</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color="var(--text-secondary)" />
                    <p style={{ fontWeight: '500', margin: 0 }}>{new Date(expense.data_despesa).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="label" style={{ marginBottom: '4px' }}>CATEGORIA</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="var(--text-secondary)" />
                    <span className="badge badge-draft">{expense.categoria}</span>
                  </div>
                </div>
              </div>

              {expense.periodicitat && expense.periodicitat !== 'CAP' && (
                <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Gasto Recurrent: {expense.periodicitat}</span>
                </div>
              )}
            </div>
          </div>

          {/* Provider Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Truck size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Proveïdor</h3>
            </div>
            
            {expense.Provider ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{expense.Provider.nom}</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>NIF: {expense.Provider.nif}</p>
                <button 
                  onClick={() => navigate(`/providers/${expense.Provider.id}`)}
                  className="btn btn-ghost" 
                  style={{ width: 'fit-content', padding: '4px 0', fontSize: '13px', color: 'var(--primary)' }}
                >
                  Veure perfil del proveïdor →
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sense proveïdor assignat.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Attachment Section */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Paperclip size={20} />
                <h3 style={{ margin: 0 }}>Tiquet / Comprovant</h3>
              </div>
              
              {expense.adjunt_url ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {previewLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2rem' }}>
                        <Loader2 className="animate-spin" size={24} color="var(--primary)" />
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Carregant vista prèvia...</span>
                      </div>
                    ) : previewType === 'image' && previewUrl ? (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#F3F4F6', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <img 
                          src={previewUrl} 
                          alt="Tiquet o comprovant" 
                          style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '6px', objectFit: 'contain', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          onClick={() => window.open(previewUrl, '_blank')}
                          title="Fes clic per obrir a mida completa"
                        />
                      </div>
                    ) : previewType === 'pdf' && previewUrl ? (
                      <div style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <iframe 
                          src={previewUrl} 
                          title="Vista prèvia de PDF" 
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '14px', margin: '0 0 1rem 0' }}>Hi ha un fitxer adjunt per a aquesta despesa (format no previsualitzable).</p>
                      </div>
                    )}
                    
                    <button 
                      type="button"
                      onClick={handleDownloadAttachment} 
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Download size={18} />
                      Obrir / Descarregar Document
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '14px', margin: 0 }}>No s'ha adjuntat cap fitxer.</p>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <MessageSquare size={20} />
                <h3 style={{ margin: 0 }}>Notes Internes</h3>
              </div>
              {expense.notes ? (
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{expense.notes}</p>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Sense notes.</p>
              )}
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="card" style={{ background: 'var(--bg-card)', padding: '2rem', border: '2px solid var(--danger)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Base Imposable</span>
                <span style={{ fontWeight: '600' }}>€{parseFloat(expense.import_net).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>IVA ({parseFloat(expense.tipus_iva)}%)</span>
                <span style={{ fontWeight: '600' }}>€{parseFloat(expense.import_iva).toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '2px dashed var(--border)',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--danger)' }}>TOTAL DESPESA</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                  €{parseFloat(expense.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseDetail;
