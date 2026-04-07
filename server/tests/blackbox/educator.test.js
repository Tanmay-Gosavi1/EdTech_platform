const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User.js');
jest.mock('../../models/Course.js');
jest.mock('../../models/Purchase.js');
jest.mock('../../configs/cloudinary.js', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://img.test/course.png' })
    }
  }
}));

const User = require('../../models/User.js');
const Course = require('../../models/Course.js');
const Purchase = require('../../models/Purchase.js');
const educatorRouter = require('../../routes/educatorRoutes.js');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/educator', educatorRouter);
  return app;
};

describe('educator API (black-box)', () => {
  let app;
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'blackbox-educator-secret';
    token = jwt.sign({ id: 'e1' }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    app = buildApp();
  });

  test('POST /api/educator/update-role rejects missing token', async () => {
    const res = await request(app).post('/api/educator/update-role');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Authorization token is missing' });
  });

  test('POST /api/educator/update-role promotes student to educator', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    User.findById.mockResolvedValue({ role: 'student', save });

    const res = await request(app)
      .post('/api/educator/update-role')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'User can publish courses now' });
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('GET /api/educator/courses blocks non-educator role', async () => {
    User.findById.mockResolvedValue({ role: 'student' });

    const res = await request(app)
      .get('/api/educator/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, message: 'Only educators can add courses' });
  });

  test('GET /api/educator/courses returns educator courses', async () => {
    User.findById.mockResolvedValue({ role: 'educator' });
    Course.find.mockResolvedValue([{ _id: 'c1', courseTitle: 'Node' }]);

    const res = await request(app)
      .get('/api/educator/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      courses: [{ _id: 'c1', courseTitle: 'Node' }],
      message: 'Educator courses fetched successfully'
    });
  });

  test('POST /api/educator/add-course returns 400 when thumbnail is missing', async () => {
    User.findById.mockResolvedValue({ role: 'educator' });

    const res = await request(app)
      .post('/api/educator/add-course')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseData: JSON.stringify({ courseTitle: 'Node' }) });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Thumbnail not attached' });
  });

  test('GET /api/educator/dashboard returns dashboard aggregates', async () => {
    User.findById.mockResolvedValue({ role: 'educator' });
    Course.find.mockResolvedValue([{ _id: 'c1', courseTitle: 'Node', enrolledStudents: ['s1'] }]);
    Purchase.find.mockResolvedValue([{ amount: 1200 }]);
    User.find.mockResolvedValueOnce([{ name: 'Alice', imageUrl: '/a.png' }]);

    const res = await request(app)
      .get('/api/educator/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dashboardData.totalCourses).toBe(1);
    expect(res.body.dashboardData.totalEarning).toBe(1200);
    expect(res.body.dashboardData.enrolledStudentsData).toHaveLength(1);
  });

  test('DELETE /api/educator/courses/:CourseId returns 404 when not found', async () => {
    User.findById.mockResolvedValue({ role: 'educator' });
    Course.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/educator/courses/c1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: 'Course not found' });
  });
});
