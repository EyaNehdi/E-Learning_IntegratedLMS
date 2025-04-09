const Certificate = require("../models/Certificate");
const User = require("../models/userModel");
const Course = require("../models/course");

const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const issueCertificate = async (req, res) => {
    try {
        const { userId, courseId, provider } = req.body;

        if (!userId || !courseId || !provider) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(400).json({ error: "Course not found" });
        }

        const courseName = course.title;
        const user = await User.findById(userId).populate("certificatesOwned.certificateId");

        if (user.certificatesOwned.some(cert => cert.certificateId && cert.certificateId.courseId.equals(courseId))) {
            return res.status(400).json({ error: "Certificate already earned for this course" });
        }

        let existingCertificate = await Certificate.findOne({ courseId });

        if (!existingCertificate) {
            existingCertificate = new Certificate({
                name: courseName,
                courseId: courseId,
                description: `Certificate for completing ${courseName}`,
                category: "Course Completion",
                provider: provider,
                providerLogo: provider === "Trelix" ? "/assets/images/ss.png" : null,
                external: provider !== "Trelix",
            });

            await existingCertificate.save();
        }

        user.certificatesOwned.push({
            certificateId: existingCertificate._id,
            acquiredOn: new Date(),
            verificationCode: generateVerificationCode(),
            pdfUrl: `/certificates/${existingCertificate._id}.pdf`,
        });

        await user.save();

        res.status(200).json({
            message: "Certificate issued successfully",
            certificate: existingCertificate,
        });
    } catch (error) {
        console.error("Error issuing certificate:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(userId).populate("certificatesOwned.certificateId");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const certificates = user.certificatesOwned.map(cert => ({
            id: cert.certificateId._id,
            courseId: cert.certificateId.courseId,
            name: cert.certificateId.name,
            description: cert.certificateId.description,
            issuer: cert.certificateId.provider,
            logo: cert.certificateId.providerLogo || "/default-certificate-logo.png",
            issuedDate: cert.acquiredOn,
            pdfUrl: cert.pdfUrl,
            verificationCode: cert.verificationCode,
        }));

        res.status(200).json({ certificates });
    } catch (error) {
        console.error("Error fetching user certificates:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAllCertifWithOwnedStatus = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const allCertificates = await Certificate.find();

        const user = await User.findById(userId).select("certificatesOwned");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const ownedMap = new Map(
            user.certificatesOwned.map(cert => [cert.certificateId.toString(), cert])
        );

        const certificatesWithOwnership = allCertificates.map(cert => {
            const ownedData = ownedMap.get(cert._id.toString());
            return {
                id: cert._id,
                courseId: cert.courseId,
                name: cert.name,
                description: cert.description,
                issuer: cert.provider,
                logo: cert.providerLogo || "/default-certificate-logo.png",
                isOwned: !!ownedData,
                acquiredOn: ownedData?.acquiredOn || null,
                verificationCode: ownedData?.verificationCode || null,
                pdfUrl: ownedData?.pdfUrl || null,
            };
        });

        res.status(200).json(certificatesWithOwnership);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserAchievements = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId)
            .populate({
                path: 'completedChapters',
                select: 'courseId',
            })
            .populate({
                path: 'certificatesOwned',
                select: 'certificateId',
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const enrolledCourses = [
            ...new Set(user.completedChapters.map(chapter => chapter.courseId.toString())),
        ];
        
        const completedCourses = user.certificatesOwned.map(cert => cert.certificateId.toString());

        const coursesEnrolled = enrolledCourses.length;
        const completed = completedCourses.length;
        const percentage = coursesEnrolled > 0 ? (completed / coursesEnrolled) * 100 : 0;

        const accountCreatedAt = user.accountCreatedAt;
        const accountLife = calculateAccountAge(accountCreatedAt);

        const achievements = {
            badges: user.badges,
            courseProgress: {
                coursesEnrolled,
                completed,
                percentage,
            },
            latestCourses: enrolledCourses.slice(0, 5),
            accountLife,
            accountCreatedAt,
            quizzesCompleted: user.totalScore,
            quizzesCompleted100: Math.floor(user.totalScore / 10),
        };
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const calculateAccountAge = (accountCreatedAt) => {
    const now = new Date();
    const diff = now - new Date(accountCreatedAt);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${years} years, ${months} months`;
};

module.exports = { issueCertificate, getUserCertificates, getAllCertifWithOwnedStatus, getUserAchievements };