import React, { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Save, ArrowLeft, Info, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    nom: '', descripcio: '', preu_unitari: 0, tipus_iva: 21
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Guardando producto...');
    try {
      await api.post('/products', product);
      toast.success('Producto creado correctamente', { id: toastId });
      navigate('/products');
    } catch (err) {
      toast.error('Error al guardar el producto', { id: toastId });
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
              <button type="button" onClick={() => navigate('/products')} className="btn btn-ghost" style={{ padding: '8px' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>Nuevo Producto</h1>
                <p>Añade artículos a tu catálogo para facturarlos en un clic.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Producto
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
                  <input required className="input" type="text" value={product.nom} onChange={e => setProduct({...product, nom: e.target.value})} placeholder="Ej: Servicio de diseño web" />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Descripción Detallada</label>
                  <textarea className="input" style={{ minHeight: '150px' }} value={product.descripcio} onChange={e => setProduct({...product, descripcio: e.target.value})} placeholder="Describe las características del producto o servicio..." />
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
                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '12px' }}>Este precio se aplicará por defecto al seleccionar el producto en una factura.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewProduct;
