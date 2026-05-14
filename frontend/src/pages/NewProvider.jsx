import React, { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Building, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewProvider = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState({
    nom: '', email: '', telefon: '', nif: '',
    adreca: '', categoria: 'Otros'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Guardando proveedor...');
    try {
      await api.post('/providers', provider);
      toast.success('Proveedor creado correctamente', { id: toastId });
      navigate('/providers');
    } catch (err) {
      toast.error('Error al guardar el proveedor', { id: toastId });
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
              <button type="button" onClick={() => navigate('/providers')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Nuevo Proveedor</h1>
                <p>Registra un nuevo contacto de suministro.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Proveedor
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Building size={20} />
                <h3>Datos del Proveedor</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nombre / Razón Social</label>
                  <input required className="input" type="text" value={provider.nom} onChange={e => setProvider({...provider, nom: e.target.value})} placeholder="Ej: Movistar Empresas" />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>NIF / CIF</label>
                  <input required className="input" type="text" value={provider.nif} onChange={e => setProvider({...provider, nif: e.target.value})} placeholder="A12345678" />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Teléfono</label>
                  <input required className="input" type="text" value={provider.telefon} onChange={e => setProvider({...provider, telefon: e.target.value})} placeholder="900 000 000" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
                  <input required className="input" type="email" value={provider.email} onChange={e => setProvider({...provider, email: e.target.value})} placeholder="contacto@proveedor.com" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Dirección</label>
                  <input required className="input" type="text" value={provider.adreca} onChange={e => setProvider({...provider, adreca: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Tag size={20} />
                <h3>Categorización</h3>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Tipo de Servicio</label>
                <select className="input" value={provider.categoria} onChange={e => setProvider({...provider, categoria: e.target.value})}>
                  <option value="Suministros">Suministros (Luz, Agua, Gas)</option>
                  <option value="Telecomunicaciones">Telecomunicaciones</option>
                  <option value="Alquiler">Alquiler / Inmuebles</option>
                  <option value="Software">Software y SaaS</option>
                  <option value="Marketing">Marketing y Publicidad</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewProvider;
