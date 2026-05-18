import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Calculator, ArrowUpRight, ArrowDownLeft, Calendar, FileText, Download, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const TaxReport = () => {
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [irpfRate, setIrpfRate] = useState(15);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtenim anys disponibles primer
      const statsRes = await api.get('/stats/dashboard');
      if (statsRes.data.availableYears) {
        setAvailableYears(statsRes.data.availableYears);
      }

      const response = await api.get(`/stats/tax-report/${year}`);
      setQuarterlyData(response.data.quarters);
      setIrpfRate(response.data.irpfRate || 15);
    } catch (err) {
      toast.error('Error al carregar dades fiscals');
    } finally {
      setLoading(false);
    }
  };

  const totalIncomeIva = quarterlyData.reduce((sum, q) => sum + q.incomeIva, 0);
  const totalExpenseIva = quarterlyData.reduce((sum, q) => sum + q.expenseIva, 0);
  
  const totalIncomeBase = quarterlyData.reduce((sum, q) => sum + q.incomeBase, 0);
  const totalExpenseBase = quarterlyData.reduce((sum, q) => sum + q.expenseBase, 0);
  const netProfit = totalIncomeBase - totalExpenseBase;
  const irpfEstimate = netProfit > 0 ? netProfit * (irpfRate / 100) : 0;

  const handleExportCSV = async (quarterId) => {
    const toastId = toast.loading('Generant informe IVA...');
    try {
      const response = await api.get(
        `/stats/iva/${year}/${quarterId || 'all'}/export`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_iva_${year}_T${quarterId || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Informe descarregat', { id: toastId });
    } catch (err) {
      toast.error('Error exportant l\'informe', { id: toastId });
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Control Fiscal e IVA</h1>
            <p>Análisis de impuestos y rendimiento del negocio para {year}.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select className="input" style={{ width: '100px' }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            <button onClick={() => handleExportCSV(1)} className="btn btn-secondary">
              <Download size={18} />
              Exportar T1
            </button>
            <button onClick={() => handleExportCSV(2)} className="btn btn-secondary">
              <Download size={18} />
              Exportar T2
            </button>
            <button onClick={() => handleExportCSV(3)} className="btn btn-secondary">
              <Download size={18} />
              Exportar T3
            </button>
            <button onClick={() => handleExportCSV(4)} className="btn btn-secondary">
              <Download size={18} />
              Exportar T4
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ArrowUpRight />
            </div>
            <div>
              <p className="label">IVA Repercutido</p>
              <h2 style={{ fontSize: '1.25rem' }}>€{totalIncomeIva.toFixed(2)}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ArrowDownLeft />
            </div>
            <div>
              <p className="label">IVA Soportado</p>
              <h2 style={{ fontSize: '1.25rem' }}>€{totalExpenseIva.toFixed(2)}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '2px solid var(--secondary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TrendingUp />
            </div>
            <div>
              <p className="label">Rendimiento (Base)</p>
              <h2 style={{ fontSize: '1.25rem' }}>€{netProfit.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem' }} className="label">TRIMESTRE</th>
                  <th style={{ padding: '1rem 1.5rem' }} className="label">IVA REPERC.</th>
                  <th style={{ padding: '1rem 1.5rem' }} className="label">IVA SOPORT.</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }} className="label">LIQUIDACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>Calculando...</td></tr>
                ) : quarterlyData.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{q.label}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--secondary)' }}>+€{q.incomeIva.toFixed(2)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--danger)' }}>-€{q.expenseIva.toFixed(2)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', color: q.netIva >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                      €{q.netIva.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ 
            background: 'var(--bg-card)', 
            border: '2px solid var(--primary)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'var(--primary)',
              opacity: 0.05,
              borderRadius: '0 0 0 100px',
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Calculator size={20} />
                Previsión IRPF
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Estimació basada en el rendiment neto (Ingresos - Despeses) aplicant el teu tipus configurat del <strong style={{ color: 'var(--text-primary)' }}>{irpfRate}%</strong> en pagaments fraccionats (Modelo 130).
              </p>
              <div style={{ 
                padding: '0.75rem', 
                background: 'var(--bg-app)', 
                borderRadius: '8px', 
                marginBottom: '1.5rem', 
                fontSize: '12px', 
                lineHeight: '1.4',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Nota:</span> Los autónomos de primer año pueden optar al tipo reducido del 7%. Esta es una estimación aproximada.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rendimiento Anual</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>€{netProfit.toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '20px', 
                  fontWeight: '800', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border)',
                  color: 'var(--primary)'
                }}>
                  <span>Pago Estimado</span>
                  <span>€{irpfEstimate.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="card" style={{ marginTop: '2rem', background: 'var(--bg-app)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <FileText size={24} color="var(--primary)" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Información para tu declaración</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Este panel te ayuda a prever tus pagos trimestrales de IVA (Modelo 303) y tu pago fraccionado de IRPF (Modelo 130). 
                Recuerda que estas cifras son estimaciones basadas en los datos introducidos y no sustituyen el asesoramiento de un profesional fiscal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaxReport;
