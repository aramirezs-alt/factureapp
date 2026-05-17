import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Plus,
  FileText,
  TrendingUp,
  Calendar,
  Loader2,
  ShieldCheck,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalInvoiced: 0,
    totalExpenses: 0,
    pendingCount: 0,
    recentInvoices: [],
    chartData: [],
    taxSummary: {
      quarter: 1,
      ivaEstimate: 0,
      irpfRetained: 0,
      benefit: 0,
      irpfModel130Estimate: 0,
      personalTaxSaving: 0,
      personalRate: 15
    }
  });
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [chartView, selectedYear, selectedQuarter]);

  const fetchStats = async () => {
    try {
      const params = {
        view: chartView,
        year: selectedYear,
        quarter: selectedQuarter
      };
      const response = await api.get('/stats/dashboard', { params });
      setStatsData(response.data);
      if (response.data.availableYears) {
        setAvailableYears(response.data.availableYears);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvoiced = statsData.totalInvoiced;
  const totalExpenses = statsData.totalExpenses;
  const pendingCount = statsData.pendingCount;
  const invoices = statsData.recentInvoices;

  const chartData = statsData.chartData;


  const stats = [
    { label: 'Total Facturado', value: `€${totalInvoiced.toLocaleString()}`, icon: <ArrowUpRight />, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { label: 'Gastos Globales', value: `€${totalExpenses.toLocaleString()}`, icon: <ArrowDownLeft />, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { label: 'Cobros Pendientes', value: `${pendingCount} Facturas`, icon: <Clock />, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Hola, {user?.email.split('@')[0]}</h1>
            <p>Resumen visual de la salud financiera de tu negocio.</p>
          </div>
          <button 
            onClick={() => navigate('/invoices/new')}
            className="btn btn-primary"
            style={{ 
              padding: '12px 24px',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <Plus size={20} />
            Nueva Factura
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid-responsive" style={{ marginBottom: '2.5rem' }}>
          {stats.map((stat, idx) => {
            const isPending = idx === 2;
            return (
              <div 
                key={idx} 
                className="card" 
                onClick={isPending ? () => navigate('/invoices?estat=PENDENTS') : undefined}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.25rem',
                  cursor: isPending ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={isPending ? (e) => { 
                  e.currentTarget.style.transform = 'translateY(-3px)'; 
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                } : undefined}
                onMouseLeave={isPending ? (e) => { 
                  e.currentTarget.style.transform = 'none'; 
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border)';
                } : undefined}
              >
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '12px', 
                  background: stat.bg, 
                  color: stat.color,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  {stat.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ marginBottom: '0.1rem' }} className="label">{stat.label}</p>
                  <h2 style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</h2>
                </div>
                {isPending && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(37, 99, 235, 0.15)'
                  }}>
                    Veure tot
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', 
          gap: '1.5rem', 
          marginBottom: '2.5rem', 
          alignItems: 'start' 
        }}>
          {/* Tax Summary Card */}
          <div className="card" style={{ 
            background: 'var(--grad-surface)', 
            borderColor: 'var(--border)',
            gridColumn: isMobile ? '1' : '1 / -1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '1.1rem' }}>Previsió d'Impostos (T{statsData.taxSummary?.quarter} {new Date().getFullYear()})</h2>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-app)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                <Info size={14} />
                Estimat actual
              </div>
            </div>
            
            <div className="grid-responsive" style={{ gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '0.5rem' }}>IVA a pagar (estimat)</p>
                <h3 style={{ fontSize: '1.5rem', color: statsData.taxSummary?.ivaEstimate > 0 ? 'var(--danger)' : 'var(--secondary)' }}>
                  €{statsData.taxSummary?.ivaEstimate.toLocaleString()}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Vendes IVA - Despeses IVA</p>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '0.5rem' }}>IRPF Retingut</p>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                  €{statsData.taxSummary?.irpfRetained.toLocaleString()}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Retencions en factures emeses</p>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '0.5rem' }}>Rendiment Net</p>
                <h3 style={{ fontSize: '1.5rem', color: statsData.taxSummary?.benefit > 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                  €{statsData.taxSummary?.benefit.toLocaleString()}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Base Ingressos - Base Despeses</p>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '0.5rem' }}>Pago IRPF Mod. 130</p>
                <h3 style={{ fontSize: '1.5rem', color: statsData.taxSummary?.irpfModel130Estimate > 0 ? 'var(--danger)' : 'var(--primary)' }}>
                  €{statsData.taxSummary?.irpfModel130Estimate.toLocaleString()}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Estimat (20% Benefici - Retencions)</p>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '0.5rem' }}>Estalvi Personal Suggerit</p>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                  €{statsData.taxSummary?.personalTaxSaving.toLocaleString()}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Basat en el teu {statsData.taxSummary?.personalRate}% personal</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0.5rem' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Tingues pau mental</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Aquestes xifres són aproximades per ajudar-te a planificar. Recorda reservar l'IVA per a la propera liquidació.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="card">
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              marginBottom: '1.5rem',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '18px' }}>{chartView === 'monthly' ? 'Evolución' : `Q${selectedQuarter} - ${selectedYear}`}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
                <div className="btn-group" style={{ 
                  display: 'flex', 
                  background: 'var(--bg-app)', 
                  padding: '4px', 
                  borderRadius: '8px',
                  flex: 1
                }}>
                  <button 
                    onClick={() => setChartView('monthly')}
                    style={{ 
                      flex: 1,
                      padding: '4px 8px', 
                      fontSize: '11px', 
                      borderRadius: '6px', 
                      border: 'none',
                      background: chartView === 'monthly' ? 'var(--bg-card)' : 'transparent',
                      color: 'var(--text-primary)',
                      boxShadow: chartView === 'monthly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer'
                    }}
                  >Mensual</button>
                  <button 
                    onClick={() => setChartView('quarterly')}
                    style={{ 
                      flex: 1,
                      padding: '4px 8px', 
                      fontSize: '11px', 
                      borderRadius: '6px', 
                      border: 'none',
                      background: chartView === 'quarterly' ? 'var(--bg-card)' : 'transparent',
                      color: 'var(--text-primary)',
                      boxShadow: chartView === 'quarterly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer'
                    }}
                  >Trimestral</button>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: isMobile ? 240 : 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                  <Bar dataKey="Ingresos" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={isMobile ? 16 : 24} />
                  <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={isMobile ? 16 : 24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Column */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2>Actividad Reciente</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {invoices.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                  <FileText size={40} style={{ marginBottom: '1rem' }} />
                  <p>Sin facturas recientes.</p>
                </div>
              ) : (
                invoices.slice(0, 5).map(inv => (
                  <div key={inv.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '13px' }}>{inv.Client?.nom}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(inv.data_emissio).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: 'var(--primary)' }}>€{parseFloat(inv.total).toFixed(2)}</p>
                      <span className={`badge ${
                        inv.estat === 'PAGADA' ? 'badge-paid' : 
                        inv.estat === 'ENVIADA' ? 'badge-sent' : 
                        inv.estat === 'VENÇUDA' ? 'badge-overdue' : 
                        inv.estat === 'ESBORRANY' ? 'badge-draft' : 'badge-draft'
                      }`} style={{ fontSize: '10px' }}>
                        {inv.estat}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => navigate('/invoices')}
              className="btn btn-ghost" 
              style={{ width: '100%', borderRadius: '0 0 8px 8px', fontSize: '13px', padding: '1rem' }}
            >
              Ver todas las facturas
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
