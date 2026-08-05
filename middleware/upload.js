const multer = require('multer');

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed.'));
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Keep aliases so existing route imports continue to work
module.exports = {
  upload,
  galleryUpload: upload,
  teamUpload: upload,
  campaignUpload: upload,
  certificateUpload: upload,
  ensureUploadDir() {},
  ensureGalleryUploadDir() {},
  ensureTeamUploadDir() {},
  ensureCampaignUploadDir() {},
  ensureCertificateUploadDir() {}
};
