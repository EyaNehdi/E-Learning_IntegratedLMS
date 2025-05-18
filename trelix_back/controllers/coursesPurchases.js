const User = require('../models/userModel');
const Course = require('../models/course');
const { recordFinancialEvent } = require('../services/financialEventService');

const purchaseCourse = async (req, res) => {
  const { courseId, courseSlug } = req.body;
  const userId = req.userId;

  try {

    let course;
    if (courseId) {
      course = await Course.findById(courseId);
    } else if (courseSlug) {
      course = await Course.findOne({ slug: courseSlug });
    } else {
      return res.status(400).json({ message: "courseId or courseSlug is required" });
    }

    if (!course) {
      console.error(`Course not found: ${courseId}`);
      return res.status(404).json({ message: "Course not found" });
    }
    const resolvedCourseId = course._id;
    if (course.price === 0) {
      return res.status(200).json({ message: "Free course, no purchase required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if course is already purchased
    if (user.purchasedCourses.some(pc => pc.courseId.toString() === resolvedCourseId.toString())) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Check balance
    if (user.balance < course.price) {
      console.error(`Insufficient balance: user ${userId}, balance: ${user.balance}, price: ${course.price}`);
      return res.status(403).json({
        message: "Insufficient Trelix Coins",
        userBalance: user.balance,
        coursePrice: course.price,
      });
    }

    // Deduct coins and add to purchasedCourses
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: -course.price },
        $push: {
          purchasedCourses: { courseId: resolvedCourseId, purchaseDate: new Date() },
        },
      },
      { new: true }
    );
    await recordFinancialEvent({
      userId: user._id,
      type: 'purchase',
      amount: -course.price,
      relatedObject: course._id,
      relatedModel: 'Course',
      metadata: { courseTitle: course.title },
    });

    res.status(200).json({
      message: `Course ${course.title} purchased successfully!`,
      balance: updatedUser.balance,
    });
  } catch (err) {
    console.error("Error purchasing course:", err);
    res.status(500).json({ message: "Failed to purchase course", error: err.message });
  }
};

// const checkCourseAccess = async (req, res) => {
//   const { courseId } = req.params;
//   const userId = req.userId;

//   try {

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     if (course.price === 0) {
//       return res.status(200).json({ hasAccess: true });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const hasAccess = user.purchasedCourses.some(pc => pc.courseId.toString() === courseId);
//     res.status(200).json({ hasAccess });
//   } catch (err) {
//     console.error("Error checking course access:", err);
//     res.status(500).json({ message: "Failed to check course access", error: err.message });
//   }
// };

const checkCoursesAccessBulk = async (req, res) => {
  const { courseIds } = req.body;
  const userId = req.userId;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ message: "No course IDs provided" });
  }

  try {
    const user = await User.findById(userId).select('purchasedCourses');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.purchasedCourses.forEach((pc, i) => {
      if (!pc.courseId) {
        console.warn(`⚠️ Missing courseId in purchasedCourses[${i}]:`, pc);
      }
    });

    const accessMap = {};
    courseIds.forEach((courseId) => {
      const hasAccess = user.purchasedCourses.some(
        (pc) => pc.courseId && pc.courseId.toString() === courseId
      );
      accessMap[courseId] = hasAccess;
    });

    res.status(200).json({ access: accessMap });
  } catch (err) {
    res.status(500).json({
      message: "Failed to check access for courses",
      error: err.message,
    });
  }
};



module.exports = {
  purchaseCourse,
  checkCoursesAccessBulk,
};