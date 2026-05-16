const { Client, Invoice } = require('../models');
const { Op } = require('sequelize');
const csv = require('csv-parser');
const fs = require('fs');
const stream = require('stream');

const clientController = {
  // Get all clients with pagination and search
  getAll: async (req, res) => {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit === 'all' ? undefined : (parseInt(req.query.limit) || 10);
      const offset = limit ? (page - 1) * limit : undefined;
      const where = { usuari_id: req.user.id };
      
      if (q) {
        where[Op.or] = [
          { nom: { [Op.like]: `%${q}%` } },
          { nif: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ];
      }

      const { count, rows } = await Client.findAndCountAll({
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
      console.error('Get clients error:', error);
      res.status(500).json({ message: 'Error retrieving clients' });
    }
  },

  // Get single client WITH history
  getOne: async (req, res) => {
    try {
      const client = await Client.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [{
          model: Invoice,
          as: 'Invoices', // Assegura't que l'alias coincideixi amb el model
          order: [['data_emissio', 'DESC']]
        }]
      });

      if (!client) return res.status(404).json({ message: 'Client not found' });
      res.json(client);
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ message: 'Error retrieving client' });
    }
  },

  create: async (req, res) => {
    try {
      const { nom, email, nif, telefon, adreca, ciutat, codi_postal } = req.body;
      if (!nom || !email || !nif || !telefon || !adreca || !ciutat || !codi_postal) {
        return res.status(400).json({ message: 'Tots els camps (nom, email, nif, telèfon, adreça, ciutat, codi postal) són obligatoris.' });
      }

      if (nif && !/^[A-Z0-9]{9}$/i.test(nif)) {
        return res.status(400).json({ message: 'Format de NIF/CIF invàlid' });
      }
      
      const existing = await Client.findOne({ where: { nif: req.body.nif, usuari_id: req.user.id } });
      if (existing) {
        return res.status(400).json({ message: 'Ja existeix un client amb aquest NIF' });
      }

      const client = await Client.create({ ...req.body, usuari_id: req.user.id });
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: 'Error creating client' });
    }
  },

  update: async (req, res) => {
    try {
      const { nom, email, nif, telefon, adreca, ciutat, codi_postal } = req.body;
      if (!nom || !email || !nif || !telefon || !adreca || !ciutat || !codi_postal) {
        return res.status(400).json({ message: 'Tots els camps (nom, email, nif, telèfon, adreça, ciutat, codi postal) són obligatoris.' });
      }

      if (nif && !/^[A-Z0-9]{9}$/i.test(nif)) {
        return res.status(400).json({ message: 'Format de NIF/CIF invàlid' });
      }

      if (nif) {
        const existing = await Client.findOne({ where: { nif, usuari_id: req.user.id } });
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ message: 'Ja existeix un altre client amb aquest NIF' });
        }
      }

      const client = await Client.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!client) return res.status(404).json({ message: 'Client not found' });
      await client.update(req.body);
      res.json({ message: 'Client updated successfully', client });
    } catch (error) {
      res.status(500).json({ message: 'Error updating client' });
    }
  },

  delete: async (req, res) => {
    try {
      const client = await Client.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!client) return res.status(404).json({ message: 'Client not found' });
      await client.destroy();
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'No se puede eliminar el cliente porque tiene facturas asociadas' });
    }
  },

  // POST /api/clients/import  — CSV with header: nom,email,nif,telefon,adreca,codi_postal,ciutat,pais
  importFromCSV: async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No s\'ha proporcionat cap fitxer CSV.' });

    const results = [];
    let rowIndex  = 1; 

    try {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const readable = stream.Readable.from(fileContent);

      await new Promise((resolve, reject) => {
        readable
          .pipe(csv({ separator: ';' }))
          .on('data', (row) => results.push({ ...row, _row: rowIndex++ }))
          .on('end', resolve)
          .on('error', reject);
      });

      if (results.length === 0) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ message: 'El fitxer CSV és buit o té un format incorrecte.' });
      }

      const transaction = await Client.sequelize.transaction();
      const created = [];
      const errors  = [];

      try {
        for (const row of results) {
          const { nom, email, nif, telefon, adreca, codi_postal, ciutat, pais, _row } = row;

          if (!nom || !email || !nif) {
            errors.push({ row: _row, error: `Falta nom, email o nif`, data: row });
            continue;
          }

          const nifClean = String(nif).trim().toUpperCase();
          if (!/^[A-Z0-9]{7,9}[A-Z0-9]$/i.test(nifClean)) {
            errors.push({ row: _row, error: `NIF invàlid: ${nif}`, data: row });
            continue;
          }

          const existing = await Client.findOne({ 
            where: { nif: nifClean, usuari_id: req.user.id },
            transaction 
          });
          
          if (existing) {
            errors.push({ row: _row, error: `NIF ja existent: ${nif}`, data: row });
            continue;
          }

          const client = await Client.create({
            nom:         String(nom).trim(),
            email:       String(email).trim(),
            nif:         nifClean,
            telefon:     String(telefon || '').trim(),
            adreca:      String(adreca || '').trim(),
            codi_postal: String(codi_postal || '').trim(),
            ciutat:      String(ciutat || '').trim(),
            pais:        String(pais || 'Espanya').trim(),
            usuari_id:   req.user.id
          }, { transaction });
          
          created.push(client.id);
        }

        if (errors.length > 0 && created.length === 0) {
           await transaction.rollback();
           return res.status(400).json({ message: 'No s\'ha pogut importar cap client.', errors });
        }

        await transaction.commit();
        fs.unlink(req.file.path, () => {});

        res.json({
          message: `${created.length} clients importats correctament. ${errors.length} errors de validació (ignorats).`,
          imported: created.length,
          errors
        });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Import CSV error:', error);
      if (fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
      res.status(500).json({ message: 'Error crític durant la importació. S\'ha fet rollback de tota l\'operació.' });
    }
  }
};

module.exports = clientController;
