const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./server');
const User = require('./models/User');
const Signal = require('./models/Signal');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Authentication', () => {
  test('should login admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: '1234', password: '1234' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });
});

describe('Signals CRUD', () => {
  let signalId;

  test('should create a signal', async () => {
    const res = await request(app)
      .post('/api/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        signalId: 'S001',
        name: 'Test Signal',
        district: 'Test District',
        location: { lat: 10.0, lng: 20.0 },
        gateways: 2
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    signalId = res.body._id;
  });

  test('should get all signals', async () => {
    const res = await request(app)
      .get('/api/signals')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should update a signal', async () => {
    const res = await request(app)
      .put(`/api/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Signal' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Updated Signal');
  });

  test('should delete a signal', async () => {
    const res = await request(app)
      .delete(`/api/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Signal deleted');
  });
});

describe('Drivers CRUD', () => {
  let driverId;

  test('should create a driver', async () => {
    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: 'D001',
        password: 'password123',
        name: 'Test Driver',
        email: 'test@example.com',
        phone: '1234567890',
        vehicleNumber: 'V001'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    driverId = res.body._id;
  });

  test('should get all drivers', async () => {
    const res = await request(app)
      .get('/api/drivers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should update a driver', async () => {
    const res = await request(app)
      .put(`/api/drivers/${driverId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Driver' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Updated Driver');
  });

  test('should delete a driver', async () => {
    const res = await request(app)
      .delete(`/api/drivers/${driverId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Driver deleted');
  });
});

describe('CORS for Deployed Links', () => {
  test('should allow requests from deployed frontend', async () => {
    const res = await request(app)
      .get('/api/signals')
      .set('Origin', 'https://traffic-client.vercel.app')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });
});
