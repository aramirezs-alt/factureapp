const cron = require('node-cron');
const { Invoice } = require('../models');
const { Op } = require('sequelize');

const runOverdueInvoicesCheck = async () => {
  console.log('Running job: Checking for overdue invoices...');
  try {
    const { Notification } = require('../models');
    const today = new Date();
    
    // Find invoices that are about to become overdue
    const overdueInvoices = await Invoice.findAll({
      where: {
        estat: 'ENVIADA',
        data_venciment: { [Op.lt]: today }
      }
    });

    if (overdueInvoices.length > 0) {
      // Update them
      await Invoice.update(
        { estat: 'VENÇUDA' },
        { 
          where: { 
            id: { [Op.in]: overdueInvoices.map(i => i.id) }
          } 
        }
      );

      // Create notifications
      for (const invoice of overdueInvoices) {
        await Notification.create({
          titol: 'Factura vençuda',
          missatge: `La factura ${invoice.numero_Factura} per import de ${invoice.total}€ ha vençut.`,
          usuari_id: invoice.usuari_id,
          tipus: 'DANGER',
          link: `/invoices/${invoice.id}`
        });
      }
      
      console.log(`Job finished: ${overdueInvoices.length} invoices marked as VENÇUDA and notified.`);
    }
    
    return overdueInvoices.length;
  } catch (err) {
    console.error('Error in overdue invoices job:', err);
    throw err;
  }
};

const runRecurringExpensesCheck = async () => {
  console.log('Running job: Checking for recurring expenses...');
  try {
    const { Expense, Notification } = require('../models');
    const today = new Date();
    let generatedCount = 0;
    
    const recurringExpenses = await Expense.findAll({
      where: {
        periodicitat: { [Op.ne]: 'CAP' }
      }
    });

    for (const expense of recurringExpenses) {
        let shouldGenerate = false;
        const lastGen = expense.ultima_generacio || expense.data_despesa;
        const nextDate = new Date(lastGen);

        if (expense.periodicitat === 'MENSUAL') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (expense.periodicitat === 'ANUAL') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        if (nextDate <= today) {
          shouldGenerate = true;
        }

        if (shouldGenerate) {
          // Create new expense
          const newExpense = await Expense.create({
            descripcio: expense.descripcio,
            categoria: expense.categoria,
            import_net: expense.import_net,
            import_iva: expense.import_iva,
            total: expense.total,
            tipus_iva: expense.tipus_iva,
            data_despesa: nextDate,
            usuari_id: expense.usuari_id,
            proveidor_id: expense.proveidor_id,
            notes: `Generat automàticament a partir de la despesa recurrent del dia ${new Date(expense.data_despesa).toLocaleDateString()}`,
            periodicitat: 'CAP' // The new one is not recurring by itself
          });

          // Update original expense's last generation date
          await expense.update({ ultima_generacio: nextDate });

          // Notify user
          await Notification.create({
            titol: 'Nova despesa recurrent generada',
            missatge: `S'ha generat automàticament la despesa: ${expense.descripcio} (${expense.total}€)`,
            usuari_id: expense.usuari_id,
            tipus: 'SUCCESS',
            link: `/expenses/${newExpense.id}`
          });

          generatedCount++;
          console.log(`Recurring expense generated for user ${expense.usuari_id}: ${expense.descripcio}`);
        }
      }
      return generatedCount;
    } catch (err) {
      console.error('Error in recurring expenses job:', err);
      throw err;
    }
};

const runTaxDeadlinesCheck = async () => {
  console.log('Running job: Checking for tax deadlines...');
  try {
    const { User, Notification } = require('../models');
    const { Op } = require('sequelize');
    const today = new Date();
    
    // Spanish Tax Deadlines (Standard Quarterly)
    // Q1: Apr 1-20, Q2: Jul 1-20, Q3: Oct 1-20, Q4: Jan 1-30
    const deadlines = [
      { month: 4, day: 20, name: '1er Trimestre (IVA i IRPF)', period: 'Q1' },
      { month: 7, day: 20, name: '2on Trimestre (IVA i IRPF)', period: 'Q2' },
      { month: 10, day: 20, name: '3er Trimestre (IVA i IRPF)', period: 'Q3' },
      { month: 1, day: 30, name: '4rt Trimestre i Resum Anual', period: 'Q4' }
    ];

    for (const deadline of deadlines) {
      let year = today.getFullYear();
      // If deadline is in January (month 1) and we are in December, it's for next year
      // But if we are in January, it's for this year.
      const deadlineDate = new Date(year, deadline.month - 1, deadline.day);
      
      // Calculate diff in days
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Notify if deadline is in 15, 7, 3 or 1 days
      if ([15, 7, 3, 1].includes(diffDays)) {
        const users = await User.findAll({ where: { rol: 'USER' } });
        for (const user of users) {
          await Notification.create({
            titol: `Recordatori Impostos: ${deadline.name}`,
            missatge: `Queden ${diffDays} dies per presentar la declaració del ${deadline.name}. No ho deixis per l'últim moment!`,
            usuari_id: user.id,
            tipus: diffDays <= 3 ? 'DANGER' : 'WARNING',
            link: '/stats'
          });
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Error in tax deadlines job:', err);
    throw err;
  }
};

const initCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    await runOverdueInvoicesCheck();
  });

  console.log('Cron jobs initialized.');

  // Run every day at 00:00 to check for recurring expenses
  cron.schedule('0 0 * * *', async () => {
    await runRecurringExpensesCheck();
    await runTaxDeadlinesCheck();
  });
};

module.exports = { initCronJobs, runOverdueInvoicesCheck, runRecurringExpensesCheck, runTaxDeadlinesCheck };
