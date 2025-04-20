const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirBadges = path.resolve(process.cwd(), 'uploads', 'badges');
if (!fs.existsSync(uploadDirBadges)) {
  fs.mkdirSync(uploadDirBadges, { recursive: true });
}

const storageBadges = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirBadges);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadBadges = multer({ storage: storageBadges });

module.exports = uploadBadges;
