jest.mock('../../models/User.js');
jest.mock('validator');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const User = require('../../models/User.js');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loginUser, signupUser, userInfo } = require('../../controllers/loginController.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('loginController (white-box)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'test-secret';
    validator.isEmail.mockReturnValue(true);
    jwt.sign.mockReturnValue('signed-token');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('loginUser returns 400 when email/password are missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = createRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email and password are required' });
  });

  test('loginUser returns 400 when email is invalid', async () => {
    validator.isEmail.mockReturnValue(false);

    const req = { body: { email: 'bad-mail', password: 'secret123' } };
    const res = createRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid email format' });
  });

  test('loginUser returns 400 when user does not exist', async () => {
    const select = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select });

    const req = { body: { email: 'user@example.com', password: 'secret123' } };
    const res = createRes();

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
  });

  test('loginUser returns 400 when password is incorrect', async () => {
    const select = jest.fn().mockResolvedValue({
      _id: 'u1',
      name: 'A',
      email: 'user@example.com',
      password: 'hashed-pass'
    });
    User.findOne.mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email: 'user@example.com', password: 'wrongpass' } };
    const res = createRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Incorrect password' });
  });

  test('loginUser returns 200 with token when credentials are correct', async () => {
    const user = {
      _id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed-pass'
    };

    const select = jest.fn().mockResolvedValue(user);
    User.findOne.mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(true);

    const req = { body: { email: 'alice@example.com', password: 'secret123' } };
    const res = createRes();

    await loginUser(req, res);

    expect(jwt.sign).toHaveBeenCalledWith({ id: 'u1' }, 'test-secret', { expiresIn: '7d' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Login successful',
      token: 'signed-token',
      user: {
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com'
      }
    });
  });

  test('loginUser returns 500 when unexpected error occurs', async () => {
    const select = jest.fn().mockRejectedValue(new Error('db error'));
    User.findOne.mockReturnValue({ select });

    const req = { body: { email: 'user@example.com', password: 'secret123' } };
    const res = createRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error during login' });
  });

  test('signupUser returns 400 when required fields are missing', async () => {
    const req = { body: { name: '', email: '', password: '' } };
    const res = createRes();

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
  });

  test('userInfo returns 401 when req.userId is missing', async () => {
    const req = {};
    const res = createRes();

    await userInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
  });
});
