import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    
    const uri = `mongodb://${host}:${port}`;
    
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.db = null;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Connected successfully to MongoDB server');
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
      });
  }

  isAlive() {
    return !!this.client && !!this.db;
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    const users = this.db.collection('users');
    const count = await users.countDocuments();
    return count;
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    const files = this.db.collection('files');
    const count = await files.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
export default dbClient;
