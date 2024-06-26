/* eslint-disable no-undef */
require('dotenv').config();

const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const routes = {
  register: '/v1/auth/register',
  login: '/v1/auth/login',
  refeshToken: '/v1/auth/refresh-token',
  logout: '/v1/auth/logout'
};

let refreshToken;

describe(`GET ${routes.register}`, () => {
  test('it should return bad request when required field are not filled', async () => {
    const response = await request(app)
      .post(routes.register)
      .send({
        username: 'test'
      });

    expect(response.successCode || response.body.code).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/required|empty/);
    expect(response.body.data).toBe(null);
  });

  test('it should return success when successfully registered', async () => {
    const response = await request(app)
      .post(routes.register)
      .send({
        username: 'test',
        password: 'test'
      });

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Successfully Registered');
    expect(response.body.data.username).toBe('test');
  });

  test('it should return Username already exist when user exist', async () => {
    const response = await request(app)
      .post(routes.register)
      .send({
        username: 'test',
        password: 'test'
      });

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Username already Exist');
    expect(response.body.data).toBe(null);
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        username: 'test'
      }
    });
  });
});

describe(`GET ${routes.login}`, () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('test', 10);
    await User.create({
      username: 'test',
      password: hashedPassword,
      level: 'user'
    });
  });

  test('it should return bad request when required field are not filled', async () => {
    const response = await request(app)
      .post(routes.login)
      .send({
        username: 'test'
      });

    expect(response.successCode || response.body.code).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/required|empty/);
    expect(response.body.data).toBe(null);
  });

  test('it should return login failed when username or password is wrong', async () => {
    const response = await request(app)
      .post(routes.login)
      .send({
        username: 'test',
        password: 'asdsadsad'
      });

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Username or Password is Incorrect');
    expect(response.body.data).toBe(null);
  });

  test('it should return success when username and password is correct', async () => {
    const response = await request(app)
      .post(routes.login)
      .send({
        username: 'test',
        password: 'test'
      });

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OK');
    expect(response.body.data).toBe('test');
    expect(response.headers).toHaveProperty('Eurokars-Auth-Token');
    expect(response.headers).toHaveProperty('Eurokars-Auth-Refresh-Token');
    expect(jwt.verify(response.headers['Eurokars-Auth-Token'], process.env.JWT_PRIVATE_KEY)).toBeTruthy();
  });
});

describe(`PUT ${routes.refeshToken}`, () => {
  beforeAll(async () => {
    const response = await request(app)
      .post(routes.login)
      .send({
        username: 'test',
        password: 'test'
      });

    refreshToken = response.headers['Eurokars-Auth-Refresh-Token'];
  });

  test('it should return token not provided when token is null', async () => {
    const response = await request(app)
      .put(routes.refeshToken)
      .set('Eurokars-Auth-Token', '');

    expect(response.successCode || response.body.code).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not Provided');
    expect(response.body.data).toBe(null);
  });

  test('it should return success when token is valid', async () => {
    const response = await request(app)
      .put(routes.refeshToken)
      .set('Eurokars-Auth-Refresh-Token', refreshToken);

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OK');
    expect(response.body.data.username).toBe('test');
    expect(response.headers).toHaveProperty('Eurokars-Auth-Token');
    expect(jwt.verify(response.headers['Eurokars-Auth-Token'], process.env.JWT_PRIVATE_KEY)).toBeTruthy();
  });
});

describe(`DELETE : ${routes.logout}`, () => {
  test('it should return token not provided when token is null', async () => {
    const response = await request(app)
      .delete(routes.logout)
      .set('Eurokars-Auth-Token', '');

    expect(response.successCode || response.body.code).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not Provided');
    expect(response.body.data).toBe(null);
  });

  test('it should return success when token is valid', async () => {
    const response = await request(app)
      .delete(routes.logout)
      .set('Eurokars-Auth-Refresh-Token', refreshToken);

    expect(response.successCode || response.body.code).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OK');
    expect(response.body.data).toBe('logged out');
    expect(response.headers).toHaveProperty('Eurokars-Auth-Token');
    expect(response.headers).toHaveProperty('Eurokars-Auth-Refresh-Token');
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        username: 'test'
      }
    });
  });
});
