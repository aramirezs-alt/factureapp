import React, { useState, useEffect, useRef } from 'react';
import api, { BACKEND_URL } from '../services/api';
import Layout from '../components/Layout';
import { Save, Building, User, MapPin, Loader2, Database, Download, Camera, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthenticatedImage from '../components/AuthenticatedImage';

const Profile = () => {
  const [profile, setProfile] = useState({
    nom: '', cognoms: '', nom_negoci: '', nif_cif: '',
    telefon: '', pais: 'España', adreca: '', ciutat: '',
    codi_postal: '', iva_defecte: 21, irpf_defecte: 15, irpf_estimat: 15, logo_url: '', serie_defecte: `F${new Date().getFullYear()}`
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/business/profile');
      if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Guardant canvis...');

    const formData = new FormData();
    Object.keys(profile).forEach(key => {
      if (profile[key] !== null && key !== 'logo_url') {
        formData.append(key, profile[key]);
      }
    });

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await api.put('/business/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data.profile);
      toast.success('Perfil actualitzat correctament', { id: toastId });
    } catch (err) {
      toast.error('Error en actualitzar el perfil', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const [backupRestoring, setBackupRestoring] = useState(false);
  const restoreInputRef = useRef(null);

  const handleBackup = async () => {
    const toastId = toast.loading('Preparant còpia de seguretat...');
    try {
      const response = await api.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FactureApp_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Còpia de seguretat descarregada', { id: toastId });
    } catch (err) {
      toast.error('Error generant la còpia de seguretat', { id: toastId });
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm('Atenció: La restauració afegirà dades al compte actual (sense esborrar les existents). Continuar?')) return;

    const toastId = toast.loading('Restaurant dades...');
    setBackupRestoring(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const response = await api.post('/backup/restore', backup);
      const s = response.data.summary;
      toast.success(
        `Restauració completada: ${s.clients} clients, ${s.products} productes, ${s.expenses} despeses importats.`,
        { id: toastId, duration: 6000 }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error restaurant el backup', { id: toastId });
    } finally {
      setBackupRestoring(false);
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  if (loading) return <Layout><p>Carregant perfil...</p></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1>Perfil de Negocio</h1>
            <p>Configura les teves dades fiscals i la imatge de la teva marca.</p>
          </div>
          <button onClick={handleBackup} className="btn btn-secondary">
            <Download size={18} />
            Còpia de Seguretat
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Logo Upload Section */}
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '16px', 
                background: '#F3F4F6', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden',
                border: '2px dashed #D1D5DB'
              }}>
                {logoFile && logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : profile?.logo_url ? (
                  <AuthenticatedImage src={profile.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building size={48} color="#9CA3AF" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: '4px solid white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>Logo del Negocio</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
                Aquesta imatge apareixerà a la capçalera de les teves factures generades en PDF. Es recomana un fons transparent.
              </p>
              {logoFile && (
                <button 
                  type="button" 
                  onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                  style={{ marginTop: '10px', color: 'var(--danger)', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Descartar cambios
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                <Building size={20} />
                <h3 style={{ fontSize: '18px' }}>Información de la Empresa</h3>
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nom del Negoci / Autònom</label>
                <input type="text" className="input" value={profile.nom_negoci || ''} onChange={(e) => setProfile({...profile, nom_negoci: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>NIF / CIF</label>
                <input type="text" className="input" value={profile.nif_cif || ''} onChange={(e) => setProfile({...profile, nif_cif: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Teléfono</label>
                <input type="text" className="input" value={profile.telefon || ''} onChange={(e) => setProfile({...profile, telefon: e.target.value})} />
              </div>
              
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <User size={20} />
                <h3 style={{ fontSize: '18px' }}>Datos del Representante</h3>
              </div>
              
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nom</label>
                <input type="text" className="input" value={profile.nom || ''} onChange={(e) => setProfile({...profile, nom: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Cognoms</label>
                <input type="text" className="input" value={profile.cognoms || ''} onChange={(e) => setProfile({...profile, cognoms: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <MapPin size={20} />
                <h3 style={{ fontSize: '18px' }}>Dirección Fiscal</h3>
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Carrer i Número</label>
                <input type="text" className="input" value={profile.adreca || ''} onChange={(e) => setProfile({...profile, adreca: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Ciutat</label>
                <input type="text" className="input" value={profile.ciutat || ''} onChange={(e) => setProfile({...profile, ciutat: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Codi Postal</label>
                <input type="text" className="input" value={profile.codi_postal || ''} onChange={(e) => setProfile({...profile, codi_postal: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>IVA per Defecte (%)</label>
                <input type="number" className="input" value={profile.iva_defecte || 21} onChange={(e) => setProfile({...profile, iva_defecte: e.target.value})} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Retenció IRPF (%) (En Factures)</label>
                <input type="number" className="input" value={profile.irpf_defecte || 0} onChange={(e) => setProfile({...profile, irpf_defecte: e.target.value})} />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>El que apareixerà imprès a la factura.</p>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Estalvi IRPF Intern (%)</label>
                <input type="number" className="input" value={profile.irpf_estimat || 15} onChange={(e) => setProfile({...profile, irpf_estimat: e.target.value})} />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Només per a càlculs interns i "Pau Mental".</p>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Sèrie per Defecte</label>
                <input type="text" className="input" value={profile.serie_defecte || ''} onChange={(e) => setProfile({...profile, serie_defecte: e.target.value})} placeholder="Ej: F2024" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Desar Perfil
              </button>
            </div>
          </div>
        </form>

        {/* Backup & Restore section — sibling to the form */}
        <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Database size={20} />
            <h3 style={{ fontSize: '18px' }}>Còpia de Seguretat i Restauració</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1.5rem' }}>
            Descarrega un fitxer JSON amb totes les teves dades (clients, productes, despeses, perfil) o restaura des d'un backup anterior.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleBackup} className="btn btn-secondary">
              <Download size={18} /> Descarregar Backup
            </button>
            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              disabled={backupRestoring}
              className="btn btn-secondary"
              style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
            >
              {backupRestoring ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              Restaurar des de Backup
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleRestore}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
