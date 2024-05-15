import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  templates: 'name', 
  companies: '&name',
  suppliers: '&name'
});

export default db;