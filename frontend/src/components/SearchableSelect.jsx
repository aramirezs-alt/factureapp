import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Selecciona...', 
  noResultsText = 'No s\'han trobat resultats',
  renderOption
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="searchable-select" ref={containerRef}>
      <div 
        className={`input searchable-select-input ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>}
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <input
              autoFocus
              type="text"
              className="input"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`searchable-select-option ${opt.id === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {renderOption ? renderOption(opt) : (
                    <>
                      <span>{opt.label}</span>
                      {opt.sublabel && <span style={{ fontSize: '11px', opacity: 0.7 }}>{opt.sublabel}</span>}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="searchable-select-no-results">
                {noResultsText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
