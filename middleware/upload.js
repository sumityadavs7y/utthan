const path = require('path');
const fs = require('fs');
const multer = require('multer');

const blogsUploadDir = path.join(__dirname, '../public/uploads/blogs');
const galleryUploadDir = path.join(__dirname, '../public/uploads/gallery');
const teamUploadDir = path.join(__dirname, '../public/uploads/team');
const campaignUploadDir = path.join(__dirname, '../public/uploads/campaigns');
const certificateUploadDir = path.join(__dirname, '../public/uploads/certificates');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function ensureUploadDir() {
  ensureDir(blogsUploadDir);
}

function ensureGalleryUploadDir() {
  ensureDir(galleryUploadDir);
}

function ensureTeamUploadDir() {
  ensureDir(teamUploadDir);
}

function ensureCampaignUploadDir() {
  ensureDir(campaignUploadDir);
}

function ensureCertificateUploadDir() {
  ensureDir(certificateUploadDir);
}

function createStorage(uploadDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
  });
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed.'));
  }
}

const multerLimits = {
  fileSize: 5 * 1024 * 1024
};

const upload = multer({
  storage: createStorage(blogsUploadDir),
  fileFilter,
  limits: multerLimits
});

const galleryUpload = multer({
  storage: createStorage(galleryUploadDir),
  fileFilter,
  limits: multerLimits
});

const teamUpload = multer({
  storage: createStorage(teamUploadDir),
  fileFilter,
  limits: multerLimits
});

const campaignUpload = multer({
  storage: createStorage(campaignUploadDir),
  fileFilter,
  limits: multerLimits
});

const certificateUpload = multer({
  storage: createStorage(certificateUploadDir),
  fileFilter,
  limits: multerLimits
});

module.exports = {
  upload,
  galleryUpload,
  teamUpload,
  campaignUpload,
  certificateUpload,
  ensureUploadDir,
  ensureGalleryUploadDir,
  ensureTeamUploadDir,
  ensureCampaignUploadDir,
  ensureCertificateUploadDir,
  uploadDir: blogsUploadDir,
  galleryUploadDir,
  teamUploadDir,
  campaignUploadDir,
  certificateUploadDir
};
