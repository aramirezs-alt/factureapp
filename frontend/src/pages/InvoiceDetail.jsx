import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Package, 
  Loader2, 
  Send, 
  Copy, 
  Mail, 
  CheckCircle2,
  Info,
  Edit
} from 'lucide-react';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    fetchInvoice();
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/business/profile');
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
    } catch (err) {
      toast.error('Error al cargar la factura');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      toast.loading('Generant PDF...', { id: 'pdf-toast' });
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${invoice.serie}-${invoice.numero_Factura}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF descarregat', { id: 'pdf-toast' });
    } catch (error) {
      toast.error('Error al descarregar el PDF', { id: 'pdf-toast' });
    } finally {
      setDownloading(false);
    }
  };

  const getHtmlEmailContent = () => {
    const invoiceName = `${invoice.serie}-${invoice.numero_Factura}`;
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
            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Hola ${invoice.Client?.nom},</h2>
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
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 600;">${new Date(invoice.data_emissio).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Data de Venciment:</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 600;">${new Date(invoice.data_venciment).toLocaleDateString()}</td>
                </tr>
                <tr style="border-top: 1px dashed #e5e7eb;">
                  <td style="padding: 16px 0 0 0; color: #111827; font-weight: 800; font-size: 16px;">TOTAL NET:</td>
                  <td style="padding: 16px 0 0 0; text-align: right; color: #2563eb; font-weight: 900; font-size: 24px;">€${parseFloat(invoice.total).toFixed(2)}</td>
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

  const handleSendEmail = () => {
    if (!invoice.Client?.email) {
      return toast.error('El client no té email configurat');
    }
    const invoiceName = `${invoice.serie}-${invoice.numero_Factura}`;
    const businessName = profile?.nom_negoci || 'TronDisc Solucions Digitals';
    
    setMailSubject(`Factura ${invoiceName} - ${businessName}`);
    setMailMessage(`Hola ${invoice.Client?.nom || ''},\n\nUs adjuntem en aquest correu la factura corresponent als darrers serveis i productes prestats.\n\nSi us plau, reviseu els detalls adjunts i no dubteu a respondre directament a aquest correu en cas de tenir qualsevol pregunta.\n\nAtentament,`);
    setRecipientEmail(invoice.Client?.email);
    setIsMailModalOpen(true);
  };

  const sendEmailApi = async () => {
    setSending(true);
    const toastId = toast.loading('Enviant factura personalitzada...');
    try {
      const emailHtml = getHtmlEmailContent();
      await api.post(`/invoices/${id}/send`, {
        subject: mailSubject,
        html: emailHtml
      });
      toast.success('Factura enviada correctament', { id: toastId });
      setIsMailModalOpen(false);
      fetchInvoice();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar la factura', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const toastId = toast.loading('Actualitzant estat...');
    try {
      await api.patch(`/invoices/${id}/status`, { estat: newStatus });
      toast.success('Estat actualitzat', { id: toastId });
      fetchInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualitzar estat', { id: toastId });
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    toast.success(message || 'Copiat al porta-retalls');
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregant detalls de la factura...</p>
      </div>
    </Layout>
  );

  if (!invoice) return null;

  const invoiceNumber = `${invoice.serie}-${invoice.numero_Factura}`;

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/invoices')} className="btn btn-ghost" style={{ padding: '8px' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ margin: 0 }}>Factura {invoiceNumber}</h1>
                <button 
                  onClick={() => copyToClipboard(invoiceNumber, 'Número de factura copiat')}
                  className="btn btn-ghost" 
                  style={{ padding: '4px', color: 'var(--text-secondary)' }}
                  title="Copiar número"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p style={{ margin: '4px 0 0 0' }}>Gestiona l'emissió i l'estat d'aquest document.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {invoice.estat === 'ESBORRANY' && (
              <button 
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)} 
                className="btn btn-secondary"
              >
                <Edit size={18} />
                Editar
              </button>
            )}
            <button 
              onClick={() => navigate(`/invoices/new?duplicate=${invoice.id}`)} 
              className="btn btn-secondary" 
              style={{ padding: '10px 18px', border: '1px solid var(--secondary)', color: 'var(--secondary)', background: 'transparent' }}
            >
              <Copy size={18} />
              Duplicar Factura
            </button>
            <button 
              onClick={handleSendEmail} 
              disabled={sending}
              className="btn btn-secondary" 
              style={{ padding: '10px 18px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
              Enviar per Email
            </button>
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="btn btn-primary" 
              style={{ padding: '10px 24px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Descarregar PDF
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Client Card */}
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
              <User size={40} style={{ opacity: 0.05, transform: 'rotate(-15deg)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <User size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Client</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{invoice.Client?.nom}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Mail size={16} />
                <span style={{ fontSize: '14px' }}>{invoice.Client?.email || 'Sense correu'}</span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', margin: '0 0 4px 0', color: 'var(--text-secondary)', fontWeight: '600' }}>ADREÇA FISCAL</p>
                <p style={{ margin: 0, fontSize: '14px' }}>{invoice.Client?.nif}</p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>{invoice.Client?.adreca}</p>
                <p style={{ margin: 0, fontSize: '14px' }}>{invoice.Client?.codi_postal} {invoice.Client?.ciutat}</p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Detalls del Document</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '6px' }}>EMISSIÓ</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="var(--text-secondary)" />
                  <p style={{ fontWeight: '600', margin: 0 }}>{new Date(invoice.data_emissio).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="label" style={{ marginBottom: '6px' }}>VENCIMENT</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="var(--text-secondary)" />
                  <p style={{ fontWeight: '600', margin: 0 }}>{new Date(invoice.data_venciment).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p className="label" style={{ marginBottom: '8px' }}>ESTAT ACTUAL</p>
                <select 
                  className={`badge ${
                    invoice.estat === 'PAGADA' ? 'badge-paid' : 
                    invoice.estat === 'ENVIADA' ? 'badge-sent' : 
                    invoice.estat === 'VENÇUDA' ? 'badge-overdue' : 
                    invoice.estat === 'ESBORRANY' ? 'badge-draft' : 'badge-draft'
                  }`} 
                  value={invoice.estat}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: '600',
                    appearance: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <option value="ESBORRANY">ESBORRANY</option>
                  <option value="ENVIADA">ENVIADA</option>
                  <option value="PAGADA">PAGADA</option>
                  <option value="VENÇUDA">VENÇUDA</option>
                  <option value="CANCEL·LADA">CANCEL·LADA</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lines Table */}
        <div className="card" style={{ padding: '0', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-app)' }}>
            <Package size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Línies de la Factura</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Concepte</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Quantitat</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Preu</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>IVA %</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.InvoiceLines?.map((line, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500' }}>{line.descripcio}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>{parseFloat(line.quantitat)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>€{parseFloat(line.preu_unitari).toFixed(2)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>{parseFloat(line.tipus_iva)}%</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>€{parseFloat(line.total_linia).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Internal Notes */}
          <div>
            {invoice.notes ? (
              <div className="card" style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', color: '#92400E' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Info size={18} />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#92400E' }}>Notes Internes</h3>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{invoice.notes}</p>
                <p style={{ marginTop: '1rem', fontSize: '11px', opacity: 0.7, fontStyle: 'italic' }}>* Aquestes notes no apareixen al PDF de la factura.</p>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '14px', margin: 0 }}>Sense notes internes per a aquesta factura.</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card" style={{ background: 'var(--bg-card)', padding: '2rem', border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Base Imposable</span>
                <span style={{ fontWeight: '600' }}>€{parseFloat(invoice.base_imposable).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>IVA Total</span>
                <span style={{ fontWeight: '600' }}>€{parseFloat(invoice.total_iva).toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '2px dashed var(--border)',
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>TOTAL</span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>
                  €{parseFloat(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
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
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Hola {invoice.Client?.nom || 'Client'},</h4>
                  <p style={{ margin: '0 0 20px 0', color: '#4b5563', whiteSpace: 'pre-wrap' }}>{mailMessage}</p>
                  
                  {/* Styled Invoice Details Box */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detalls de la Factura</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Número de Factura:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '700' }}>{invoice.serie}-{invoice.numero_Factura}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Data d'Emissió:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '600' }}>{new Date(invoice.data_emissio).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: '#6b7280' }}>Data de Venciment:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#111827', fontWeight: '600' }}>{new Date(invoice.data_venciment).toLocaleDateString()}</td>
                        </tr>
                        <tr style={{ borderTop: '1px dashed #e5e7eb' }}>
                          <td style={{ padding: '12px 0 0 0', color: '#111827', fontWeight: '800' }}>TOTAL NET:</td>
                          <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '18px' }}>€{parseFloat(invoice.total).toFixed(2)}</td>
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

export default InvoiceDetail;
