import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import fs from 'fs';
import app from '../../server';

chai.use(chaiHttp);

describe('File Endpoints', () => {
  let token;
  let fileId;

  before(async () => {
    // Authenticate and get token
    const res = await chai.request(app)
      .get('/connect')
      .auth('test@example.com', 'testpassword');
    token = res.body.token;
  });

  describe('POST /files', () => {
    it('should upload a file', async () => {
      const res = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fs.readFileSync(`${__dirname}/../../README.md`), 'README.md')
        .field('name', 'README.md')
        .field('type', 'file');
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      fileId = res.body.id;
    });
  });

  describe('GET /files/:id', () => {
    it('should retrieve file information', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('name', 'README.md');
    });
  });

  describe('GET /files', () => {
    it('should list files with pagination', async () => {
      const res = await chai.request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      const res = await chai.request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('isPublic', true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      const res = await chai.request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('isPublic', false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should retrieve file data', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
    });

    it('should retrieve thumbnail if size specified', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}/data`)
        .query({ size: 500 })
        .set('X-Token', token);
      expect(res).to.have.status(200);
    });
  });
});
