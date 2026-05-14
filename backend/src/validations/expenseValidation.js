const { body } = require('express-validator');

const expenseValidation = [
  body('descripcio')
    .notEmpty()
    .withMessage('La descripció és obligatòria'),
  body('total')
    .isFloat({ min: 0.01 })
    .withMessage('L\'import total ha de ser superior a zero'),
  body('tipus_iva')
    .isFloat({ min: 0 })
    .withMessage('El tipus d\'IVA no pot ser negatiu'),
  body('import_net')
    .isFloat({ min: 0.01 })
    .withMessage('L\'import net ha de ser superior a zero'),
  body('data_despesa')
    .isDate()
    .withMessage('La data de la despesa ha de ser una data vàlida'),
  body('categoria')
    .notEmpty()
    .withMessage('La categoria és obligatòria'),
];

module.exports = {
  expenseValidation,
};
