import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '3rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              color: 'var(--text-muted)', 
              padding: '8px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
