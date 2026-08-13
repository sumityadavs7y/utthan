const multer = require('multer');

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif, svg) are allowed.'));
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  upload,
  galleryUpload: upload,
  teamUpload: upload,
  campaignUpload: upload,
  ensureUploadDir() {},
  ensureGalleryUploadDir() {},
  ensureTeamUploadDir() {},
  ensureCampaignUploadDir() {}
};
