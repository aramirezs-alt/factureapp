const fs = require('fs');
const path = require('path');

const dict = {
  "Nuevo Producto": "Nou Producte",
  "Guardando producto": "Desant producte",
  "Producto creado correctamente": "Producte creat correctament",
  "Error al guardar el producto": "Error en desar el producte",
  "Guardar Producto": "Desar Producte",
  "Información del Producto": "Informació del Producte",
  "Describe las características del producto o servicio...": "Descriu les característiques del producte o servei...",
  "Este precio se aplicará por defecto al seleccionar el producto en una factura.": "Aquest preu s'aplicarà per defecte en seleccionar el producte en una factura.",
  "Nuevo Cliente": "Nou Client",
  "Guardando cliente": "Desant client",
  "Cliente creado correctamente": "Client creat correctament",
  "Error al guardar el cliente": "Error en desar el client",
  "Guardar Cliente": "Desar Client",
  "Añadir Línea": "Afegir Línia",
  "Guardar Factura": "Desar Factura",
  "Guardar Perfil": "Desar Perfil",
  "Eliminar": "Eliminar",
  "Editar": "Editar",
  "Cancelar": "Cancel·lar",
  "Guardar": "Desar",
  "Cerrar sesión": "Tancar sessió",
  "Iniciar sesión": "Iniciar sessió",
  "Gasto Recurrent": "Despesa Recurrent",
  "Gastos": "Despeses",
  "Duplicar Factura": "Duplicar Factura",
  "Nueva Factura": "Nova Factura",
  "Creando una copia...": "Creant una còpia...",
  "Genera un nuevo documento.": "Genera un nou document.",
  "Conceptos de la Factura": "Conceptes de la Factura",
  "CONCEPTO / PRODUCTO": "CONCEPTE / PRODUCTE",
  "Cliente": "Client",
  "Proveedor": "Proveïdor",
  "Producto": "Producte",
  "productos cargados": "productes carregats",
  "Error al iniciar sesión": "Error a l'iniciar sessió",
  "No se puede eliminar el producto porque está siendo usado en facturas": "No es pot eliminar el producte perquè s'està utilitzant en factures",
  "No se puede eliminar el cliente porque tiene facturas asociadas": "No es pot eliminar el client perquè té factures associades",
  "El cliente es obligatorio": "El client és obligatori",
  "El cliente no tiene email configurado": "El client no té email configurat",
  "Error al guardar": "Error en desar",
  "Dashboard": "Tauler",
  "Inicio": "Inici",
  "Facturas": "Factures",
  "Clientes": "Clients",
  "Proveedores": "Proveïdors",
  "Productos": "Productes",
  "Gastos": "Despeses",
  "Configuración": "Configuració",
  "Perfil": "Perfil"
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk(path.join(__dirname, 'frontend/src')), ...walk(path.join(__dirname, 'backend/src'))];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [es, ca] of Object.entries(dict)) {
    // Basic replace for exact matches, case-sensitive
    // Using simple string replaceAll because some strings might have special characters
    content = content.replaceAll(es, ca);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
