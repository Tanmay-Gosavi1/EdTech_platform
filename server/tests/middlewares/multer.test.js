jest.mock('multer', () => {
  const multerFactory = jest.fn(() => ({
    single: jest.fn()
  }));

  multerFactory.diskStorage = jest.fn(() => 'mock-storage');
  return multerFactory;
});

const multer = require('multer');
const { upload } = require('../../middlewares/multer.js');

describe('multer middleware config', () => {
  test('creates upload middleware with diskStorage configuration', () => {
    expect(multer.diskStorage).toHaveBeenCalledWith({});
    expect(multer).toHaveBeenCalledWith({ storage: 'mock-storage' });
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe('function');
  });
});
