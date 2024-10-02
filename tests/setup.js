import { MongoClient } from 'mongodb';
import { promisify } from 'util';
import redisClient from '../utils/redis';

before(async function() {
  this.timeout(10000);
  const dbClient = await MongoClient.connect(process.env.DB_HOST || 'mongodb://localhost:27017');
  const db = dbClient.db(process.env.DB_DATABASE || 'files_manager_test');
  
  // Clear database
  await db.collection('users').deleteMany({});
  await db.collection('files').deleteMany({});
  
  // Clear Redis
  const redisKeys = await promisify(redisClient.client.keys).bind(redisClient.client)('*');
  for (const key of redisKeys) {
    await promisify(redisClient.client.del).bind(redisClient.client)(key);
  }
});
