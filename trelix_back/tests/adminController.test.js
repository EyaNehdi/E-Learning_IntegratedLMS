const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/adminController');
const User = require('../models/userModel');

// Mock the User model
jest.mock('../models/userModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
describe('getUsers', () => {
    it('should return users with selected fields', async () => {
      const users = [
        { firstName: "Eya", lastName: "Nehdi", email: "eya@example.com", role: "student" },
      ];
  
      User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(users) });
  
      const req = {};
      const res = mockResponse();
  
      await getUsers(req, res);
  
      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });
  
    it('should handle errors', async () => {
      User.find.mockImplementation(() => ({
        select: jest.fn().mockRejectedValue(new Error('DB error'))
      }));
  
      const req = {};
      const res = mockResponse();
  
      await getUsers(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  describe('getUserById', () => {
    it('should return 400 if ID is not provided', async () => {
      const req = { params: {} };
      const res = mockResponse();
  
      await getUserById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });
  
    it('should return user if found', async () => {
      const mockUser = { firstName: 'Eya', lastName: 'Nehdi' };
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
  
      const req = { params: { id: '123' } };
      const res = mockResponse();
  
      await getUserById(req, res);
  
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  
    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
  
      const req = { params: { id: '456' } };
      const res = mockResponse();
  
      await getUserById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return 500 on DB error', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB error'))
      });
  
      const req = { params: { id: '789' } };
      const res = mockResponse();
  
      await getUserById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error' }));
    });
  });
  describe('createUser', () => {
    it('should create and return new user', async () => {
      const newUser = { firstName: 'Eya', email: 'eya@example.com' };
      User.create.mockResolvedValue(newUser);
  
      const req = { body: newUser };
      const res = mockResponse();
  
      await createUser(req, res);
  
      expect(User.create).toHaveBeenCalledWith(newUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });
  
    it('should return 500 on error', async () => {
      User.create.mockRejectedValue(new Error('DB error'));
  
      const req = { body: {} };
      const res = mockResponse();
  
      await createUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
  describe('updateUser', () => {
    it('should update and return user', async () => {
      const updatedUser = { firstName: 'Updated Eya' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);
  
      const req = { params: { id: '1' }, body: { firstName: 'Updated Eya' } };
      const res = mockResponse();
  
      await updateUser(req, res);
  
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', { firstName: 'Updated Eya' }, { new: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });
  });
  describe('deleteUser', () => {
    it('should delete user and return success message', async () => {
      User.findByIdAndDelete.mockResolvedValue({});
  
      const req = { params: { id: '1' } };
      const res = mockResponse();
  
      await deleteUser(req, res);
  
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
    });
  
    it('should return 500 on error', async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
  
      const req = { params: { id: '1' } };
      const res = mockResponse();
  
      await deleteUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
          