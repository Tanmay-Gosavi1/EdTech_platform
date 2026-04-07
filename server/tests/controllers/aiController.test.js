const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const loadAiController = ({ withGeminiKey = true } = {}) => {
  jest.resetModules();

  if (withGeminiKey) {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  } else {
    delete process.env.GEMINI_API_KEY;
  }

  const generateContent = jest.fn();
  const getGenerativeModel = jest.fn(() => ({ generateContent }));
  const GoogleGenerativeAI = jest.fn(() => ({ getGenerativeModel }));

  const isValid = jest.fn();

  jest.doMock('@google/generative-ai', () => ({ GoogleGenerativeAI }));
  jest.doMock('mongoose', () => ({
    Types: {
      ObjectId: {
        isValid
      }
    }
  }));
  jest.doMock('../../models/User.js', () => ({ findById: jest.fn() }));
  jest.doMock('../../models/Course.js', () => ({ findById: jest.fn() }));

  const { askCourseDoubt } = require('../../controllers/aiController.js');
  const User = require('../../models/User.js');
  const Course = require('../../models/Course.js');

  return {
    askCourseDoubt,
    User,
    Course,
    isValid,
    generateContent,
    getGenerativeModel,
    GoogleGenerativeAI
  };
};

describe('aiController (white-box)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('returns 500 when GEMINI_API_KEY is not configured', async () => {
    const { askCourseDoubt } = loadAiController({ withGeminiKey: false });

    const req = { userId: 'u1', body: { prompt: 'Help?', courseId: '507f1f77bcf86cd799439011' } };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'GEMINI_API_KEY is not configured' });
  });

  test('returns 400 for missing/blank prompt', async () => {
    const { askCourseDoubt } = loadAiController();

    const req = { userId: 'u1', body: { prompt: '   ', courseId: '507f1f77bcf86cd799439011' } };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Prompt is required' });
  });

  test('returns 400 for prompt longer than 2000 chars', async () => {
    const { askCourseDoubt } = loadAiController();

    const req = {
      userId: 'u1',
      body: { prompt: 'a'.repeat(2001), courseId: '507f1f77bcf86cd799439011' }
    };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Prompt is too long. Keep it under 2000 characters.'
    });
  });

  test('returns 400 for invalid courseId', async () => {
    const { askCourseDoubt, isValid } = loadAiController();
    isValid.mockReturnValue(false);

    const req = { userId: 'u1', body: { prompt: 'Explain linked list', courseId: 'bad-id' } };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Valid courseId is required' });
  });

  test('returns 404 when user is not found', async () => {
    const { askCourseDoubt, isValid, User, Course } = loadAiController();
    isValid.mockReturnValue(true);

    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ isPublished: true })
    });

    const req = { userId: 'u1', body: { prompt: 'Help me', courseId: '507f1f77bcf86cd799439011' } };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
  });

  test('returns 403 when user is not enrolled in the course', async () => {
    const { askCourseDoubt, isValid, User, Course } = loadAiController();
    isValid.mockReturnValue(true);

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ enrolledCourses: [], name: 'Alice' })
    });
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isPublished: true,
        courseTitle: 'Node',
        courseDescription: 'Desc',
        courseContent: []
      })
    });

    const req = { userId: 'u1', body: { prompt: 'Help me', courseId: '507f1f77bcf86cd799439011' } };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'You are not enrolled in this course' });
  });

  test('returns 200 with generated reply for valid enrolled user', async () => {
    const { askCourseDoubt, isValid, User, Course, generateContent, getGenerativeModel } = loadAiController();
    isValid.mockReturnValue(true);

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        enrolledCourses: ['507f1f77bcf86cd799439011'],
        name: 'Alice'
      })
    });
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isPublished: true,
        courseTitle: 'Node Mastery',
        courseDescription: '<b>Learn Node</b>',
        courseContent: [{ chapterTitle: 'Intro' }]
      })
    });

    generateContent.mockResolvedValue({
      response: {
        text: () => 'Use event loop basics first.'
      }
    });

    const req = {
      userId: 'u1',
      body: { prompt: 'What is event loop?', courseId: '507f1f77bcf86cd799439011' }
    };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-3.1-flash-lite-preview' });
    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, reply: 'Use event loop basics first.' });
  });

  test('returns 500 when model generation throws', async () => {
    const { askCourseDoubt, isValid, User, Course, generateContent } = loadAiController();
    isValid.mockReturnValue(true);

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ enrolledCourses: ['507f1f77bcf86cd799439011'], name: 'Alice' })
    });
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isPublished: true,
        courseTitle: 'Node',
        courseDescription: 'Desc',
        courseContent: []
      })
    });

    generateContent.mockRejectedValue(new Error('gemini down'));

    const req = {
      userId: 'u1',
      body: { prompt: 'What is callback?', courseId: '507f1f77bcf86cd799439011' }
    };
    const res = createRes();

    await askCourseDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to generate response' });
  });
});
