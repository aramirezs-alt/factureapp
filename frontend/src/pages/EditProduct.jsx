import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Info, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    nom: '', descripcio: '', preu_unitari: 0, tipus_iva: 21
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        toast.error('Error al cargar el producto');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Actualizando producto...');
    try {
      await api.put(`/products/${id}`, product);
      toast.success('Producto actualizado correctamente', { id: toastId });
      navigate('/products');
    } catch (err) {
      toast.error('Error al actualizar el producto', { id: toastId });
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
              <button type="button" onClick={() => navigate('/products')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Editar Producto</h1>
                <p>Actualiza los detalles de tu catálogo.</p>
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
                <Info size={20} />
                <h3>Información del Producto</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nombre Comercial</label>
                  <input required className="input" type="text" value={product.nom} onChange={e => setProduct({...product, nom: e.target.value})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Descripción Detallada</label>
                  <textarea className="input" style={{ minHeight: '150px' }} value={product.descripcio} onChange={e => setProduct({...product, descripcio: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <DollarSign size={20} />
                <h3>Términos Económicos</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Precio Unitario (€)</label>
                  <input required className="input" type="number" step="0.01" value={product.preu_unitari} onChange={e => setProduct({...product, preu_unitari: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Tipo de IVA (%)</label>
                  <input required className="input" type="number" value={product.tipus_iva} onChange={e => setProduct({...product, tipus_iva: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProduct;
