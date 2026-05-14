const { Client, Product, Invoice, InvoiceLine, Expense, Provider, BusinessProfile, sequelize } = require('../models');

/**
 * GET /api/backup
 * Returns a complete JSON backup of all user data.
 */
const backupController = {
  export: async (req, res) => {
    try {
      const userId = req.user.id;

      const [clients, products, invoices, expenses, providers, profile] = await Promise.all([
        Client.findAll({ where: { usuari_id: userId }, raw: true }),
        Product.findAll({ where: { usuari_id: userId }, raw: true }),
        Invoice.findAll({
          where: { usuari_id: userId },
          include: [{ model: InvoiceLine }],
        }),
        Expense.findAll({ where: { usuari_id: userId }, raw: true }),
        Provider.findAll({ where: { usuari_id: userId }, raw: true }),
        BusinessProfile.findOne({ where: { usuari_id: userId }, raw: true }),
      ]);

      const backup = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        user_id: userId,
        data: {
          profile,
          clients,
          products,
          providers,
          invoices: invoices.map(inv => ({
            ...inv.toJSON(),
            InvoiceLines: inv.InvoiceLines?.map(l => l.toJSON()) || [],
          })),
          expenses,
        }
      };

      const filename = `backup_${userId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(backup);
    } catch (error) {
      console.error('Backup export error:', error);
      res.status(500).json({ message: 'Error generant el backup.' });
    }
  },

  /**
   * POST /api/backup/restore
   * Restores data from a JSON backup. Skips existing records (upsert by external fields).
   * WARNING: Only restores clients, products, providers and expenses (not invoices to avoid numbering conflicts).
   */
  restore: async (req, res) => {
    const backup = req.body;

    if (!backup?.version || !backup?.data) {
      return res.status(400).json({ message: 'Format de backup invàlid.' });
    }

    const userId = req.user.id;
    const summary = { clients: 0, products: 0, providers: 0, expenses: 0, invoices: 0, errors: [] };

    const t = await sequelize.transaction();
    try {
      const { clients = [], products = [], providers = [], expenses = [], invoices = [], profile } = backup.data;

      // Restore business profile (update only)
      if (profile) {
        await BusinessProfile.update(
          { ...profile, usuari_id: userId, id: undefined },
          { where: { usuari_id: userId }, transaction: t }
        );
      }

      // Clients — keep ID for referential integrity
      for (const c of clients) {
        const exists = await Client.findOne({ where: { id: c.id, usuari_id: userId }, transaction: t });
        if (!exists) {
          await Client.create({ ...c, usuari_id: userId }, { transaction: t });
          summary.clients++;
        }
      }

      // Products — keep ID
      for (const p of products) {
        const exists = await Product.findOne({ where: { id: p.id, usuari_id: userId }, transaction: t });
        if (!exists) {
          await Product.create({ ...p, usuari_id: userId }, { transaction: t });
          summary.products++;
        }
      }

      // Providers — keep ID
      for (const pv of providers) {
        const exists = await Provider.findOne({ where: { id: pv.id, usuari_id: userId }, transaction: t });
        if (!exists) {
          await Provider.create({ ...pv, usuari_id: userId }, { transaction: t });
          summary.providers++;
        }
      }

      // Expenses — keep ID, prevent duplicate creation
      for (const e of expenses) {
        const exists = await Expense.findOne({ where: { id: e.id, usuari_id: userId }, transaction: t });
        if (!exists) {
          await Expense.create({ ...e, usuari_id: userId }, { transaction: t });
          summary.expenses++;
        }
      }

      // Invoices — restore fully with lines
      for (const inv of invoices) {
        const exists = await Invoice.findOne({ where: { id: inv.id, usuari_id: userId }, transaction: t });
        if (!exists) {
          const { InvoiceLines, ...invData } = inv;
          await Invoice.create({ ...invData, usuari_id: userId }, { transaction: t });
          
          if (InvoiceLines && InvoiceLines.length > 0) {
            const linesToCreate = InvoiceLines.map(l => ({ ...l, factura_id: inv.id }));
            await InvoiceLine.bulkCreate(linesToCreate, { transaction: t });
          }
          summary.invoices++;
        }
      }

      await t.commit();

      res.json({
        message: 'Restauració completada.',
        summary
      });
    } catch (error) {
      await t.rollback();
      console.error('Backup restore error:', error);
      res.status(500).json({ message: 'Error durant la restauració: ' + error.message });
    }
  }
};

module.exports = backupController;
