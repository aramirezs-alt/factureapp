const { Invoice, InvoiceLine, Client, Product, BusinessProfile, sequelize } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../services/emailService');


// Internal helper to build the PDF structure (Professional Design)
const _buildPDF = async (invoice, profile, stream) => {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    bufferPages: true
  });
  doc.pipe(stream);

  const primaryColor = '#2563eb'; // Blue 600
  const secondaryColor = '#4b5563'; // Gray 600
  const textColor = '#111827'; // Gray 900
  const borderColor = '#e5e7eb'; // Gray 200

  // --- HEADER: Logo & Invoice Number ---
  const logoPath = profile?.logo_url ? path.join(__dirname, '..', '..', profile.logo_url) : null;
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 80 });
  }

  doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('FACTURA', 0, 50, { align: 'right' });
  doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(`${invoice.serie}-${invoice.numero_Factura}`, 0, 80, { align: 'right' });
  doc.moveDown(4);

  const startY = 130;

  // --- INFO SECTIONS: Emisor & Receptor ---
  // EMISOR (LEFT)
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('DE:', 50, startY);
  doc.fillColor(textColor).fontSize(12).text(profile?.nom_negoci || 'Tu Empresa', 50, startY + 15);
  doc.fillColor(secondaryColor).fontSize(9).font('Helvetica');
  doc.text(profile?.nif_cif || '', 50, startY + 32);
  doc.text(profile?.adreca || '', 50, startY + 44);
  doc.text(`${profile?.codi_postal || ''} ${profile?.ciutat || ''}`, 50, startY + 56);

  // RECEPTOR (RIGHT)
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('FACTURAR A:', 350, startY);
  doc.fillColor(textColor).fontSize(12).text(invoice.Client.nom, 350, startY + 15);
  doc.fillColor(secondaryColor).fontSize(9).font('Helvetica');
  doc.text(invoice.Client.nif, 350, startY + 32);
  doc.text(invoice.Client.adreca, 350, startY + 44);
  doc.text(`${invoice.Client.codi_postal} ${invoice.Client.ciutat}`, 350, startY + 56);

  // --- DATES BAR ---
  doc.rect(50, startY + 80, 500, 40).fill('#f8fafc');
  doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold').text('FECHA EMISIÓN', 70, startY + 88);
  doc.fillColor(textColor).fontSize(10).text(new Date(invoice.data_emissio).toLocaleDateString(), 70, startY + 100);

  doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold').text('FECHA VENCIMIENTO', 220, startY + 88);
  doc.fillColor(textColor).fontSize(10).text(new Date(invoice.data_venciment).toLocaleDateString(), 220, startY + 100);

  doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold').text('ESTADO', 370, startY + 88);
  doc.fillColor(invoice.estat === 'PAGADA' ? '#10b981' : '#f59e0b').fontSize(10).text(invoice.estat, 370, startY + 100);

  doc.moveDown(5);
  // --- ITEMS TABLE ---
  const _drawTableHeader = (yPos) => {
    doc.rect(50, yPos, 500, 20).fill(primaryColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    doc.text('CONCEPTO', 60, yPos + 6);
    doc.text('CANTIDAD', 250, yPos + 6, { width: 60, align: 'right' });
    doc.text('PRECIO', 320, yPos + 6, { width: 70, align: 'right' });
    doc.text('IVA', 400, yPos + 6, { width: 40, align: 'right' });
    doc.text('TOTAL', 450, yPos + 6, { width: 90, align: 'right' });
  };

  const tableTop = doc.y + 20;
  _drawTableHeader(tableTop);

  let y = tableTop + 25;
  doc.fillColor(textColor).font('Helvetica').fontSize(9);

  invoice.InvoiceLines.forEach((line, index) => {
    // Check for page overflow
    if (y > 720) {
      doc.addPage();
      y = 50;
      _drawTableHeader(y);
      y += 25;
    }

    if (index % 2 === 0) {
      doc.rect(50, y - 2, 500, 20).fill('#fcfcfc');
    }
    doc.fillColor(textColor);
    doc.font('Helvetica').fontSize(9);
    doc.text(line.descripcio, 60, y);
    doc.text(parseFloat(line.quantitat).toString(), 250, y, { width: 60, align: 'right' });
    doc.text(`€${parseFloat(line.preu_unitari).toFixed(2)}`, 320, y, { width: 70, align: 'right' });
    doc.text(`${parseFloat(line.tipus_iva)}%`, 400, y, { width: 40, align: 'right' });
    doc.text(`€${parseFloat(line.total_linia).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    
    doc.strokeColor(borderColor).lineWidth(0.5).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
    y += 22;
  });

  // --- TOTALS ---
  // Ensure totals aren't split across pages
  if (y > 620) {
    doc.addPage();
    y = 50;
  }

  const summaryY = y + 20;
  doc.strokeColor(primaryColor).lineWidth(1).moveTo(350, summaryY).lineTo(550, summaryY).stroke();
  
  doc.fontSize(10).font('Helvetica').fillColor(secondaryColor);
  doc.text('Base Imponible:', 350, summaryY + 15);
  doc.fillColor(textColor).text(`€${parseFloat(invoice.base_imposable).toFixed(2)}`, 450, summaryY + 15, { align: 'right' });
  
  doc.fillColor(secondaryColor).text('IVA Total:', 350, summaryY + 30);
  doc.fillColor(textColor).text(`€${parseFloat(invoice.total_iva).toFixed(2)}`, 450, summaryY + 30, { align: 'right' });

  doc.rect(350, summaryY + 50, 200, 35).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
  doc.text('TOTAL:', 365, summaryY + 62);
  doc.text(`€${parseFloat(invoice.total).toFixed(2)}`, 450, summaryY + 62, { width: 90, align: 'right' });

  // --- FOOTER ---
  const footerY = 750;
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(50, footerY).lineTo(550, footerY).stroke();
  doc.fillColor(secondaryColor).fontSize(8).font('Helvetica');
  doc.text('Gracias por su confianza. Por favor, realice el pago antes de la fecha de vencimiento.', 50, footerY + 15, { align: 'center' });
  doc.text(profile?.nom_negoci || '', 50, footerY + 28, { align: 'center' });

  doc.end();
};

// Internal helper to calculate invoice totals and process lines
const _processInvoiceLines = (lines) => {
  let base_imposable = 0;
  let total_iva = 0;
  const processedLines = lines.map(line => {
    const quantitat = parseFloat(line.quantitat) || 0;
    const preu_unitari = parseFloat(line.preu_unitari) || 0;
    const tipus_iva = parseFloat(line.tipus_iva) || 0;
    const subtotal = quantitat * preu_unitari;
    const import_iva = subtotal * (tipus_iva / 100);
    base_imposable += subtotal;
    total_iva += import_iva;
    return {
      ...line,
      quantitat, preu_unitari, tipus_iva,
      subtotal: parseFloat(subtotal.toFixed(2)),
      import_iva: parseFloat(import_iva.toFixed(2)),
      total_linia: parseFloat((subtotal + import_iva).toFixed(2))
    };
  });
  return {
    processedLines,
    base_imposable: parseFloat(base_imposable.toFixed(2)),
    total_iva: parseFloat(total_iva.toFixed(2)),
    total: parseFloat((base_imposable + total_iva).toFixed(2))
  };
};

const invoiceController = {
  getAll: async (req, res) => {
    try {
      const { client_id, estat, minAmount, maxAmount, fromDate, toDate, q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit === 'all' ? null : (parseInt(req.query.limit) || 10);
      const offset = limit ? (page - 1) * limit : 0;

      const where = { usuari_id: req.user.id };
      
      if (client_id) where.client_id = client_id;
      if (estat) where.estat = estat;

      // Search query (Invoice number or Client name)
      if (q) {
        where[Op.or] = [
          { numero_Factura: { [Op.like]: `%${q}%` } },
          { serie: { [Op.like]: `%${q}%` } },
          { '$Client.nom$': { [Op.like]: `%${q}%` } }
        ];
      }
      
      // Amount filters
      if (minAmount || maxAmount) {
        where.total = {};
        if (minAmount) where.total[Op.gte] = parseFloat(minAmount);
        if (maxAmount) where.total[Op.lte] = parseFloat(maxAmount);
      }

      // Date filters
      if (fromDate || toDate) {
        where.data_emissio = {};
        if (fromDate) where.data_emissio[Op.gte] = new Date(fromDate);
        if (toDate) where.data_emissio[Op.lte] = new Date(toDate);
      }


      const { count, rows } = await Invoice.findAndCountAll({
        where,
        include: [{ model: Client, attributes: ['nom', 'email', 'nif'] }],
        order: [['data_emissio', 'DESC']],
        limit: limit === null ? undefined : limit,
        offset: limit === null ? undefined : offset,
        subQuery: false
      });

      res.json({
        data: rows,
        totalItems: count,
        totalPages: limit === null ? 1 : Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ message: 'Error retrieving invoices' });
    }
  },

  getOne: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [
          { model: Client },
          { model: InvoiceLine, include: [{ model: Product, attributes: ['nom'] }] }
        ]
      });
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      res.json(invoice);
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ message: 'Error retrieving invoice' });
    }
  },

  create: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { lines, client_id, serie, ...invoiceData } = req.body;
      if (!client_id) return res.status(400).json({ message: 'El cliente es obligatorio' });
      if (!lines || lines.length === 0) return res.status(400).json({ message: 'La factura debe tener al menos una línea' });

      // BLOQUEJEM EL PERFIL DE NEGOCI PER EVITAR CONDICIONS DE CARRERA (RACE CONDITIONS)
      await BusinessProfile.findOne({ 
        where: { usuari_id: req.user.id }, 
        transaction, 
        lock: transaction.LOCK.UPDATE 
      });

      const lastInvoice = await Invoice.findOne({
        where: { usuari_id: req.user.id, serie },
        order: [[sequelize.cast(sequelize.col('numero_Factura'), 'INTEGER'), 'DESC']],
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      
      let nextNumber = 1;
      if (lastInvoice) {
        const lastNum = parseInt(lastInvoice.numero_Factura);
        if (!isNaN(lastNum)) nextNumber = lastNum + 1;
      }
      const numero_Factura = nextNumber.toString().padStart(3, '0');

      const { processedLines, base_imposable, total_iva, total } = _processInvoiceLines(lines);

      const invoice = await Invoice.create({
        ...invoiceData, client_id, serie, numero_Factura,
        base_imposable, total_iva, total,
        usuari_id: req.user.id
      }, { transaction });

      await InvoiceLine.bulkCreate(processedLines.map(line => ({ ...line, factura_id: invoice.id })), { transaction });
      await transaction.commit();
      
      const fullInvoice = await Invoice.findByPk(invoice.id, { include: [InvoiceLine] });
      res.status(201).json(fullInvoice);
    } catch (error) {
      if (transaction) await transaction.rollback();
      res.status(400).json({ message: 'Error al crear la factura. Revisa les dades.' });
    }
  },

  update: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { lines, client_id, ...invoiceData } = req.body;
      const invoice = await Invoice.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Invoice not found' });
      }
      if (['ENVIADA', 'PAGADA', 'CANCEL·LADA'].includes(invoice.estat)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No es pot editar una factura emesa o pagada' });
      }


      let totalsUpdate = {};
      if (lines) {
        const { processedLines, base_imposable, total_iva, total } = _processInvoiceLines(lines);
        totalsUpdate = { base_imposable, total_iva, total };
        await InvoiceLine.destroy({ where: { factura_id: invoice.id }, transaction });
        await InvoiceLine.bulkCreate(processedLines.map(line => ({ ...line, factura_id: invoice.id })), { transaction });
      }

      await invoice.update({ ...invoiceData, client_id, ...totalsUpdate }, { transaction });
      await transaction.commit();
      res.json({ message: 'Invoice updated successfully' });
    } catch (error) {
      if (transaction) await transaction.rollback();
      res.status(400).json({ message: 'Error al actualitzar la factura.' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { estat } = req.body;
      const validStatuses = ['ESBORRANY', 'ENVIADA', 'PAGADA', 'VENÇUDA', 'CANCEL·LADA'];
      
      if (!validStatuses.includes(estat)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }

      const invoice = await Invoice.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });

      await invoice.update({ estat });
      res.json({ message: 'Estado actualizado correctamente', data: invoice });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Error al actualizar el estado' });
    }
  },

  delete: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      await invoice.destroy();
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting invoice' });
    }
  },

  generatePDF: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [{ model: Client }, { model: InvoiceLine }]
      });
      
      if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });

      const profile = await BusinessProfile.findOne({ where: { usuari_id: req.user.id } });

      // Buffer the PDF to avoid sending partial responses if an error occurs
      const chunks = [];
      const { PassThrough } = require('stream');
      const pdfStream = new PassThrough();
      
      pdfStream.on('data', chunk => chunks.push(chunk));
      
      const pdfPromise = new Promise((resolve, reject) => {
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', reject);
      });

      await _buildPDF(invoice, profile, pdfStream);
      const pdfBuffer = await pdfPromise;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Factura-${invoice.serie}-${invoice.numero_Factura}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error detallat al generar PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al generar el PDF.' });
      }
    }
  },

  sendByEmail: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [{ model: Client }, { model: InvoiceLine }]
      });
      if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
      if (!invoice.Client.email) return res.status(400).json({ message: 'El cliente no tiene email configurado' });

      const profile = await BusinessProfile.findOne({ where: { usuari_id: req.user.id } });

      // Generate PDF in a buffer
      const chunks = [];
      const { PassThrough } = require('stream');
      const pdfStream = new PassThrough();
      
      pdfStream.on('data', chunk => chunks.push(chunk));
      
      const pdfPromise = new Promise((resolve, reject) => {
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', reject);
      });

      await _buildPDF(invoice, profile, pdfStream);
      const pdfBuffer = await pdfPromise;

      const invoiceName = `${invoice.serie}-${invoice.numero_Factura}`;
      
      await sendEmail({
        to: invoice.Client.email,
        subject: `Factura ${invoiceName} - ${profile?.nom_negoci || 'FactureApp'}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Hola ${invoice.Client.nom},</h2>
            <p>Adjunt trobaràs la factura <b>${invoiceName}</b> corresponent als nostres serveis/productes.</p>
            <p>Import total: <b>€${parseFloat(invoice.total).toFixed(2)}</b></p>
            <p>Si tens qualsevol dubte, pots contactar amb nosaltres responent a aquest correu.</p>
            <br/>
            <p>Salutacions,</p>
            <p><b>${profile?.nom_negoci || 'L\'equip de FactureApp'}</b></p>
          </div>
        `,
        attachments: [{
          filename: `Factura-${invoiceName}.pdf`,
          content: pdfBuffer
        }]
      });

      // Update status if it was a draft
      if (invoice.estat === 'ESBORRANY') {
        await invoice.update({ estat: 'ENVIADA' });
      }

      res.json({ message: 'Factura enviada correctamente por email' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar el email' });
    }
  },

  exportToCSV: async (req, res) => {
    try {
      const invoices = await Invoice.findAll({
        where: { usuari_id: req.user.id },
        include: [{ model: Client, attributes: ['nom', 'nif', 'email'] }],
        order: [['data_emissio', 'DESC']],
      });

      const headers = ['Número', 'Sèrie', 'Client', 'NIF Client', 'Data Emissió', 'Data Venciment', 'Estat', 'Base Imposable', 'IVA', 'Total'];
      const rows = invoices.map(inv => [
        inv.numero_Factura,
        inv.serie,
        inv.Client?.nom || '',
        inv.Client?.nif || '',
        inv.data_emissio ? new Date(inv.data_emissio).toLocaleDateString('ca-ES') : '',
        inv.data_venciment ? new Date(inv.data_venciment).toLocaleDateString('ca-ES') : '',
        inv.estat,
        parseFloat(inv.base_imposable || 0).toFixed(2),
        parseFloat(inv.total_iva || 0).toFixed(2),
        parseFloat(inv.total || 0).toFixed(2),
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="factures_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // BOM for Excel
    } catch (error) {
      console.error('Export CSV invoices error:', error);
      res.status(500).json({ message: 'Error exportant les factures' });
    }
  }
};

module.exports = invoiceController;
