import chai from 'chai';
import sinon from 'sinon';
import { expect } from 'chai';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

describe('Utilities', () => {
  describe('redisClient', () => {
    it('should connect to Redis successfully', async () => {
      expect(redisClient.isAlive()).to.be.true;
    });

    it('should set and get values correctly', async () => {
      await redisClient.set('testKey', 'testValue', 10);
      const value = await redisClient.get('testKey');
      expect(value).to.equal('testValue');
    });

    it('should delete values correctly', async () => {
      await redisClient.set('testKey', 'testValue', 10);
      await redisClient.del('testKey');
      const value = await redisClient.get('testKey');
      expect(value).to.be.null;
    });
  });

  describe('dbClient', () => {
    it('should connect to MongoDB successfully', () => {
      expect(dbClient.isAlive()).to.be.true;
    });

    it('should return the correct number of users', async () => {
      const usersCount = await dbClient.nbUsers();
      expect(usersCount).to.be.a('number');
    });

    it('should return the correct number of files', async () => {
      const filesCount = await dbClient.nbFiles();
      expect(filesCount).to.be.a('number');
    });
  });
});
