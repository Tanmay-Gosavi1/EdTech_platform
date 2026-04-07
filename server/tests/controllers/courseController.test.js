jest.mock('../../models/Course.js');

const Course = require('../../models/Course.js');
const { getAllCourses, getCourseById } = require('../../controllers/courseController.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('courseController (white-box)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCourses', () => {
    test('returns 200 with published courses', async () => {
      const populate = jest.fn().mockResolvedValue([{ _id: 'c1' }]);
      const select = jest.fn().mockReturnValue({ populate });
      Course.find.mockReturnValue({ select });

      const req = {};
      const res = createRes();

      await getAllCourses(req, res);

      expect(Course.find).toHaveBeenCalledWith({ isPublished: true });
      expect(select).toHaveBeenCalledWith(['-courseContent', '-enrolledStudents']);
      expect(populate).toHaveBeenCalledWith({ path: 'educator' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        courses: [{ _id: 'c1' }],
        message: 'Courses fetched successfully'
      });
    });

    test('returns 500 when query fails', async () => {
      const populate = jest.fn().mockRejectedValue(new Error('db error'));
      const select = jest.fn().mockReturnValue({ populate });
      Course.find.mockReturnValue({ select });

      const req = {};
      const res = createRes();

      await getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error fetching all courses' });
    });
  });

  describe('getCourseById', () => {
    test('returns 200 and strips non-preview lecture URLs', async () => {
      const course = {
        _id: 'c1',
        courseContent: [
          {
            chapterTitle: 'Intro',
            chapterContent: [
              { lectureUrl: 'https://a', isPreviewFree: true },
              { lectureUrl: 'https://b', isPreviewFree: false }
            ]
          }
        ]
      };

      const populate = jest.fn().mockResolvedValue(course);
      Course.findById.mockReturnValue({ populate });

      const req = { params: { id: 'c1' } };
      const res = createRes();

      await getCourseById(req, res);

      expect(course.courseContent[0].chapterContent[0].lectureUrl).toBe('https://a');
      expect(course.courseContent[0].chapterContent[1].lectureUrl).toBe('');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        course,
        message: 'Course fetched successfully'
      });
    });

    test('returns 500 when getCourseById throws', async () => {
      const populate = jest.fn().mockRejectedValue(new Error('query fail'));
      Course.findById.mockReturnValue({ populate });

      const req = { params: { id: 'c1' } };
      const res = createRes();

      await getCourseById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error fetching course By Id' });
    });
  });
});
