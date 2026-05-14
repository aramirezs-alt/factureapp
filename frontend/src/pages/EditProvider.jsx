import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Building, Tag, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState({
    nom: '', email: '', telefon: '', nif: '',
    adreca: '', categoria: 'Otros'
  });

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await api.get(`/providers/${id}`);
        setProvider(response.data);
      } catch (err) {
        toast.error('Error al cargar el proveedor');
        navigate('/providers');
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Actualizando proveedor...');
    try {
      await api.put(`/providers/${id}`, provider);
      toast.success('Proveedor actualizado correctamente', { id: toastId });
      navigate('/providers');
    } catch (err) {
      toast.error('Error al actualizar el proveedor', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><p>Cargando...</p></Layout>;

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
                <h1>Editar Proveedor</h1>
                <p>Actualiza los datos de tu contacto.</p>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Cambios
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
                  <input required className="input" type="text" value={provider.nom} onChange={e => setProvider({...provider, nom: e.target.value})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>NIF / CIF</label>
                  <input required className="input" type="text" value={provider.nif} onChange={e => setProvider({...provider, nif: e.target.value})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Teléfono</label>
                  <input required className="input" type="text" value={provider.telefon} onChange={e => setProvider({...provider, telefon: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
                  <input required className="input" type="email" value={provider.email} onChange={e => setProvider({...provider, email: e.target.value})} />
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

export default EditProvider;
