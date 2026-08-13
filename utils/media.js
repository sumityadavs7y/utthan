const path = require('path');
const fs = require('fs');
const { MediaAsset } = require('../models');

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function mediaUrl(id) {
  if (!id) return '';
  return `/media/${id}`;
}

function mimeFromName(filename) {
  const ext = path.extname(String(filename || '')).toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

function sourceKeyFromPath(imagePath) {
  if (!imagePath) return null;
  const raw = String(imagePath).trim();
  if (!raw) return null;
  return raw.replace(/^\/images\//, '').replace(/^images\//, '');
}

async function createMediaFromBuffer({ buffer, mimeType, originalName, sourceKey = null }) {
  if (!buffer || !buffer.length) return null;
  const payload = {
    mimeType: mimeType || 'application/octet-stream',
    originalName: originalName || null,
    byteSize: buffer.length,
    data: buffer
  };
  if (sourceKey) {
    const existing = await MediaAsset.findOne({ where: { sourceKey } });
    if (existing) {
      await existing.update(payload);
      return existing;
    }
    payload.sourceKey = sourceKey;
  }
  return MediaAsset.create(payload);
}

async function createMediaFromUpload(file, sourceKey = null) {
  if (!file || !file.buffer) return null;
  return createMediaFromBuffer({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    sourceKey
  });
}

async function createMediaFromDisk(filePath, sourceKey) {
  const buffer = fs.readFileSync(filePath);
  return createMediaFromBuffer({
    buffer,
    mimeType: mimeFromName(filePath),
    originalName: path.basename(filePath),
    sourceKey
  });
}

async function findMediaIdByPath(imagePath) {
  const key = sourceKeyFromPath(imagePath);
  if (!key) return null;
  const asset = await MediaAsset.findOne({
    where: { sourceKey: key },
    attributes: ['id']
  });
  return asset ? asset.id : null;
}

function resolveImageUrl(record, idField = 'imageId', pathField = 'imagePath') {
  if (!record) return '';
  if (record[idField]) return mediaUrl(record[idField]);
  return record[pathField] || '';
}

module.exports = {
  mediaUrl,
  mimeFromName,
  sourceKeyFromPath,
  createMediaFromBuffer,
  createMediaFromUpload,
  createMediaFromDisk,
  findMediaIdByPath,
  resolveImageUrl
};
