import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  TrendingDown, 
  User as UserIcon, 
  LogOut,
  Moon,
  Sun,
  Truck,
  Calculator,
  Shield,
  Menu,
  X,
  Bell,
  Trash2,
  Check
} from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.llegida).length;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAssessor = user?.rol === 'ASSESSOR';

  const navItems = isAssessor ? [
    { to: '/assessor', icon: <LayoutDashboard size={20} />, label: 'Els meus Clients' },
    { to: '/profile',  icon: <UserIcon size={20} />,        label: 'El meu Perfil' },
  ] : [
    { to: '/',          icon: <LayoutDashboard size={20} />, label: 'Panel' },
    { to: '/invoices',  icon: <FileText size={20} />,        label: 'Facturas' },
    { to: '/clients',   icon: <Users size={20} />,           label: 'Clientes' },
    { to: '/providers', icon: <Truck size={20} />,           label: 'Proveedores' },
    { to: '/products',  icon: <Package size={20} />,         label: 'Productos' },
    { to: '/expenses',  icon: <TrendingDown size={20} />,    label: 'Gastos' },
    { to: '/tax-report',icon: <Calculator size={20} />,      label: 'Informes IVA' },
    { to: '/profile',   icon: <UserIcon size={20} />,        label: 'Mi Perfil' },
    { to: '/advisors',  icon: <Shield size={20} />,          label: 'Assessors' },
  ];

  const sidebarWidth = 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/favicon.svg" alt="Logo" style={{ width: '28px', height: '28px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>FactureApp</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="btn btn-ghost"
            style={{ padding: '8px' }}
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 95,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: `${sidebarWidth}px`,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        transition: 'all 0.3s ease',
        transform: isMobile && !isSidebarOpen ? `translateX(-${sidebarWidth}px)` : 'translateX(0)',
        visibility: isMobile && !isSidebarOpen ? 'hidden' : 'visible'
      }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.svg" alt="Logo" style={{ width: '36px', height: '36px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px', margin: 0 }}>
              Facture<span style={{ color: 'var(--text-primary)' }}>App</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-ghost"
                style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--danger)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-card)'
                  }} />
                )}
              </button>
              
              {showNotifications && (
                <div className="card animate-fade-in" style={{
                  position: 'absolute',
                  top: '45px',
                  left: '0',
                  width: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 110,
                  padding: '1rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>Notificacions</h4>
                    <button 
                      onClick={async () => { await api.patch('/notifications/read-all'); fetchNotifications(); }}
                      style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      Llegir totes
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem 0' }}>Sense notificacions</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { if (n.link) navigate(n.link); markAsRead(n.id); setShowNotifications(false); }}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: n.llegida ? 'transparent' : 'var(--primary-light)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ fontWeight: '700', marginBottom: '2px' }}>{n.titol}</div>
                          <div style={{ opacity: 0.8 }}>{n.missatge}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="btn btn-ghost"
              style={{ padding: '8px', borderRadius: '50%' }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              className="nav-item"
            >
              <span>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              color: 'var(--danger)',
              padding: '0.75rem 1rem'
            }}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`, 
        padding: isMobile ? '5rem 1rem 2rem 1rem' : '2.5rem',
        transition: 'margin 0.3s ease',
        minWidth: 0 // Prevent layout break with large tables
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
