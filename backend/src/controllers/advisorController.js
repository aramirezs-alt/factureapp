const { AdvisorAccess, User, Invoice, Expense, BusinessProfile, Client } = require('../models');
const { Op } = require('sequelize');

// Helper: verifica que l'assessor té accés actiu a un usuari concret
const checkAdvisorAccess = async (advisorId, targetUserId) => {
  const access = await AdvisorAccess.findOne({
    where: { assessor_id: advisorId, usuari_id: targetUserId, estat: 'ACTIU' }
  });
  return !!access;
};

const advisorController = {
  // Grant access: a user invites an advisor by email
  grantAccess: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email de l\'assessor requerit' });

      const advisor = await User.findOne({ where: { email } });
      if (!advisor) return res.status(404).json({ message: 'No s\'ha trobat cap usuari amb aquest email' });
      if (advisor.id === req.user.id) return res.status(400).json({ message: 'No pots afegir-te a tu mateix com a assessor' });

      const existing = await AdvisorAccess.findOne({
        where: { usuari_id: req.user.id, assessor_id: advisor.id }
      });
      if (existing) {
        if (existing.estat === 'REVOCAT') {
          await existing.update({ estat: 'ACTIU' });
          return res.json({ message: 'Accés restablert correctament' });
        }
        return res.status(400).json({ message: 'Aquest assessor ja té accés' });
      }

      await AdvisorAccess.create({
        usuari_id: req.user.id,
        assessor_id: advisor.id,
        estat: 'ACTIU'
      });

      res.status(201).json({ message: 'Accés atorgat correctament' });
    } catch (error) {
      console.error('Grant access error:', error);
      res.status(500).json({ message: 'Error al atorgar accés' });
    }
  },

  // List advisors that have access to the current user's data
  getMyAdvisors: async (req, res) => {
    try {
      const accesses = await AdvisorAccess.findAll({
        where: { usuari_id: req.user.id },
        include: [{ model: User, as: 'Assessor', attributes: ['id', 'email', 'rol'] }]
      });
      res.json(accesses);
    } catch (error) {
      console.error('Get advisors error:', error);
      res.status(500).json({ message: 'Error al obtenir assessors' });
    }
  },

  // List clients that the current advisor can access (with business profile info)
  getMyClients: async (req, res) => {
    try {
      const accesses = await AdvisorAccess.findAll({
        where: { assessor_id: req.user.id, estat: 'ACTIU' },
        include: [{ 
          model: User, 
          as: 'Usuari', 
          attributes: ['id', 'email'],
          include: [{ model: BusinessProfile, attributes: ['nom_negoci', 'nif_cif', 'logo_url'] }]
        }]
      });
      res.json(accesses);
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ message: 'Error al obtenir clients' });
    }
  },

  // Get invoices of a specific client the advisor has access to
  getClientInvoices: async (req, res) => {
    try {
      const { clientId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const hasAccess = await checkAdvisorAccess(req.user.id, clientId);
      if (!hasAccess) return res.status(403).json({ message: 'Accés denegat' });

      const { count, rows } = await Invoice.findAndCountAll({
        where: { usuari_id: clientId },
        include: [{ model: Client, attributes: ['nom'] }],
        order: [['data_emissio', 'DESC']],
        limit,
        offset
      });

      res.json({
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Get client invoices error:', error);
      res.status(500).json({ message: 'Error al obtenir factures' });
    }
  },

  // Get summary stats of a specific client the advisor has access to
  getClientSummary: async (req, res) => {
    try {
      const { clientId } = req.params;
      const hasAccess = await checkAdvisorAccess(req.user.id, clientId);
      if (!hasAccess) return res.status(403).json({ message: 'Accés denegat' });

      const [totalInvoiced, totalExpenses, pendingInvoices, overdueInvoices, totalInvoices, profile] = await Promise.all([
        Invoice.sum('total', { where: { usuari_id: clientId } }),
        Expense.sum('total', { where: { usuari_id: clientId } }),
        Invoice.count({ where: { usuari_id: clientId, estat: { [Op.in]: ['ENVIADA', 'VENÇUDA'] } } }),
        Invoice.count({ where: { usuari_id: clientId, estat: 'VENÇUDA' } }),
        Invoice.count({ where: { usuari_id: clientId } }),
        BusinessProfile.findOne({ where: { usuari_id: clientId }, attributes: ['nom_negoci', 'nif_cif', 'logo_url', 'nom', 'cognoms'] })
      ]);

      res.json({
        profile,
        stats: {
          totalInvoiced: totalInvoiced || 0,
          totalExpenses: totalExpenses || 0,
          netProfit: (totalInvoiced || 0) - (totalExpenses || 0),
          pendingInvoices,
          overdueInvoices,
          totalInvoices
        }
      });
    } catch (error) {
      console.error('Get client summary error:', error);
      res.status(500).json({ message: 'Error al obtenir resum' });
    }
  },

  // Revoke access
  revokeAccess: async (req, res) => {
    try {
      const access = await AdvisorAccess.findOne({
        where: { id: req.params.id, usuari_id: req.user.id }
      });
      if (!access) return res.status(404).json({ message: 'Accés no trobat' });

      await access.update({ estat: 'REVOCAT' });
      res.json({ message: 'Accés revocat correctament' });
    } catch (error) {
      console.error('Revoke access error:', error);
      res.status(500).json({ message: 'Error al revocar accés' });
    }
  }
};

module.exports = advisorController;
