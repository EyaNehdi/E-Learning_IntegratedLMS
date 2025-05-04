const User = require('../models/userModel');
const Course = require('../models/course');

const purchaseCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.userId; // From verifyToken

  try {

    if (!courseId) {
      console.error("Missing courseId");
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`Course not found: ${courseId}`);
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.price === 0) {
      return res.status(200).json({ message: "Free course, no purchase required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if course is already purchased
    if (user.purchasedCourses.some(pc => pc.courseId.toString() === courseId)) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Check balance
    if (user.balance < course.price) {
      console.error(`Insufficient balance: user ${userId}, balance: ${user.balance}, price: ${course.price}`);
      return res.status(400).json({ message: "Insufficient Trelix Coins" });
    }

    // Deduct coins and add to purchasedCourses
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: -course.price },
        $push: {
          purchasedCourses: { courseId, purchaseDate: new Date() },
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: `Course ${course.title} purchased successfully!`,
      balance: updatedUser.balance,
    });
  } catch (err) {
    console.error("Error purchasing course:", err);
    res.status(500).json({ message: "Failed to purchase course", error: err.message });
  }
};

const checkCourseAccess = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.userId;

  try {

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.price === 0) {
      return res.status(200).json({ hasAccess: true });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasAccess = user.purchasedCourses.some(pc => pc.courseId.toString() === courseId);
    res.status(200).json({ hasAccess });
  } catch (err) {
    console.error("Error checking course access:", err);
    res.status(500).json({ message: "Failed to check course access", error: err.message });
  }
};

module.exports = {
  purchaseCourse,
  checkCourseAccess
};