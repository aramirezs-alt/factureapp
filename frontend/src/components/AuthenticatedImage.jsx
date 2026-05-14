import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AuthenticatedImage = ({ src, alt, style, className }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const fetchImage = async () => {
      if (!src) return;
      try {
        const response = await api.get(src.replace(/.*\/uploads\//, '/uploads/'), { 
          responseType: 'blob' 
        });
        objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (error || !src) return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: '12px' }}>Sense imatge</div>;
  if (!imageSrc) return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>Carregant...</div>;

  return <img src={imageSrc} alt={alt} style={style} className={className} />;
};

export default AuthenticatedImage;
