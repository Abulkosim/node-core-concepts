class DatabaseService {
  query(sql) {
    console.log(`Executing: ${sql}`);
    return [{ id: 1, name: 'record' }];
  }
}

class DatabaseProxy {
  constructor(db, user) {
    this.db = db;
    this.user = user;
  }

  query(sql) {
    if (sql.trim().toUpperCase().startsWith('DROP') && this.user.role !== 'admin') {
      throw new Error(`User "${this.user.name}" is not allowed to execute DROP statements`);
    }
    return this.db.query(sql);
  }
}

const db = new DatabaseService();
const proxy = new DatabaseProxy(db, { name: 'junior_dev', role: 'developer' });

proxy.query('SELECT * FROM users');   
proxy.query('DROP TABLE users');     