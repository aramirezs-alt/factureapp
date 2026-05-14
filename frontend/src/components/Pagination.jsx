import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', paddingBottom: '2rem' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-ghost"
        style={{ padding: '8px', minWidth: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
          style={{ 
            minWidth: '40px', 
            padding: '8px',
            background: currentPage === page ? 'var(--primary)' : 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: currentPage === page ? 'white' : 'var(--text-primary)'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-ghost"
        style={{ padding: '8px', minWidth: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
