import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import app from '../../server';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

chai.use(chaiHttp);

describe('App Endpoints', () => {
  describe('GET /status', () => {
    it('should return correct status', async () => {
      const res = await chai.request(app).get('/status');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('redis').to.be.a('boolean');
      expect(res.body).to.have.property('db').to.be.a('boolean');
    });
  });

  describe('GET /stats', () => {
    it('should return correct stats', async () => {
      const res = await chai.request(app).get('/stats');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users').to.be.a('number');
      expect(res.body).to.have.property('files').to.be.a('number');
    });
  });
});
