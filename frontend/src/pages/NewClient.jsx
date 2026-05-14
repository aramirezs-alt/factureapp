import React, { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Building, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState({
    nom: '', email: '', telefon: '', nif: '',
    adreca: '', ciutat: '', codi_postal: '', pais: 'España'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Guardando cliente...');
    try {
      await api.post('/clients', client);
      toast.success('Cliente creado correctamente', { id: toastId });
      navigate('/clients');
    } catch (err) {
      toast.error('Error al guardar el cliente', { id: toastId });
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
              <button type="button" onClick={() => navigate('/clients')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Nuevo Cliente</h1>
                <p>Añade un nuevo cliente a tu base de datos profesional.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Cliente
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
                  <input required className="input" type="text" value={client.nom} onChange={e => setClient({...client, nom: e.target.value})} placeholder="Ej: Acme S.L." />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>NIF / CIF / DNI</label>
                  <input required className="input" type="text" value={client.nif} onChange={e => setClient({...client, nif: e.target.value})} placeholder="B12345678" />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Teléfono de Contacto</label>
                  <input required className="input" type="text" value={client.telefon} onChange={e => setClient({...client, telefon: e.target.value})} placeholder="600 000 000" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Correo Electrónico Principal</label>
                  <input required className="input" type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} placeholder="contacto@cliente.com" />
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

export default NewClient;
