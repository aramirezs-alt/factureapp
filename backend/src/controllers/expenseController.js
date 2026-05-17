const { Expense, Provider } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const expenseController = {
  getAll: async (req, res) => {
    try {
      const { proveidor_id, q, minAmount, maxAmount, fromDate, toDate } = req.query;
      
      // Si el dashboard demana dades (limit=1000 per exemple), les donem
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const where = { usuari_id: req.user.id };
      
      if (proveidor_id) where.proveidor_id = proveidor_id;

      // Cerca per descripció o proveïdor
      if (q) {
        where[Op.or] = [
          { descripcio: { [Op.iLike]: `%${q}%` } },
          { '$Provider.nom$': { [Op.iLike]: `%${q}%` } }
        ];
      }

      // Filtres d'import
      if (minAmount || maxAmount) {
        where.total = {};
        if (minAmount) where.total[Op.gte] = parseFloat(minAmount);
        if (maxAmount) where.total[Op.lte] = parseFloat(maxAmount);
      }

      // Filtres de data
      if (fromDate || toDate) {
        where.data_despesa = {};
        if (fromDate) where.data_despesa[Op.gte] = new Date(fromDate);
        if (toDate) where.data_despesa[Op.lte] = new Date(toDate + 'T23:59:59.999Z');
      }

      // Filtre per categoria (especificat al PDF)
      if (req.query.categoria) where.categoria = req.query.categoria;

      const { count, rows } = await Expense.findAndCountAll({
        where,
        include: [{ model: Provider, attributes: ['nom', 'nif'] }],
        order: [['data_despesa', 'DESC']],
        limit: req.query.limit === 'all' ? undefined : limit,
        offset: req.query.limit === 'all' ? undefined : offset,
        subQuery: false
      });

      res.json({
        data: rows,
        totalItems: count,
        totalPages: req.query.limit === 'all' ? 1 : Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ message: 'Error retrieving expenses' });
    }
  },

  getOne: async (req, res) => {
    try {
      const expense = await Expense.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [{ model: Provider, attributes: ['nom', 'nif'] }]
      });
      if (!expense) return res.status(404).json({ message: 'Expense not found' });
      res.json(expense);
    } catch (error) {
      console.error('Get expense error:', error);
      res.status(500).json({ message: 'Error retrieving expense' });
    }
  },

  create: async (req, res) => {
    try {
      const { import_net, import_iva } = req.body;
      const data = { 
        ...req.body, 
        usuari_id: req.user.id,
        total: parseFloat((parseFloat(import_net || 0) + parseFloat(import_iva || 0)).toFixed(2))
      };
      if (req.file) {
        data.adjunt_url = `/uploads/expenses/${req.file.filename}`;
      }
      const expense = await Expense.create(data);
      res.status(201).json(expense);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ message: 'Error creating expense' });
    }
  },

  update: async (req, res) => {
    try {
      const expense = await Expense.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });
      if (!expense) return res.status(404).json({ message: 'Expense not found' });
      
      const { import_net, import_iva, ...restBody } = req.body;
      const data = { ...restBody };
      
      if (import_net !== undefined || import_iva !== undefined) {
        const net = import_net !== undefined ? parseFloat(import_net) : parseFloat(expense.import_net);
        const iva = import_iva !== undefined ? parseFloat(import_iva) : parseFloat(expense.import_iva);
        data.import_net = net;
        data.import_iva = iva;
        data.total = parseFloat((net + iva).toFixed(2));
      }
      
      if (req.file) {
        // Eliminar l'arxiu anterior si n'hi havia un i s'ha pujat un de nou
        if (expense.adjunt_url) {
          const oldPath = path.join(__dirname, '..', '..', expense.adjunt_url);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        data.adjunt_url = `/uploads/expenses/${req.file.filename}`;
      } else if (req.body.adjunt_url === null || req.body.adjunt_url === '') {
        // Si s'envia null o buit explícitament, esborrem l'adjunt anterior
        if (expense.adjunt_url) {
          const oldPath = path.join(__dirname, '..', '..', expense.adjunt_url);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
          data.adjunt_url = null;
        }
      }
      
      await expense.update(data);
      res.json({ message: 'Expense updated successfully', expense });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({ message: 'Error updating expense' });
    }
  },

  delete: async (req, res) => {
    try {
      const expense = await Expense.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });
      
      if (!expense) return res.status(404).json({ message: 'Expense not found' });
      
      // Eliminar el fitxer adjunt del disc si existeix
      if (expense.adjunt_url) {
        const filePath = path.join(__dirname, '..', '..', expense.adjunt_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await expense.destroy();
      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({ message: 'Error deleting expense' });
    }
  },

  exportToCSV: async (req, res) => {
    try {
      const { fromDate, toDate, categoria } = req.query;
      const where = { usuari_id: req.user.id };

      // Filtre de dates (exportació per període)
      if (fromDate || toDate) {
        where.data_despesa = {};
        if (fromDate) where.data_despesa[Op.gte] = new Date(fromDate);
        if (toDate) where.data_despesa[Op.lte] = new Date(toDate + 'T23:59:59');
      }

      // Filtre per categoria
      if (categoria) where.categoria = categoria;

      const expenses = await Expense.findAll({
        where,
        include: [{ model: Provider, attributes: ['nom', 'nif'] }],
        order: [['data_despesa', 'DESC']]
      });

      let csv = 'Data;Concepte;Proveidor;NIF Proveidor;Categoria;Import Net;Import IVA;IVA %;Total;Notes\n';
      
      expenses.forEach(exp => {
        const data = new Date(exp.data_despesa).toLocaleDateString();
        const row = [
          data,
          exp.descripcio.replace(/;/g, ','),
          (exp.Provider?.nom || 'Sense proveïdor').replace(/;/g, ','),
          exp.Provider?.nif || '',
          exp.categoria,
          exp.import_net,
          exp.import_iva,
          exp.tipus_iva,
          exp.total,
          (exp.notes || '').replace(/[\n\r]/g, ' ').replace(/;/g, ',')
        ];
        csv += row.join(';') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=despeses.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Export expenses error:', error);
      res.status(500).json({ message: 'Error en l\'exportació' });
    }
  }
};

module.exports = expenseController;
