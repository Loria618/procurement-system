import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  companies: '&name', 
  suppliers: '&name', 
  procurementOrders: '++id, companyName, supplierName, itemName, quantity, unitPrice, totalPrice, creationDate' 
});

export default db;
