import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiSmartphone, 
  FiPieChart, 
  FiFileText,
  FiArrowRight,
  FiTrendingUp,
  FiActivity,
  FiMousePointer,
  FiMenu,
  FiX,
  FiLogIn,
  FiUserPlus
} from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    document.title = "FactureApp | Facturació Gratis per a Autònoms";
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  return (
    <div className="modern-landing">
      {/* Mesh Gradient Background */}
      <div className="mesh-bg">
        <div className="mesh-circle c1"></div>
        <div className="mesh-circle c2"></div>
        <div className="mesh-circle c3"></div>
      </div>

      <nav className={`navbar ${isMenuOpen ? 'menu-active' : ''}`}>
        <div className="container">
          <div className="brand">
            <img src="/favicon.svg" alt="Logo" className="brand-logo-img" />
            <span>FactureApp</span>
          </div>
          
          <div className="nav-actions">
            <div className="desktop-menu">
              <Link to="/login" className="login-link">Iniciar Sessió</Link>
              <Link to="/register" className="cta-button-nav">Començar ara</Link>
            </div>
            
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="mobile-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-menu-content">
                <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FiLogIn /> Iniciar Sessió
                </Link>
                <Link to="/register" className="mobile-nav-cta" onClick={() => setIsMenuOpen(false)}>
                  <FiUserPlus /> Registra't Gratis
                </Link>
                <div className="mobile-menu-footer">
                  <p>© 2026 FactureApp - Facturació per a la nova era.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="container">
            <motion.div 
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={heroVariants}
            >
              <div className="announcement">
                <span className="badge">NEW</span>
                <span className="text">Generació automàtica de factures PDF</span>
              </div>
              <h1 className="gradient-text">
                Controla el teu negoci <br />
                sense pagar ni un cèntim.
              </h1>
              <p className="description">
                La plataforma de facturació més intuïtiva per a autònoms i empreses. 
                Creat per ser ràpid, elegant i, sobretot, <strong>gratis per sempre.</strong>
              </p>
              
              <div className="cta-group">
                <Link to="/register" className="primary-cta">
                  Registra't ara <FiArrowRight />
                </Link>
                <Link to="/login" className="secondary-cta">
                  Veure demo <FiMousePointer />
                </Link>
              </div>

              <div className="trust-badges">
                <div className="trust-item"><FiCheck /> Factures il·limitades</div>
                <div className="trust-item"><FiCheck /> Sense targeta</div>
                <div className="trust-item"><FiCheck /> Sense Limitacions</div>
              </div>
            </motion.div>

            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="window-dots"><span></span><span></span><span></span></div>
                  <div className="window-title">Dashboard - FactureApp</div>
                </div>
                <div className="preview-body">
                  <div className="stats-grid">
                    <div className="stat-mini-card">
                      <span className="label">Ingressos</span>
                      <span className="value">€12,450</span>
                      <span className="trend positive">+12% <FiTrendingUp /></span>
                    </div>
                    <div className="stat-mini-card">
                      <span className="label">IVA</span>
                      <span className="value">€2,614</span>
                      <span className="trend">Previsió Q2</span>
                    </div>
                  </div>
                  <div className="activity-chart">
                    <div className="chart-bar" style={{height: '40%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                    <div className="chart-bar" style={{height: '50%'}}></div>
                    <div className="chart-bar active" style={{height: '90%'}}></div>
                    <div className="chart-bar" style={{height: '60%'}}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="container">
            <div className="section-header">
              <h2>Tot el que necessites en un sol lloc</h2>
              <p>Oblida't de les eines complicades. Hem simplificat la teva gestió fiscal.</p>
            </div>
            
            <div className="features-grid">
              {[
                { icon: <FiFileText />, title: 'Factures Professionals', desc: 'Personalitza les teves factures amb el teu logo i envia-les per email en segons.' },
                { icon: <FiPieChart />, title: 'Control d\'Impostos', desc: 'Previsió en temps real de l\'IVA i l\'IRPF per no portar-te sorpreses.' },
                { icon: <FiActivity />, title: 'Dashboard Intel·ligent', desc: 'Gràfics visuals del teu rendiment mensual i evolució del negoci.' },
                { icon: <FiSmartphone />, title: 'Multi-dispositiu', desc: 'Accedeix a les teves dades des del mòbil, tablet o ordinador en qualsevol moment.' },
                { icon: <FiShield />, title: 'Dades Encriptades', desc: 'Seguretat màxima per a la teva informació financera i la dels teus clients.' },
                { icon: <FiZap />, title: 'Gratis Forever', desc: 'Sense subscripcions ni funcionalitats bloquejades. Tot és per a tu, gratis.' }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  className="feature-card"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={cardVariants}
                >
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING (THE BIG ZERO) */}
        <section className="pricing-section">
          <div className="container">
            <div className="pricing-card">
              <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>El preu és...</h3>
              <div className="huge-price">0€</div>
              <p>Perquè creiem que gestionar el teu negoci no hauria de costar-te diners.</p>
              <ul className="feature-list">
                <li><FiCheck /> Usuaris il·limitats</li>
                <li><FiCheck /> Clients i Factures sense límit</li>
                <li><FiCheck /> Suport tècnic</li>
                <li><FiCheck /> Exportació de dades</li>
              </ul>
              <Link to="/register" className="big-cta">Vull començar gratis ara mateix</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/favicon.svg" alt="Logo" style={{ width: '30px', height: '30px' }} /> FactureApp
            </div>
            <div className="footer-links">
              <a href="#">Privacitat</a>
              <a href="#">Termes</a>
              <a href="#">Github</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 FactureApp. Dissenyat per a la nova generació d'autònoms.
          </div>
        </div>
      </footer>

      <style>{`
        .modern-landing {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --secondary: #06b6d4;
          --bg: #030712;
          --text: #f8fafc;
          --text-dim: #94a3b8;
          --glass: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          
          background-color: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Animated Mesh Background */
        .mesh-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .mesh-circle {
          position: absolute;
          filter: blur(120px);
          border-radius: 50%;
          opacity: 0.4;
          animation: float 20s infinite alternate ease-in-out;
        }

        .c1 { width: 500px; height: 500px; background: var(--primary); top: -200px; right: -100px; animation-duration: 25s; }
        .c2 { width: 400px; height: 400px; background: var(--secondary); bottom: -100px; left: -100px; animation-duration: 20s; animation-delay: -5s; }
        .c3 { width: 300px; height: 300px; background: #8b5cf6; top: 40%; left: 30%; animation-duration: 30s; animation-delay: -2s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, 50px) scale(1.1); }
        }

        /* Navbar */
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
        }
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 100;
          padding: 1.5rem 0;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.3s;
        }

        .navbar.menu-open {
          background: #030712;
        }

        .navbar.menu-active {
          background: rgba(3, 7, 18, 0.98);
        }

        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1000;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .desktop-menu {
          display: flex;
          align-items: center;
        }

        .login-link {
          color: var(--text-dim);
          text-decoration: none;
          font-weight: 600;
          margin-right: 2rem;
          transition: color 0.3s;
        }

        .login-link:hover { color: var(--text); }

        .cta-button-nav {
          background: white;
          color: var(--bg);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cta-button-nav:hover { transform: scale(1.05); }

        .menu-toggle {
          display: none;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.6rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1.25rem;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Menu Overlay */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          background: #030712;
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 7rem 2rem 2rem;
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mobile-nav-link {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 20px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          text-decoration: none;
          transition: all 0.3s;
        }

        .mobile-nav-cta {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 20px;
          text-decoration: none;
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
        }

        .mobile-menu-footer {
          margin-top: auto;
          text-align: center;
          padding-bottom: 2rem;
        }

        .mobile-menu-footer p {
          color: var(--text-dim);
          font-size: 0.85rem;
        }

        /* Hero */
        .hero-section {
          padding: 12rem 0 6rem;
          position: relative;
          z-index: 1;
        }

        .hero-section .container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 4rem;
        }

        .announcement {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          margin-bottom: 2rem;
        }

        .announcement .badge {
          background: var(--primary);
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 900;
        }

        .announcement .text { font-size: 0.85rem; color: var(--text-dim); }

        h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          font-weight: 900;
          margin-bottom: 1.5rem;
          letter-spacing: -2px;
        }

        .gradient-text {
          color: white; /* Fallback */
          background: linear-gradient(to bottom, #ffffff 20%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.2));
          display: inline-block; /* Required for some clip effects */
        }

        .description {
          font-size: 1.25rem;
          color: var(--text-dim);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .cta-group {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .primary-cta {
          background: var(--primary);
          color: white;
          padding: 1.25rem 2.5rem;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
          transition: all 0.3s;
        }

        .primary-cta:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5); }

        .secondary-cta {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: var(--text);
          padding: 1.25rem 2.5rem;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: background 0.3s;
        }

        .secondary-cta:hover { background: rgba(255,255,255,0.08); }

        .trust-badges {
          display: flex;
          gap: 2rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .trust-item { display: flex; align-items: center; gap: 0.5rem; }
        .trust-item svg { color: var(--primary); }

        /* Dashboard Preview Mockup */
        .dashboard-preview {
          background: #0f172a;
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7);
          overflow: hidden;
          position: relative;
        }

        .preview-header {
          background: #1e293b;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .window-dots { display: flex; gap: 6px; }
        .window-dots span { width: 8px; height: 8px; border-radius: 50%; }
        .window-dots span:nth-child(1) { background: #ef4444; }
        .window-dots span:nth-child(2) { background: #f59e0b; }
        .window-dots span:nth-child(3) { background: #10b981; }
        .window-title { font-size: 0.75rem; color: #64748b; margin: 0 auto; }

        .preview-body { padding: 2rem; }
        .stats-grid { display: grid; grid-cols: 2; gap: 1rem; margin-bottom: 2rem; }
        .stat-mini-card {
          background: #1e293b;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }
        .stat-mini-card .label { font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.5rem; }
        .stat-mini-card .value { font-size: 1.5rem; font-weight: 800; }
        .stat-mini-card .trend { font-size: 0.75rem; margin-top: 0.5rem; }
        .trend.positive { color: #10b981; }

        .activity-chart {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 120px;
          padding: 1rem;
          background: #020617;
          border-radius: 16px;
        }
        .chart-bar { flex: 1; background: #334155; border-radius: 4px; }
        .chart-bar.active { background: var(--primary); box-shadow: 0 0 15px rgba(59,130,246,0.5); }

        /* Features */
        .features-section { padding: 8rem 0; background: white; color: #0f172a; border-radius: 60px 60px 0 0; position: relative; z-index: 2; }
        .section-header { text-align: center; margin-bottom: 5rem; }
        .section-header h2 { font-size: 3rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 1rem; }
        .section-header p { color: #64748b; font-size: 1.25rem; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; }
        .feature-card {
          padding: 3rem;
          border-radius: 32px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .feature-card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border-color: var(--primary); }
        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: var(--primary);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        .feature-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .feature-card p { color: #64748b; line-height: 1.6; }

        /* Pricing */
        .pricing-section { padding: 8rem 0; background: white; color: #0f172a; }
        .pricing-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border-radius: 48px;
          padding: 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5);
        }
        .huge-price { 
          font-size: 10rem; 
          font-weight: 900; 
          line-height: 1; 
          margin: 2rem 0; 
          background: linear-gradient(to bottom, #ffffff, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.4));
        }
        .feature-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; list-style: none; padding: 0; margin: 3rem 0; }
        .feature-list li { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
        .feature-list li svg { color: #10b981; }
        .big-cta {
          display: inline-block;
          background: var(--primary);
          color: white;
          padding: 1.5rem 3.5rem;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 800;
          font-size: 1.25rem;
          transition: all 0.3s;
        }
        .big-cta:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(59,130,246,0.4); }

        /* Footer */
        .footer { padding: 4rem 0; background: #f8fafc; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer-content { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .footer-brand { font-size: 1.5rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; }
        .footer-links { display: flex; gap: 2rem; }
        .footer-links a { color: #64748b; text-decoration: none; font-weight: 600; }
        .footer-bottom { text-align: center; font-size: 0.9rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }

        @media (max-width: 1024px) {
          h1 { font-size: 3.5rem; }
          .hero-section .container { grid-template-columns: 1fr; text-align: center; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .cta-group { justify-content: center; flex-wrap: wrap; }
          .trust-badges { justify-content: center; flex-wrap: wrap; gap: 1rem; }
          .hero-visual { display: none; }
          .huge-price { font-size: 8rem; }
        }

        @media (max-width: 768px) {
          .navbar { padding: 1.25rem 0; }
          .menu-toggle { display: flex; }
          .desktop-menu { display: none; }
          
          h1 { font-size: 2.5rem; }
          .description { font-size: 1.1rem; }
          
          .primary-cta, .secondary-cta { 
            width: 100%; 
            justify-content: center; 
            padding: 1rem;
          }
          
          .features-grid { grid-template-columns: 1fr; }
          .feature-card { padding: 2.5rem 1.5rem; }
          
          .huge-price { font-size: 5rem; }
          .pricing-card { padding: 4rem 1.5rem; }
          .feature-list { flex-direction: column; align-items: center; gap: 1rem; }
          
          .footer-content { flex-direction: column; gap: 2rem; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
