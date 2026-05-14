const { body } = require('express-validator');

const invoiceValidation = [
  body('client_id')
    .isUUID()
    .withMessage('El client és obligatori i ha de ser un ID vàlid'),
  body('serie')
    .notEmpty()
    .withMessage('La sèrie és obligatòria'),
  body('data_emissio')
    .isDate()
    .withMessage('La data d\'emissió ha de ser una data vàlida'),
  body('data_venciment')
    .isDate()
    .withMessage('La data de venciment ha de ser una data vàlida'),
  body('estat')
    .optional()
    .isIn(['ESBORRANY', 'ENVIADA', 'PAGADA', 'VENÇUDA', 'CANCEL·LADA'])
    .withMessage('L\'estat no és vàlid'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Les notes han de ser un text'),
  body('lines')
    .isArray({ min: 1 })
    .withMessage('La factura ha de tenir almenys una línia'),
  body('lines.*.descripcio')
    .notEmpty()
    .withMessage('La descripció de la línia és obligatòria'),
  body('lines.*.quantitat')
    .isFloat({ min: 0.01 })
    .withMessage('La quantitat ha de ser superior a zero'),
  body('lines.*.preu_unitari')
    .isFloat({ min: 0 })
    .withMessage('El preu unitari no pot ser negatiu'),
];

module.exports = {
  invoiceValidation,
};
