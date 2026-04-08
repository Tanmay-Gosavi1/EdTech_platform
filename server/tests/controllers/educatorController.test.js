jest.mock('../../models/User.js');
jest.mock('../../models/Course.js');
jest.mock('../../models/Purchase.js');
jest.mock('../../utils/youtubeTranscript.js', () => ({
  enrichCourseContentWithTranscripts: jest.fn(async (courseContent) => courseContent)
}));
jest.mock('../../configs/cloudinary.js', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn()
    }
  }
}));

const User = require('../../models/User.js');
const Course = require('../../models/Course.js');
const Purchase = require('../../models/Purchase.js');
const { cloudinary } = require('../../configs/cloudinary.js');
const {
  updateRoleToEducator,
  addCourse,
  getEducatorCourses,
  educatorDashboardData,
  getEnrolledStudentsData,
  deleteCourse
} = require('../../controllers/educatorController.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('educatorController (white-box)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateRoleToEducator', () => {
    test('returns 401 when userId is missing', async () => {
      const req = {};
      const res = createRes();

      await updateRoleToEducator(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
    });

    test('returns 404 when user is not found', async () => {
      User.findById.mockResolvedValue(null);
      const req = { userId: 'u1' };
      const res = createRes();

      await updateRoleToEducator(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    test('returns 200 when user is already educator', async () => {
      User.findById.mockResolvedValue({ role: 'educator' });
      const req = { userId: 'u1' };
      const res = createRes();

      await updateRoleToEducator(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User is already an educator' });
    });

    test('updates role and returns 200 for non-educator user', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const user = { role: 'student', save };
      User.findById.mockResolvedValue(user);

      const req = { userId: 'u1' };
      const res = createRes();

      await updateRoleToEducator(req, res);

      expect(user.role).toBe('educator');
      expect(save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User can publish courses now' });
    });

    test('returns 500 when update role throws', async () => {
      User.findById.mockRejectedValue(new Error('db error'));
      const req = { userId: 'u1' };
      const res = createRes();

      await updateRoleToEducator(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error updating role to educator'
      });
    });
  });

  describe('addCourse', () => {
    test('returns 400 when thumbnail is not attached', async () => {
      const req = { userId: 'u1', body: { courseData: '{}' } };
      const res = createRes();

      await addCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Thumbnail not attached' });
    });

    test('creates course and returns 201 when request is valid', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      Course.create.mockResolvedValue({ save });
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://img.test/course.png' });

      const req = {
        userId: 'u1',
        file: { path: '/tmp/thumbnail.png' },
        body: {
          courseData: JSON.stringify({ courseTitle: 'DSA', coursePrice: 100 })
        }
      };
      const res = createRes();

      await addCourse(req, res);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/tmp/thumbnail.png');
      expect(Course.create).toHaveBeenCalledWith({
        courseTitle: 'DSA',
        coursePrice: 100,
        educator: 'u1',
        courseThumbnail: 'https://img.test/course.png'
      });
      expect(save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Course added successfully' });
    });

    test('returns 500 when JSON parsing fails', async () => {
      const req = {
        userId: 'u1',
        file: { path: '/tmp/thumbnail.png' },
        body: { courseData: '{bad-json}' }
      };
      const res = createRes();

      await addCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error adding new course' });
    });
  });

  describe('getEducatorCourses', () => {
    test('returns 200 with educator courses', async () => {
      Course.find.mockResolvedValue([{ _id: 'c1' }, { _id: 'c2' }]);
      const req = { userId: 'e1' };
      const res = createRes();

      await getEducatorCourses(req, res);

      expect(Course.find).toHaveBeenCalledWith({ educator: 'e1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        courses: [{ _id: 'c1' }, { _id: 'c2' }],
        message: 'Educator courses fetched successfully'
      });
    });

    test('returns 500 when getEducatorCourses throws', async () => {
      Course.find.mockRejectedValue(new Error('db down'));
      const req = { userId: 'e1' };
      const res = createRes();

      await getEducatorCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error getting educator courses'
      });
    });
  });

  describe('educatorDashboardData', () => {
    test('returns aggregated earnings, courses count and enrolled students', async () => {
      const courses = [
        { _id: 'c1', courseTitle: 'Node', enrolledStudents: ['s1'] },
        { _id: 'c2', courseTitle: 'React', enrolledStudents: ['s2', 's3'] }
      ];

      Course.find.mockResolvedValue(courses);
      Purchase.find.mockResolvedValue([{ amount: 1000 }, { amount: 2500 }]);
      User.find
        .mockResolvedValueOnce([{ name: 'A' }])
        .mockResolvedValueOnce([{ name: 'B' }, { name: 'C' }]);

      const req = { userId: 'e1' };
      const res = createRes();

      await educatorDashboardData(req, res);

      expect(Purchase.find).toHaveBeenCalledWith({
        courseId: { $in: ['c1', 'c2'] },
        status: 'completed'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.dashboardData.totalCourses).toBe(2);
      expect(payload.dashboardData.totalEarning).toBe(3500);
      expect(payload.dashboardData.enrolledStudentsData).toHaveLength(3);
    });

    test('returns 500 when dashboard query fails', async () => {
      Course.find.mockRejectedValue(new Error('db error'));
      const req = { userId: 'e1' };
      const res = createRes();

      await educatorDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error getting educator dashboard data'
      });
    });
  });

  describe('deleteCourse', () => {
    test('returns 404 when course is not found for educator', async () => {
      Course.findOne.mockResolvedValue(null);

      const req = { userId: 'e1', params: { CourseId: 'c1' } };
      const res = createRes();

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found' });
    });

    test('deletes course and returns updated list', async () => {
      const deleteOne = jest.fn().mockResolvedValue(undefined);
      Course.findOne.mockResolvedValue({ deleteOne });
      Course.find.mockResolvedValue([{ _id: 'c2' }]);

      const req = { userId: 'e1', params: { CourseId: 'c1' } };
      const res = createRes();

      await deleteCourse(req, res);

      expect(deleteOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        allCourses: [{ _id: 'c2' }]
      });
    });

    test('returns 500 when deleteCourse throws', async () => {
      Course.findOne.mockRejectedValue(new Error('db crash'));

      const req = { userId: 'e1', params: { CourseId: 'c1' } };
      const res = createRes();

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error deleting course' });
    });
  });

  describe('getEnrolledStudentsData', () => {
    test('returns enrolled students mapped from purchases', async () => {
      Course.find.mockResolvedValue([{ _id: 'c1' }]);

      const purchases = [
        {
          userId: { name: 'Alice', imageUrl: '/a.png' },
          courseId: { courseTitle: 'Node' },
          createdAt: new Date('2026-01-01')
        }
      ];

      const populateSecond = jest.fn().mockResolvedValue(purchases);
      const populateFirst = jest.fn().mockReturnValue({ populate: populateSecond });
      Purchase.find.mockReturnValue({ populate: populateFirst });

      const req = { userId: 'e1' };
      const res = createRes();

      await getEnrolledStudentsData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        enrolledStudents: [
          {
            student: { name: 'Alice', imageUrl: '/a.png' },
            courseTitle: 'Node',
            purchaseDate: new Date('2026-01-01')
          }
        ]
      });
    });

    test('returns 500 when getEnrolledStudentsData throws', async () => {
      Course.find.mockRejectedValue(new Error('db down'));
      const req = { userId: 'e1' };
      const res = createRes();

      await getEnrolledStudentsData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error getting enrolled students data'
      });
    });
  });
});
