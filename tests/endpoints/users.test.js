import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import app from '../../server';
import dbClient from '../../utils/db';

chai.use(chaiHttp);

describe('User Endpoints', () => {
  let token;

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await chai.request(app)
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', 'test@example.com');
    });

    it('should return error if email is missing', async () => {
      const res = await chai.request(app)
        .post('/users')
        .send({ password: 'testpassword' });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'Missing email');
    });

    it('should return error if password is missing', async () => {
      const res = await chai.request(app)
        .post('/users')
        .send({ email: 'test@example.com' });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'Missing password');
    });
  });

  describe('GET /connect', () => {
    it('should authenticate user and return token', async () => {
      const res = await chai.request(app)
        .get('/connect')
        .auth('test@example.com', 'testpassword');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
      token = res.body.token;
    });
  });

  describe('GET /disconnect', () => {
    it('should disconnect user', async () => {
      const res = await chai.request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res).to.have.status(204);
    });
  });

  describe('GET /users/me', () => {
    it('should return user information', async () => {
      const res = await chai.request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('email', 'test@example.com');
    });
  });
});
