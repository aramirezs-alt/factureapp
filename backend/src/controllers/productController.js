const { Product } = require('../models');
const { Op } = require('sequelize');
const csv = require('csv-parser');
const fs = require('fs');
const stream = require('stream');

const productController = {
  // Get all products for current user with pagination and search
  getAll: async (req, res) => {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit === 'all' ? undefined : (parseInt(req.query.limit) || 10);
      const offset = limit ? (page - 1) * limit : undefined;

      const where = { usuari_id: req.user.id };
      
      if (q) {
        where[Op.or] = [
          { nom: { [Op.iLike]: `%${q}%` } },
          { codi: { [Op.iLike]: `%${q}%` } }
        ];
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        order: [['nom', 'ASC']],
        limit,
        offset
      });

      res.json({
        data: rows,
        totalItems: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: page
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: 'Error retrieving products' });
    }
  },

  // Get single product
  getOne: async (req, res) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ message: 'Error retrieving product' });
    }
  },

  // Create new product
  create: async (req, res) => {
    try {
      const { nom, preu_unitari, tipus_iva } = req.body;
      
      if (!nom || preu_unitari === undefined || tipus_iva === undefined) {
        return res.status(400).json({ message: 'Nombre, precio e IVA son obligatorios' });
      }

      if (parseFloat(preu_unitari) < 0) {
        return res.status(400).json({ message: 'El precio no puede ser negativo' });
      }

      const product = await Product.create({
        ...req.body,
        usuari_id: req.user.id
      });
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Error creating product' });
    }
  },

  // Update product
  update: async (req, res) => {
    try {
      const { nom, preu_unitari, tipus_iva } = req.body;
      
      const product = await Product.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (preu_unitari !== undefined && parseFloat(preu_unitari) < 0) {
        return res.status(400).json({ message: 'El precio no puede ser negativo' });
      }

      await product.update(req.body);
      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Error updating product' });
    }
  },

  // Delete product
  delete: async (req, res) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(400).json({ message: "No es pot eliminar el producte perquè s'està utilitzant en factures" });
    }
  },

  // POST /api/products/import — CSV: nom;descripcio;preu_unitari;tipus_iva
  importFromCSV: async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No s\'ha proporcionat cap fitxer CSV.' });

    const results = [];
    const errors  = [];
    let rowIndex  = 1;

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const readable = stream.Readable.from(fileContent);

    await new Promise((resolve) => {
      readable
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => results.push({ ...row, _row: rowIndex++ }))
        .on('end', resolve)
        .on('error', resolve);
    });

    if (results.length === 0) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'El fitxer CSV és buit o té un format incorrecte.' });
    }

    const created = [];

    for (const row of results) {
      const { nom, descripcio, preu_unitari, tipus_iva, _row } = row;

      if (!nom || !preu_unitari) {
        errors.push({ row: _row, error: 'Falta nom o preu_unitari', data: row });
        continue;
      }

      const preuNum = parseFloat(String(preu_unitari).replace(',', '.'));
      const ivaNum  = parseFloat(String(tipus_iva || '21').replace(',', '.'));

      if (isNaN(preuNum) || preuNum < 0) {
        errors.push({ row: _row, error: `Preu invàlid: ${preu_unitari}`, data: row });
        continue;
      }

      try {
        const product = await Product.create({
          nom:          String(nom).trim(),
          descripcio:   String(descripcio || '').trim(),
          preu_unitari: preuNum,
          tipus_iva:    isNaN(ivaNum) ? 21 : ivaNum,
          usuari_id:    req.user.id
        });
        created.push(product.id);
      } catch (err) {
        errors.push({ row: _row, error: err.message, data: row });
      }
    }

    fs.unlink(req.file.path, () => {});

    res.json({
      message: `${created.length} productes importats correctament. ${errors.length} errors.`,
      imported: created.length,
      errors
    });
  }
};

module.exports = productController;
