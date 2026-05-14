const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

const validateFile = (allowedMimeTypes) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const filePath = req.file.path;
      const type = await FileType.fromFile(filePath);

      if (!type || !allowedMimeTypes.includes(type.mime)) {
        // Delete the file if it's not valid
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({ 
          message: `Tipus de fitxer no permès. Tipus detectat: ${type ? type.mime : 'desconegut'}. Els tipus permesos són: ${allowedMimeTypes.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      console.error('Error validant el fitxer:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Error en la validació del fitxer' });
    }
  };
};

module.exports = { validateFile };
