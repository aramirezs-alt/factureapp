const path = require('path');
const fs = require('fs');

/**
 * Serves uploaded files. 
 * Note: This route is protected by authMiddleware in index.js
 */
exports.getFile = (req, res) => {
  const { type, filename } = req.params;
  
  // Security check: prevent directory traversal
  if (filename.includes('..') || type.includes('..')) {
    return res.status(400).json({ message: 'Camí no vàlid' });
  }

  const filePath = path.join(__dirname, '../../uploads', type, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fitxer no trobat' });
  }

  res.sendFile(filePath);
};
