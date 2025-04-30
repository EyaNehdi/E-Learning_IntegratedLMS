const { getChapters, createChapter, updateChapter, deleteChapter, assignChapters, getChaptersByCourse } = require('../controllers/chapterController');
const Chapter = require('../models/chapterModels');
const Course = require('../models/course');

jest.mock('../models/chapterModels');
jest.mock('../models/course');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Chapter Controller", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getChapters", () => {
    it("should return all chapters", async () => {
      const chapters = [{ title: "Chapter 1" }, { title: "Chapter 2" }];
      Chapter.find.mockResolvedValue(chapters);

      const res = mockRes();
      await getChapters({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(chapters);
    });
  });

  describe("createChapter", () => {
    it("should create a chapter and return it", async () => {
      const mockChapter = {
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(Chapter.prototype, "save").mockResolvedValue(mockChapter);

      const req = {
        body: {
          title: "New Chapter",
          userid: "user123",
          courseId: "course1",
          description: "Test"
        },
        files: {
          pdf: [{ filename: "chapter.pdf" }],
          video: [{ filename: "video.mp4" }]
        }
      };
      const res = mockRes();

      await createChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if title or userid is missing", async () => {
      const req = { body: {}, files: {} };
      const res = mockRes();

      await createChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateChapter", () => {
    it("should update a chapter", async () => {
      Chapter.findByIdAndUpdate.mockResolvedValue({ title: "Updated" });
      const req = { params: { id: "id1" }, body: { title: "Updated" } };
      const res = mockRes();

      await updateChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if chapter not found", async () => {
      Chapter.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: "id1" }, body: { title: "Updated" } };
      const res = mockRes();

      await updateChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteChapter", () => {
    it("should delete a chapter", async () => {
      Chapter.findByIdAndDelete.mockResolvedValue({ _id: "1" });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await deleteChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if chapter not found", async () => {
      Chapter.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: "404" } };
      const res = mockRes();

      await deleteChapter(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("assignChapters", () => {
    it("should assign chapters to a course", async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      Course.findById.mockResolvedValue({ chapters: ["c1"], save: mockSave });

      const req = {
        body: { courseId: "course1", chapters: ["c2"] }
      };
      const res = mockRes();

      await assignChapters(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if course not found", async () => {
      Course.findById.mockResolvedValue(null);
      const req = {
        body: { courseId: "wrong", chapters: ["c2"] }
      };
      const res = mockRes();

      await assignChapters(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getChaptersByCourse", () => {
    it("should return chapters by course", async () => {
      Course.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({ chapters: ["ch1", "ch2"] }),
      }));

      const req = { params: { courseId: "course1" } };
      const res = mockRes();

      await getChaptersByCourse(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if course not found", async () => {
      Course.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));

      const req = { params: { courseId: "bad" } };
      const res = mockRes();

      await getChaptersByCourse(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
