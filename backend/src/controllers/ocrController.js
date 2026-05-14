const Tesseract = require('tesseract.js');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

/**
 * OCR helpers – extract structured data from raw Tesseract text
 */
const extractTotal = (text) => {
  const normalized = text.replace(/[ \t]+/g, ' ');
  const cleanLine = normalized.replace(/\s+/g, ' ');

  const patterns = [
    /(?:total|importe|import|suma|a\s+pagar|a\s+cobrar|total\s+factura|líquido|a\s+percebre)\s*[:\-]?\s*([\d]{1,6}[.,][\d]{2})/i,
    /([\d]{1,6}[.,][\d]{2})\s*(?:€|eur|euros)\b/i,
    /(?:€|eur|euros)\s*([\d]{1,6}[.,][\d]{2})/i,
  ];

  for (const pattern of patterns) {
    const match = cleanLine.match(pattern);
    if (match) return parseFloat(match[1].replace(',', '.'));
  }

  // Heuristic: If "TOTAL" is mentioned, the last price found in the ticket is usually the total
  const allPrices = text.match(/[\d]{1,6}\s*[.,]\s*[\d]{2}/g);
  if (allPrices && cleanLine.toLowerCase().includes('total')) {
    const lastPrice = allPrices[allPrices.length - 1];
    const val = parseFloat(lastPrice.replace(/\s+/g, '').replace(',', '.'));
    if (val > 0) return val;
  }

  const totalIndex = cleanLine.search(/total|importe|suma/i);
  if (totalIndex !== -1) {
    const afterTotal = cleanLine.substring(totalIndex);
    const firstNum = afterTotal.match(/([\d]{1,6}[.,][\d]{2})/);
    if (firstNum) return parseFloat(firstNum[1].replace(',', '.'));
  }

  if (allPrices) {
    const values = allPrices.map(n => parseFloat(n.replace(/\s+/g, '').replace(',', '.'))).filter(v => v > 0 && v < 5000);
    if (values.length > 0) return Math.max(...values);
  }

  return null;
};

const extractDate = (text) => {
  const clean = text.replace(/[\s]/g, ' ');
  const patterns = [
    /(\d{2})[\/\-\. ](\d{2})[\/\-\. ](\d{4})/,
    /(\d{4})[\/\-\. ](\d{2})[\/\-\. ](\d{2})/,
    /(\d{2})[\/\-\. ](\d{2})[\/\-\. ](\d{2})/,
  ];
  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      let d, m, y;
      if (match[1].length === 4) { [y, m, d] = [match[1], match[2], match[3]]; }
      else { [d, m, y] = [match[1], match[2], match[3]]; }
      
      if (y.length === 2) y = parseInt(y) > 50 ? `19${y}` : `20${y}`;
      const ds = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      const date = new Date(ds);
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1990 && date.getFullYear() <= 2100) return ds;
    }
  }
  return null;
};

const extractIVA = (text) => {
  const patterns = [
    /(?:iva|igic|itp)\s*[:\-]?\s*([\d]{1,2}(?:[.,][\d]+)?)\s*%/i,
    /([\d]{1,2}(?:[.,][\d]+)?)\s*%\s*(?:iva|igic|itp)/i,
    /base\s*([\d]{1,2}(?:[.,][\d]+)?)\s*%/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const v = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(v) && v >= 0 && v <= 50) return v;
    }
  }
  return null;
};

const extractComerciante = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length >= 3);
  
  // High priority: look for business keywords
  const bizKeywords = ['RESTAURANTE', 'BAR', 'CAFETERIA', 'MESON', 'PIZZERIA', 'BURG', 'SUPER', 'MALLORCA'];
  for (const line of lines) {
    if (bizKeywords.some(k => line.toUpperCase().includes(k))) return line;
  }

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!/[a-zA-Z]/.test(line)) continue;
    if (/\d{2}[\/\-\.]\d{2}/.test(line)) continue;
    if (line.toLowerCase().includes('factura') || line.toLowerCase().includes('ticket')) continue;
    if (line.length > 50) continue;
    return line;
  }
  return null;
};

const ocrController = {
  scan: async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ message: 'No s\'ha proporcionat cap imatge.' });

    const processedPath = filePath + '-processed.png';
    let worker = null;

    try {
      // Advanced preprocessing
      await sharp(filePath)
        .resize({ width: 2500, withoutEnlargement: false }) // Higher resolution
        .grayscale()
        .linear(1.5, -0.2) // Contrast boost
        .sharpen()
        .toFile(processedPath);

      // Create worker for better parameter control
      worker = await Tesseract.createWorker('spa+cat');
      
      // Set PSM to 4 (SINGLE_COLUMN) - Best for receipts/tickets
      await worker.setParameters({
        tessedit_pageseg_mode: '4',
      });

      const { data } = await worker.recognize(processedPath);
      const rawText = data.text || '';

      const result = {
        total:        extractTotal(rawText),
        data_despesa: extractDate(rawText),
        comerciant:   extractComerciante(rawText),
        tipus_iva:    extractIVA(rawText),
        raw_text:     rawText,
        confidence:   Math.round(data.confidence || 0),
      };

      res.json(result);
    } catch (error) {
      console.error('OCR Controller Error:', error);
      res.status(500).json({ message: 'Error processant l\'OCR de la imatge.' });
    } finally {
      if (worker) await worker.terminate();
      if (filePath && fs.existsSync(filePath)) fs.unlink(filePath, () => {});
      if (processedPath && fs.existsSync(processedPath)) fs.unlink(processedPath, () => {});
    }
  }
};

module.exports = ocrController;
