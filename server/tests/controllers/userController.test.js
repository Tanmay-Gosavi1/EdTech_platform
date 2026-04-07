jest.mock('../../models/User.js');
jest.mock('../../models/Course.js');
jest.mock('../../models/Purchase.js');
jest.mock('../../models/CourseProgress.js');
jest.mock('stripe', () => jest.fn());

const Stripe = require('stripe');
const User = require('../../models/User.js');
const Course = require('../../models/Course.js');
const Purchase = require('../../models/Purchase.js');
const CourseProgress = require('../../models/CourseProgress.js');
const {
  getUserData,
  userEnrolledCourses,
  purchaseCourse,
  verifyStripePayment,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating
} = require('../../controllers/userController.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController (white-box)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLIENT_URL = 'http://localhost:5173';
    process.env.CURRENCY = 'USD';
    process.env.STRIPE_SECRET_KEY = 'sk_test';
  });

  describe('getUserData', () => {
    test('returns 404 when user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      const req = { userId: 'u1' };
      const res = createRes();

      await getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    test('returns 200 with user data when user exists', async () => {
      const user = { _id: 'u1', name: 'Alice' };
      User.findById.mockResolvedValue(user);
      const req = { userId: 'u1' };
      const res = createRes();

      await getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user,
        message: 'User data fetched successfully'
      });
    });

    test('returns 500 when findById throws', async () => {
      User.findById.mockRejectedValue(new Error('db failed'));
      const req = { userId: 'u1' };
      const res = createRes();

      await getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error fetching user data' });
    });
  });

  describe('userEnrolledCourses', () => {
    test('returns enrolled courses from populated user', async () => {
      const populate = jest.fn().mockResolvedValue({ enrolledCourses: ['c1', 'c2'] });
      User.findById.mockReturnValue({ populate });

      const req = { userId: 'u1' };
      const res = createRes();

      await userEnrolledCourses(req, res);

      expect(populate).toHaveBeenCalledWith('enrolledCourses');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        enrolledCourses: ['c1', 'c2'],
        message: 'User enrolled courses fetched successfully'
      });
    });

    test('returns 500 when populate query fails', async () => {
      const populate = jest.fn().mockRejectedValue(new Error('query failed'));
      User.findById.mockReturnValue({ populate });

      const req = { userId: 'u1' };
      const res = createRes();

      await userEnrolledCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error fetching enrolled courses' });
    });
  });

  describe('purchaseCourse', () => {
    test('returns 404 when user/course data is missing', async () => {
      User.findById.mockResolvedValue(null);
      Course.findById.mockResolvedValue({ _id: 'c1' });

      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await purchaseCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Data not found' });
    });

    test('returns 400 when course is already purchased', async () => {
      User.findById.mockResolvedValue({ _id: 'u1' });
      Course.findById.mockResolvedValue({ _id: 'c1', coursePrice: 100, discount: 10, courseTitle: 'X' });
      Purchase.findOne.mockResolvedValue({ _id: 'p-existing' });

      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await purchaseCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course already purchased' });
    });

    test('returns 200 with stripe session url on successful purchase', async () => {
      const createSession = jest.fn().mockResolvedValue({
        url: 'https://stripe-session.test',
        metadata: { purchaseId: 'p1' }
      });

      Stripe.mockImplementation(() => ({
        checkout: {
          sessions: {
            create: createSession
          }
        }
      }));

      User.findById.mockResolvedValue({ _id: 'u1' });
      Course.findById.mockResolvedValue({
        _id: 'c1',
        courseTitle: 'Node Mastery',
        coursePrice: 100,
        discount: 10
      });
      Purchase.findOne.mockResolvedValue(null);
      Purchase.create.mockResolvedValue({ _id: 'p1', amount: 9000 });

      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await purchaseCourse(req, res);

      expect(Purchase.create).toHaveBeenCalledWith({
        courseId: 'c1',
        userId: 'u1',
        amount: 9000
      });
      expect(createSession).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, session_url: 'https://stripe-session.test' });
    });

    test('returns 500 when an unexpected error occurs', async () => {
      User.findById.mockRejectedValue(new Error('db down'));

      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await purchaseCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error during course purchase' });
    });
  });

  describe('verifyStripePayment', () => {
    test('returns 400 when purchaseId is missing', async () => {
      const req = { userId: 'u1', body: { success: 'true' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Missing purchase id' });
    });

    test('returns 404 when purchase record does not exist', async () => {
      Purchase.findById.mockResolvedValue(null);
      const req = { userId: 'u1', body: { success: 'true', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Purchase not found' });
    });

    test('returns 403 when purchase does not belong to requesting user', async () => {
      Purchase.findById.mockResolvedValue({ userId: 'another-user' });
      const req = { userId: 'u1', body: { success: 'true', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized purchase verification' });
    });

    test('returns 404 when status update cannot find purchase', async () => {
      Purchase.findById.mockResolvedValue({ userId: 'u1' });
      Purchase.findByIdAndUpdate.mockResolvedValue(null);
      const req = { userId: 'u1', body: { success: 'true', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Purchase not found' });
    });

    test('returns 200 and enrolls user/course on success=true', async () => {
      Purchase.findById.mockResolvedValue({ userId: 'u1' });
      Purchase.findByIdAndUpdate.mockResolvedValue({ userId: 'u1', courseId: 'c1' });

      const courseSave = jest.fn().mockResolvedValue(undefined);
      const userSave = jest.fn().mockResolvedValue(undefined);

      Course.findById.mockResolvedValue({ _id: 'c1', enrolledStudents: [], save: courseSave });
      User.findById.mockResolvedValue({ _id: 'u1', enrolledCourses: [], save: userSave });

      const req = { userId: 'u1', body: { success: 'true', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(courseSave).toHaveBeenCalledTimes(1);
      expect(userSave).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment verified and order placed successfully'
      });
    });

    test('returns 200 with failed payment payload when success is not true', async () => {
      Purchase.findById.mockResolvedValue({ userId: 'u1' });
      Purchase.findByIdAndUpdate.mockResolvedValue({ _id: 'p1' });

      const req = { userId: 'u1', body: { success: 'false', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(Purchase.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'failed' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Payment failed, order cancelled' });
    });

    test('returns 500 when verifyStripePayment throws', async () => {
      Purchase.findById.mockRejectedValue(new Error('query crash'));
      const req = { userId: 'u1', body: { success: 'true', purchaseId: 'p1' } };
      const res = createRes();

      await verifyStripePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Verifying payment failed',
        error: 'query crash'
      });
    });
  });

  describe('updateUserCourseProgress', () => {
    test('returns 400 when courseId or lectureId is missing', async () => {
      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await updateUserCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data for updating course progress'
      });
    });

    test('returns 200 when lecture is already marked complete', async () => {
      CourseProgress.findOne.mockResolvedValue({ lectureCompleted: ['l1'] });
      const req = { userId: 'u1', body: { courseId: 'c1', lectureId: 'l1' } };
      const res = createRes();

      await updateUserCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Lecture already marked as completed'
      });
    });

    test('updates existing progress with a new lecture', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      CourseProgress.findOne.mockResolvedValue({ lectureCompleted: ['l1'], save });

      const req = { userId: 'u1', body: { courseId: 'c1', lectureId: 'l2' } };
      const res = createRes();

      await updateUserCourseProgress(req, res);

      expect(save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course progress created and lecture marked as completed'
      });
    });

    test('creates progress when one does not exist', async () => {
      CourseProgress.findOne.mockResolvedValue(null);
      CourseProgress.create.mockResolvedValue({ _id: 'cp1' });

      const req = { userId: 'u1', body: { courseId: 'c1', lectureId: 'l1' } };
      const res = createRes();

      await updateUserCourseProgress(req, res);

      expect(CourseProgress.create).toHaveBeenCalledWith({
        userId: 'u1',
        courseId: 'c1',
        lectureCompleted: ['l1']
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 500 when progress update throws', async () => {
      CourseProgress.findOne.mockRejectedValue(new Error('db err'));
      const req = { userId: 'u1', body: { courseId: 'c1', lectureId: 'l1' } };
      const res = createRes();

      await updateUserCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error updating course progress'
      });
    });
  });

  describe('getUserCourseProgress', () => {
    test('returns 200 with progress payload', async () => {
      const progressData = { courseId: 'c1', lectureCompleted: ['l1'] };
      CourseProgress.findOne.mockResolvedValue(progressData);

      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await getUserCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        progressData,
        message: 'Course progress fetched successfully'
      });
    });

    test('returns 500 when getUserCourseProgress throws', async () => {
      CourseProgress.findOne.mockRejectedValue(new Error('db crash'));
      const req = { userId: 'u1', body: { courseId: 'c1' } };
      const res = createRes();

      await getUserCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error fetching course progress'
      });
    });
  });

  describe('addUserRating', () => {
    test('returns 400 when input is invalid', async () => {
      const req = { userId: 'u1', body: { courseId: '', rating: 6 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid data for adding rating' });
    });

    test('returns 404 when course is not found', async () => {
      Course.findById.mockResolvedValue(null);
      const req = { userId: 'u1', body: { courseId: 'c1', rating: 5 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found' });
    });

    test('returns 403 when user is not enrolled in the course', async () => {
      Course.findById.mockResolvedValue({ courseRatings: [] });
      User.findById.mockResolvedValue({ enrolledCourses: [] });

      const req = { userId: 'u1', body: { courseId: 'c1', rating: 4 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not enrolled in the course' });
    });

    test('updates an existing rating when user has already rated', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const courseData = {
        courseRatings: [{ userId: { toString: () => 'u1' }, rating: 2 }],
        save
      };

      Course.findById.mockResolvedValue(courseData);
      User.findById.mockResolvedValue({ enrolledCourses: ['c1'] });

      const req = { userId: 'u1', body: { courseId: 'c1', rating: 5 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(courseData.courseRatings[0].rating).toBe(5);
      expect(save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('adds a new rating when no prior rating exists', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const courseData = {
        courseRatings: [],
        save
      };

      Course.findById.mockResolvedValue(courseData);
      User.findById.mockResolvedValue({ enrolledCourses: ['c1'] });

      const req = { userId: 'u1', body: { courseId: 'c1', rating: 3 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(courseData.courseRatings).toEqual([{ userId: 'u1', rating: 3 }]);
      expect(save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Rating added/updated successfully' });
    });

    test('returns 500 when addUserRating throws', async () => {
      Course.findById.mockRejectedValue(new Error('db fail'));
      const req = { userId: 'u1', body: { courseId: 'c1', rating: 3 } };
      const res = createRes();

      await addUserRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error adding/updating rating' });
    });
  });
});
