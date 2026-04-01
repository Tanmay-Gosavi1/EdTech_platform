jest.mock('jsonwebtoken');
jest.mock('../../models/User.js');

const jwt = require('jsonwebtoken');
const User = require('../../models/User.js');
const { authMiddleware, protectEducator } = require('../../middlewares/authMiddleware.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware (white-box)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'test-secret';
  });

  test('returns 401 when Authorization header is missing', async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authorization token is missing' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when header does not start with Bearer', async () => {
    const req = { headers: { authorization: 'Token abc' } };
    const res = createRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Bearer token value is empty', async () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = createRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authorization token is missing' });
    expect(next).not.toHaveBeenCalled();
  });

  test('sets userId and calls next for valid JWT', async () => {
    jwt.verify.mockReturnValue({ id: 'user-123' });

    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = createRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'test-secret');
    expect(req.userId).toBe('user-123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 401 when jwt.verify throws', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = createRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('protectEducator (white-box)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 404 when user is not found', async () => {
    User.findById.mockResolvedValue(null);

    const req = { userId: 'missing-user' };
    const res = createRes();
    const next = jest.fn();

    await protectEducator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when role is not educator', async () => {
    User.findById.mockResolvedValue({ role: 'student' });

    const req = { userId: 'student-1' };
    const res = createRes();
    const next = jest.fn();

    await protectEducator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Only educators can add courses' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when educator role is valid', async () => {
    User.findById.mockResolvedValue({ role: 'educator' });

    const req = { userId: 'educator-1' };
    const res = createRes();
    const next = jest.fn();

    await protectEducator(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 500 when database query throws', async () => {
    User.findById.mockRejectedValue(new Error('db down'));

    const req = { userId: 'educator-1' };
    const res = createRes();
    const next = jest.fn();

    await protectEducator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error verifying educator role' });
    expect(next).not.toHaveBeenCalled();
  });
});
