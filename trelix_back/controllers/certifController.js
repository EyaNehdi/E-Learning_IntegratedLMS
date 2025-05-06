const Certificate = require("../models/Certificate");
const User = require("../models/userModel");
const Course = require("../models/course");

const fs = require('fs');
const fontkit = require('fontkit');
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const QRCode = require('qrcode');

async function generateCertificate(user, course) {
    const templatePath = path.join(__dirname, '../templates-cert/certificate_design_trelix.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    pdfDoc.registerFontkit(fontkit);

    const greatVibesFontBytes = fs.readFileSync(path.join(__dirname, '../templates-cert/fonts/GreatVibes-Regular.ttf'));
    const caviarBoldFontBytes = fs.readFileSync(path.join(__dirname, '../templates-cert/fonts/CaviarDreams_Bold.ttf'));
    const openSansSemiBoldFontBytes = fs.readFileSync(path.join(__dirname, '../templates-cert/fonts/OpenSans-SemiBold.ttf'));
    const greatVibesFont = await pdfDoc.embedFont(greatVibesFontBytes);
    const caviarBoldFont = await pdfDoc.embedFont(caviarBoldFontBytes);
    const openSansFont = await pdfDoc.embedFont(openSansSemiBoldFontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = pages[0].getSize();

    const Student_Name = [user.firstName, user.lastName]
        .filter(Boolean)
        .join('\u00A0')
        .trim();
    const Student_Name_textWidth = greatVibesFont.widthOfTextAtSize(Student_Name, 64);

    firstPage.drawText(Student_Name, {
        x: ((width - Student_Name_textWidth) / 2),
        y: 250,
        size: 64,
        font: greatVibesFont,
        color: rgb(0, 0, 0)
    });

    const Course_Name = `${course.title}`;
    const Course_Name_textWidth = caviarBoldFont.widthOfTextAtSize(Course_Name, 24);

    firstPage.drawText(Course_Name, {
        x: ((width - Course_Name_textWidth) / 2),
        y: 160,
        size: 24,
        font: caviarBoldFont,
        color: rgb(0, 0, 0)
    });

    // Insert Date Acquired
    const acquiredDate = new Date().toLocaleDateString();
    firstPage.drawText(acquiredDate, {
        x: 270,
        y: 70,
        size: 12,
        font: openSansFont,
        color: rgb(0, 0, 0)
    });
    const cleanTitle = course.title.replace(/\s+/g, '');
    // Generate QR Code for verification
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrCodeDir = path.join(__dirname, "../certificates");
    const qrCodePath = path.join(qrCodeDir, `qrcode-${user._id}-${cleanTitle}.png`);
    await QRCode.toFile(qrCodePath, `http://localhost:5173/verify/${verificationCode}`);

    // Embed QR Code in the PDF
    const qrImageBytes = fs.readFileSync(qrCodePath);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    firstPage.drawImage(qrImage, {
        x: 680,
        y: 75,
        width: 100,
        height: 100
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    const certificateDir = path.join(__dirname, `../certificates/certificate-${user._id}-${cleanTitle}.pdf`);
    fs.writeFileSync(certificateDir, pdfBytes);
    const certificatePath = `/certificates/certificate-${user._id}-${cleanTitle}.pdf`;
    // sendCertificateEmail(user.email, certificatePath);
    return { certificatePath: certificatePath, verificationCode: verificationCode };
}

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
        const certifInfo = generateCertificate(user, course);
        if (!existingCertificate) {
            existingCertificate = new Certificate({
                name: courseName,
                courseId: courseId,
                description: `Certificate for completing ${courseName}`,
                category: "Course Completion",
                provider: provider,
                providerLogo: provider === "Trelix" ? "/assets/images/ss.png" : null,
                certificateFile: `/templates-cert/certificate-template.pdf`,
                external: provider !== "Trelix",
            });

            await existingCertificate.save();
        }

        user.certificatesOwned.push({
            certificateId: existingCertificate._id,
            acquiredOn: new Date(),
            verificationCode: (await certifInfo).verificationCode,
            pdfUrl: (await certifInfo).certificatePath,
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

        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const allCertificates = await Certificate.find().populate('courseId', 'slug');

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
                courseId: cert.courseId._id,
                courseSlug: cert.courseId.slug,
                name: cert.name,
                description: cert.description,
                issuer: cert.provider,
                logo: cert.providerLogo || "/default-certificate-logo.png",
                isOwned: !!ownedData,
                acquiredOn: ownedData?.acquiredOn || null,
                verificationCode: ownedData?.verificationCode || null,
                pdfUrl: ownedData?.pdfUrl || null,
                certificateOwnedId: ownedData?._id || null,
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