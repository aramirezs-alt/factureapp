import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Building, MapPin, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState({
    nom: '', email: '', telefon: '', nif: '',
    adreca: '', ciutat: '', codi_postal: '', pais: 'España'
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clients/${id}`);
        setClient(response.data);
      } catch (err) {
        toast.error('Error al cargar el cliente');
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Actualizando cliente...');
    try {
      await api.put(`/clients/${id}`, client);
      toast.success('Client actualizado correctamente', { id: toastId });
      navigate('/clients');
    } catch (err) {
      toast.error('Error al actualizar el cliente', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} /></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="button" onClick={() => navigate('/clients')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Editar Client</h1>
                <p>Actualitza les dades del teu client professional.</p>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Desar Cambios
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Building size={20} />
                <h3>Información Corporativa</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nombre Completo o Razón Social</label>
                  <input required className="input" type="text" value={client.nom} onChange={e => setClient({...client, nom: e.target.value})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>NIF / CIF / DNI</label>
                  <input required className="input" type="text" value={client.nif} onChange={e => setClient({...client, nif: e.target.value})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Teléfono de Contacto</label>
                  <input required className="input" type="text" value={client.telefon} onChange={e => setClient({...client, telefon: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Correo Electrónico Principal</label>
                  <input required className="input" type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <MapPin size={20} />
                <h3>Localización</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Dirección Fiscal</label>
                  <input required className="input" type="text" value={client.adreca} onChange={e => setClient({...client, adreca: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Ciudad</label>
                    <input required className="input" type="text" value={client.ciutat} onChange={e => setClient({...client, ciutat: e.target.value})} />
                  </div>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>C. Postal</label>
                    <input required className="input" type="text" value={client.codi_postal} onChange={e => setClient({...client, codi_postal: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>País</label>
                  <input required className="input" type="text" value={client.pais} onChange={e => setClient({...client, pais: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditClient;
