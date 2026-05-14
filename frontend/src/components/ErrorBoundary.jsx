import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#F9FAFB'
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
          }}>
            <AlertTriangle size={64} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>Ups! Alguna cosa ha anat malament</h1>
            <p style={{ color: '#4B5563', marginBottom: '2rem' }}>
              S'ha produït un error inesperat a l'aplicació. No et preocupis, les teves dades estan segures.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginInline: 'auto' }}
            >
              <RefreshCcw size={18} />
              Recarregar l'aplicació
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
