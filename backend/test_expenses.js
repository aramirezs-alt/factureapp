const { Expense, Provider } = require('./src/models');
const { Op } = require('sequelize');

async function test() {
  try {
    const q = 'test';
    const where = {};
    where[Op.or] = [
      { descripcio: { [Op.like]: `%${q}%` } },
      { '$Provider.nom$': { [Op.like]: `%${q}%` } }
    ];

    const res = await Expense.findAndCountAll({
      where,
      include: [{ model: Provider, attributes: ['nom', 'nif'] }],
      subQuery: false
    });
    console.log("Success:", res.count);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
