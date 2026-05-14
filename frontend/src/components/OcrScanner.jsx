import React, { useState, useRef } from 'react';
import api from '../services/api';
import { Camera, Loader2, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * OcrScanner – reusable component that adds "Scan ticket" functionality
 * Props:
 *  - onApply(fields): called when user clicks "Aplicar" on a detected field.
 *    fields is an object: { total?, data_despesa?, tipus_iva?, comerciant? }
 *  - onFileSelected(file): the image chosen for OCR is also set as the adjunt
 */
const OcrScanner = ({ onApply, onFileSelected, externalFile }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const inputRef = useRef(null);

  const processOCR = async (file) => {
    if (!file) return;
    setScanning(true);
    setResult(null);
    const toastId = toast.loading('Analitzant tiquet amb OCR…');

    try {
      const fd = new FormData();
      fd.append('tiquet', file);
      const { data } = await api.post('/expenses/ocr-scan', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
      toast.success('Tiquet analitzat', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error en el processament OCR', { id: toastId });
    } finally {
      setScanning(false);
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onFileSelected) onFileSelected(file);
    await processOCR(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleScanExternal = async () => {
    if (externalFile) {
      await processOCR(externalFile);
    }
  };

  const applyField = (field, value) => {
    if (onApply) onApply({ [field]: value });
    toast.success(`Camp aplicat`);
  };

  const dismiss = () => setResult(null);

  const lowConfidence = result && result.confidence < 60;

  const isImage = (file) => file && file.type.startsWith('image/');

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Hidden file input - removed capture to allow gallery choice */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleScan}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={scanning}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: '8px', borderStyle: 'dashed' }}
        >
          {scanning && !externalFile
            ? <><Loader2 size={18} className="animate-spin" /> Analitzant…</>
            : <><Camera size={18} /> <Sparkles size={14} style={{ color: 'var(--warning)' }} /> Escanejar / Seleccionar Tiquet</>
          }
        </button>

        {externalFile && isImage(externalFile) && !result && (
          <button
            type="button"
            onClick={handleScanExternal}
            disabled={scanning}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '8px', background: 'var(--grad-primary)' }}
          >
            {scanning 
              ? <><Loader2 size={18} className="animate-spin" /> Processant arxiu...</>
              : <><Sparkles size={18} /> Llegir dades de l'arxiu seleccionat</>
            }
          </button>
        )}
      </div>

      {result && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            border: `1px solid ${lowConfidence ? '#F59E0B' : '#10B981'}`,
            background: lowConfidence ? '#FFFBEB' : '#F0FDF4',
            position: 'relative'
          }}
        >
          {/* Dismiss button */}
          <button
            type="button"
            onClick={dismiss}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            {lowConfidence
              ? <AlertTriangle size={18} color="#F59E0B" />
              : <CheckCircle2 size={18} color="#10B981" />
            }
            <span style={{ fontWeight: '700', fontSize: '13px', color: lowConfidence ? '#92400E' : '#166534' }}>
              {lowConfidence
                ? `Reviseu els valors — qualitat baixa (${result.confidence}%)`
                : `Dades detectades (confiança: ${result.confidence}%)`
              }
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.total !== null && (
              <OcrField
                label="Total"
                value={`${result.total} €`}
                onApply={() => applyField('total', result.total)}
              />
            )}
            {result.data_despesa !== null && (
              <OcrField
                label="Data"
                value={result.data_despesa}
                onApply={() => applyField('data_despesa', result.data_despesa)}
              />
            )}
            {result.tipus_iva !== null && (
              <OcrField
                label="IVA"
                value={`${result.tipus_iva}%`}
                onApply={() => applyField('tipus_iva', result.tipus_iva)}
              />
            )}
            {result.comerciant && (
              <OcrField
                label="Comerciant"
                value={result.comerciant}
                onApply={() => applyField('comerciant', result.comerciant)}
              />
            )}

            {!result.total && !result.data_despesa && !result.tipus_iva && !result.comerciant && (
              <p style={{ fontSize: '13px', color: '#92400E', margin: 0 }}>
                No s'ha pogut extreure cap valor del tiquet. Proveu amb una imatge més nítida.
              </p>
            )}

            {/* Apply all detected fields at once */}
            {(result.total || result.data_despesa || result.tipus_iva) && (
              <button
                type="button"
                onClick={() => {
                  const fields = {};
                  if (result.total !== null) fields.total = result.total;
                  if (result.data_despesa !== null) fields.data_despesa = result.data_despesa;
                  if (result.tipus_iva !== null) fields.tipus_iva = result.tipus_iva;
                  if (result.comerciant) fields.comerciant = result.comerciant;
                  onApply(fields);
                  toast.success('Tots els camps aplicats');
                }}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', fontSize: '13px', padding: '8px 14px' }}
              >
                <CheckCircle2 size={15} /> Aplicar tots els camps
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '11px', textDecoration: 'underline', marginTop: '0.5rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              {showRaw ? 'Amagar text extret' : 'Veure text extret (debug)'}
            </button>
            
            {showRaw && (
              <pre style={{ fontSize: '10px', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                {result.raw_text}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OcrField = ({ label, value, onApply }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    fontSize: '13px'
  }}>
    <span>
      <b style={{ marginRight: '6px' }}>{label}:</b>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </span>
    <button
      type="button"
      onClick={onApply}
      className="btn btn-secondary"
      style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
    >
      Aplicar
    </button>
  </div>
);

export default OcrScanner;
