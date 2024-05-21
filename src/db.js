import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  companies: '&companyName',
  suppliers: '&supplierName'
});

db.open().catch((err) => {
  console.error("Open failed: " + err.stack);
});

export default db;
