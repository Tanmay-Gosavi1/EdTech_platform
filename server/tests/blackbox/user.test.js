const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User.js');
jest.mock('../../models/Course.js');
jest.mock('../../models/Purchase.js');
jest.mock('../../models/CourseProgress.js');
jest.mock('stripe', () => jest.fn(() => ({
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        url: 'https://stripe.test/session',
        metadata: { purchaseId: 'p1' }
      })
    }
  }
})));

const User = require('../../models/User.js');
const Course = require('../../models/Course.js');
const Purchase = require('../../models/Purchase.js');
const CourseProgress = require('../../models/CourseProgress.js');
const userRouter = require('../../routes/userRoutes.js');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/user', userRouter);
  return app;
};

describe('user API (black-box)', () => {
  let app;
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'blackbox-user-secret';
    process.env.CLIENT_URL = 'http://localhost:5173';
    process.env.CURRENCY = 'USD';
    process.env.STRIPE_SECRET_KEY = 'sk_test';

    app = buildApp();
    token = jwt.sign({ id: 'u1' }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
  });

  test('GET /api/user/data rejects missing token', async () => {
    const res = await request(app).get('/api/user/data');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Authorization token is missing' });
  });

  test('GET /api/user/data returns user profile for valid token', async () => {
    User.findById.mockResolvedValue({ _id: 'u1', name: 'Alice' });

    const res = await request(app)
      .get('/api/user/data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      user: { _id: 'u1', name: 'Alice' },
      message: 'User data fetched successfully'
    });
  });

  test('GET /api/user/enrolled-courses returns populated courses', async () => {
    const populate = jest.fn().mockResolvedValue({ enrolledCourses: ['c1', 'c2'] });
    User.findById.mockReturnValue({ populate });

    const res = await request(app)
      .get('/api/user/enrolled-courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      enrolledCourses: ['c1', 'c2'],
      message: 'User enrolled courses fetched successfully'
    });
  });

  test('POST /api/user/purchase blocks duplicate purchases', async () => {
    User.findById.mockResolvedValue({ _id: 'u1' });
    Course.findById.mockResolvedValue({ _id: 'c1', courseTitle: 'Node', coursePrice: 100, discount: 10 });
    Purchase.findOne.mockResolvedValue({ _id: 'p-existing' });

    const res = await request(app)
      .post('/api/user/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'c1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Course already purchased' });
  });

  test('POST /api/user/update-course-progress validates required payload', async () => {
    const res = await request(app)
      .post('/api/user/update-course-progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'c1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid data for updating course progress'
    });
  });

  test('POST /api/user/get-course-progress returns progress data', async () => {
    CourseProgress.findOne.mockResolvedValue({ courseId: 'c1', lectureCompleted: ['l1'] });

    const res = await request(app)
      .post('/api/user/get-course-progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'c1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      progressData: { courseId: 'c1', lectureCompleted: ['l1'] },
      message: 'Course progress fetched successfully'
    });
  });

  test('POST /api/user/add-rating rejects when user is not enrolled', async () => {
    Course.findById.mockResolvedValue({ courseRatings: [] });
    User.findById.mockResolvedValue({ enrolledCourses: [] });

    const res = await request(app)
      .post('/api/user/add-rating')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'c1', rating: 5 });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, message: 'User not enrolled in the course' });
  });
});
