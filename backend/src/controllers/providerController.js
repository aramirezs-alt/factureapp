const { Provider, Expense } = require('../models');
const { Op } = require('sequelize');

const providerController = {
  getAll: async (req, res) => {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit === 'all' ? null : (parseInt(req.query.limit) || 10);
      const offset = limit ? (page - 1) * limit : null;
      const where = { usuari_id: req.user.id };
      
      if (q) {
        where[Op.or] = [
          { nom: { [Op.iLike]: `%${q}%` } },
          { nif: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } }
        ];
      }

      const { count, rows } = await Provider.findAndCountAll({
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
      console.error('Get providers error:', error);
      res.status(500).json({ message: 'Error retrieving providers' });
    }
  },

  getOne: async (req, res) => {
    try {
      const provider = await Provider.findOne({
        where: { id: req.params.id, usuari_id: req.user.id },
        include: [{
          model: Expense,
          as: 'Expenses',
          order: [['data_despesa', 'DESC']]
        }]
      });
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
      res.json(provider);
    } catch (error) {
      console.error('Get provider error:', error);
      res.status(500).json({ message: 'Error retrieving provider' });
    }
  },

  create: async (req, res) => {
    try {
      const provider = await Provider.create({ ...req.body, usuari_id: req.user.id });
      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ message: 'Error creating provider' });
    }
  },

  update: async (req, res) => {
    try {
      const provider = await Provider.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
      await provider.update(req.body);
      res.json({ message: 'Provider updated successfully', provider });
    } catch (error) {
      res.status(500).json({ message: 'Error updating provider' });
    }
  },

  delete: async (req, res) => {
    try {
      const provider = await Provider.findOne({ where: { id: req.params.id, usuari_id: req.user.id } });
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
      await provider.destroy();
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting provider' });
    }
  }
};

module.exports = providerController;
