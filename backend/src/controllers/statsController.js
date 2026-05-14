const { Invoice, InvoiceLine, Expense, Client, sequelize } = require('../models');
const { Op } = require('sequelize');

const statsController = {
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const now = new Date();

      // 1. Totals (Global)
      const totalInvoiced = await Invoice.sum('total', { where: { usuari_id: userId } }) || 0;
      const totalExpenses = await Expense.sum('total', { where: { usuari_id: userId } }) || 0;
      const pendingCount = await Invoice.count({ 
        where: { 
          usuari_id: userId, 
          estat: { [Op.in]: ['ENVIADA', 'VENÇUDA'] } 
        } 
      });

      // 2. Recent activity (Invoices)
      const recentInvoices = await Invoice.findAll({
        where: { usuari_id: userId },
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Client }]
      });

      // 3. Chart data
      const view = req.query.view || 'monthly';
      const selectedYear = parseInt(req.query.year) || now.getFullYear();
      const selectedQuarter = parseInt(req.query.quarter) || Math.floor(now.getMonth() / 3) + 1;

      let chartMonths = [];
      let startDate;
      let endDate;

      if (view === 'monthly') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          chartMonths.push({
            name: d.toLocaleString('default', { month: 'short' }),
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            Ingresos: 0,
            Gastos: 0
          });
        }
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        endDate = new Date();
      } else {
        // Selected Quarter (3 months)
        const startMonth = (selectedQuarter - 1) * 3;
        for (let i = 0; i < 3; i++) {
          const d = new Date(selectedYear, startMonth + i, 1);
          chartMonths.push({
            name: d.toLocaleString('default', { month: 'short' }),
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            Ingresos: 0,
            Gastos: 0
          });
        }
        startDate = new Date(selectedYear, startMonth, 1);
        endDate = new Date(selectedYear, startMonth + 3, 0, 23, 59, 59);
      }

      const invoices = await Invoice.findAll({
        where: { 
          usuari_id: userId,
          data_emissio: { [Op.between]: [startDate, endDate] }
        },
        raw: true
      });

      const expenses = await Expense.findAll({
        where: { 
          usuari_id: userId,
          data_despesa: { [Op.between]: [startDate, endDate] }
        },
        raw: true
      });

      // Group in JS
      invoices.forEach(inv => {
        const d = new Date(inv.data_emissio);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthData = chartMonths.find(md => md.month === m && md.year === y);
        if (monthData) {
          monthData.Ingresos += parseFloat(inv.total) || 0;
        }
      });

      expenses.forEach(exp => {
        const d = new Date(exp.data_despesa);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthData = chartMonths.find(md => md.month === m && md.year === y);
        if (monthData) {
          monthData.Gastos += parseFloat(exp.total) || 0;
        }
      });

      chartMonths.forEach(m => {
        m.Ingresos = parseFloat(m.Ingresos.toFixed(2));
        m.Gastos = parseFloat(m.Gastos.toFixed(2));
      });

      // Get available years for the selector
      const oldestInvoice = await Invoice.findOne({ where: { usuari_id: userId }, order: [['data_emissio', 'ASC']] });
      const oldestExpense = await Expense.findOne({ where: { usuari_id: userId }, order: [['data_despesa', 'ASC']] });
      
      let startYear = now.getFullYear();
      if (oldestInvoice) startYear = Math.min(startYear, new Date(oldestInvoice.data_emissio).getFullYear());
      if (oldestExpense) startYear = Math.min(startYear, new Date(oldestExpense.data_despesa).getFullYear());
      
      const availableYears = [];
      for (let y = now.getFullYear(); y >= startYear; y--) {
        availableYears.push(y);
      }

      res.json({
        totalInvoiced: parseFloat(totalInvoiced) || 0,
        totalExpenses: parseFloat(totalExpenses) || 0,
        pendingCount,
        recentInvoices,
        chartData: chartMonths,
        availableYears
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Error al recuperar les estadístiques.' });
    }
  },

  exportIVA: async (req, res) => {
    try {
      const userId = req.user.id;
      const year  = parseInt(req.params.year)  || new Date().getFullYear();
      const quarter = parseInt(req.params.quarter) || Math.floor(new Date().getMonth() / 3) + 1;

      const startMonth = (quarter - 1) * 3;
      const startDate  = new Date(year, startMonth, 1);
      const endDate    = new Date(year, startMonth + 3, 0, 23, 59, 59);

      // Invoices (income IVA)
      const invoices = await Invoice.findAll({
        where: {
          usuari_id: userId,
          data_emissio: { [Op.between]: [startDate, endDate] }
        },
        include: [
          { model: Client, attributes: ['nom', 'nif'] },
          { model: InvoiceLine }
        ],
        raw: false
      });

      // Expenses (deductible IVA)
      const expenses = await Expense.findAll({
        where: {
          usuari_id: userId,
          data_despesa: { [Op.between]: [startDate, endDate] }
        },
        raw: true
      });

      const headers = ['Tipus', 'Data', 'Referència', 'Contrapart', 'NIF', 'Base Imposable', '% IVA', 'Import IVA', 'Total'];
      const rows = [];

      const ivaIngresosAgrupat = {};
      const ivaDespesesAgrupat = {};

      invoices.forEach(inv => {
        if (inv.InvoiceLines && inv.InvoiceLines.length > 0) {
          inv.InvoiceLines.forEach(line => {
            const tipusIva = parseFloat(line.tipus_iva || 0);
            const base = parseFloat(line.subtotal || 0);
            const iva = parseFloat(line.import_iva || 0);
            
            ivaIngresosAgrupat[tipusIva] = (ivaIngresosAgrupat[tipusIva] || 0) + iva;

            rows.push([
              'INGRÉS',
              new Date(inv.data_emissio).toLocaleDateString('ca-ES'),
              `${inv.serie}-${inv.numero_Factura}`,
              inv.Client?.nom || '',
              inv.Client?.nif || '',
              base.toFixed(2),
              tipusIva.toFixed(2),
              iva.toFixed(2),
              parseFloat(line.total_linia || 0).toFixed(2),
            ]);
          });
        }
      });

      expenses.forEach(exp => {
        const tipusIva = parseFloat(exp.tipus_iva || 0);
        const iva = parseFloat(exp.import_iva || 0);
        ivaDespesesAgrupat[tipusIva] = (ivaDespesesAgrupat[tipusIva] || 0) + iva;

        rows.push([
          'DESPESA',
          new Date(exp.data_despesa).toLocaleDateString('ca-ES'),
          exp.descripcio || '',
          exp.categoria || '',
          '',
          parseFloat(exp.import_net || 0).toFixed(2),
          tipusIva.toFixed(2),
          iva.toFixed(2),
          parseFloat(exp.total || 0).toFixed(2),
        ]);
      });

      // Totals row
      rows.push([]);
      rows.push(['RESUM PER TIPUS D\'IVA', '', '', '', '', '', '', '', '']);
      
      let totalIvaIngresos = 0;
      Object.keys(ivaIngresosAgrupat).sort().forEach(tipus => {
        const amount = ivaIngresosAgrupat[tipus];
        totalIvaIngresos += amount;
        rows.push([`IVA repercutit (ingressos) al ${tipus}%`, '', '', '', '', '', '', amount.toFixed(2), '']);
      });

      let totalIvaDespeses = 0;
      Object.keys(ivaDespesesAgrupat).sort().forEach(tipus => {
        const amount = ivaDespesesAgrupat[tipus];
        totalIvaDespeses += amount;
        rows.push([`IVA suportat (despeses) al ${tipus}%`, '', '', '', '', '', '', amount.toFixed(2), '']);
      });

      rows.push([]);
      rows.push(['TOTALS GLOBALS', '', '', '', '', '', '', '', '']);
      rows.push(['Total IVA repercutit', '', '', '', '', '', '', totalIvaIngresos.toFixed(2), '']);
      rows.push(['Total IVA suportat', '', '', '', '', '', '', totalIvaDespeses.toFixed(2), '']);
      rows.push(['IVA a ingressar/retornar', '', '', '', '', '', '', (totalIvaIngresos - totalIvaDespeses).toFixed(2), '']);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="informe_iva_${year}_T${quarter}.csv"`);
      res.send('\uFEFF' + csvContent);
    } catch (error) {
      console.error('Export IVA error:', error);
      res.status(500).json({ message: 'Error a l\'exportar el document CSV.' });
    }
  },

  getTaxReport: async (req, res) => {
    try {
      const userId = req.user.id;
      const year = parseInt(req.params.year) || new Date().getFullYear();
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const invoices = await Invoice.findAll({
        where: {
          usuari_id: userId,
          data_emissio: { [Op.between]: [startDate, endDate] },
          estat: { [Op.in]: ['ENVIADA', 'PAGADA', 'VENÇUDA'] }
        },
        attributes: ['data_emissio', 'total_iva', 'base_imposable'],
        raw: true
      });

      const expenses = await Expense.findAll({
        where: {
          usuari_id: userId,
          data_despesa: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['data_despesa', 'import_iva', 'import_net'],
        raw: true
      });

      const quarters = [
        { id: 1, label: '1er Trimestre (Ene-Mar)', incomeIva: 0, expenseIva: 0, netIva: 0, incomeBase: 0, expenseBase: 0 },
        { id: 2, label: '2o Trimestre (Abr-Jun)', incomeIva: 0, expenseIva: 0, netIva: 0, incomeBase: 0, expenseBase: 0 },
        { id: 3, label: '3er Trimestre (Jul-Sep)', incomeIva: 0, expenseIva: 0, netIva: 0, incomeBase: 0, expenseBase: 0 },
        { id: 4, label: '4o Trimestre (Oct-Dic)', incomeIva: 0, expenseIva: 0, netIva: 0, incomeBase: 0, expenseBase: 0 },
      ];

      const getQuarter = (date) => Math.floor(new Date(date).getMonth() / 3) + 1;

      invoices.forEach(inv => {
        const q = getQuarter(inv.data_emissio);
        quarters[q - 1].incomeIva += parseFloat(inv.total_iva);
        quarters[q - 1].incomeBase += parseFloat(inv.base_imposable);
      });

      expenses.forEach(exp => {
        const q = getQuarter(exp.data_despesa);
        quarters[q - 1].expenseIva += parseFloat(exp.import_iva);
        quarters[q - 1].expenseBase += parseFloat(exp.import_net);
      });

      quarters.forEach(q => {
        q.netIva = q.incomeIva - q.expenseIva;
      });

      res.json(quarters);
    } catch (error) {
      console.error('Tax report error:', error);
      res.status(500).json({ message: 'Error calculant informe d\'impostos' });
    }
  }
};

module.exports = statsController;
