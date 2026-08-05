const { Media } = require('../models');

function parseMediaId(url) {
  if (!url) return null;
  const match = String(url).trim().match(/^\/media\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function isMediaUrl(url) {
  return Boolean(parseMediaId(url));
}

async function saveUploadedFile(file) {
  if (!file || !file.buffer) return null;

  const media = await Media.create({
    mimeType: file.mimetype || 'application/octet-stream',
    originalName: file.originalname || null,
    size: file.size || file.buffer.length || 0,
    data: file.buffer
  });

  return `/media/${media.id}`;
}

async function saveUploadedFiles(files) {
  const urls = [];
  for (const file of files || []) {
    const url = await saveUploadedFile(file);
    if (url) urls.push(url);
  }
  return urls;
}

async function deleteMediaByUrl(url) {
  const id = parseMediaId(url);
  if (!id) return false;
  await Media.destroy({ where: { id } });
  return true;
}

async function deleteMediaByUrls(urls) {
  const list = Array.isArray(urls) ? urls : [urls];
  for (const url of list) {
    await deleteMediaByUrl(url);
  }
}

module.exports = {
  parseMediaId,
  isMediaUrl,
  saveUploadedFile,
  saveUploadedFiles,
  deleteMediaByUrl,
  deleteMediaByUrls
};
