const { Gallery, User } = require('../models');

const DEFAULT_GALLERY = [
  { title: 'Gallery image 1', imagePath: '/images/gallery/pic1.jpg' },
  { title: 'Gallery image 2', imagePath: '/images/gallery/pic2.jpg' },
  { title: 'Gallery image 3', imagePath: '/images/gallery/pic3.jpg' },
  { title: 'Gallery image 4', imagePath: '/images/gallery/pic4.jpg' },
  { title: 'Gallery image 5', imagePath: '/images/gallery/pic5.jpg' },
  { title: 'Gallery image 6', imagePath: '/images/gallery/pic6.jpg' },
  { title: 'Gallery image 7', imagePath: '/images/gallery/pic7.jpg' },
  { title: 'Gallery image 8', imagePath: '/images/gallery/pic8.jpg' },
  { title: 'Gallery image 9', imagePath: '/images/gallery/pic9.jpg' },
  { title: 'Gallery image 10', imagePath: '/images/gallery/pic10.jpg' },
  { title: 'Gallery image 11', imagePath: '/images/gallery/pic11.jpg' },
  { title: 'Gallery image 12', imagePath: '/images/gallery/pic12.jpg' }
];

async function seedDefaultGallery() {
  const count = await Gallery.count();
  if (count > 0) {
    return;
  }

  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.warn('⚠️  Skipping gallery seed: no admin user found.');
    return;
  }

  await Gallery.bulkCreate(
    DEFAULT_GALLERY.map((item) => ({
      userId: admin.id,
      title: item.title,
      imagePath: item.imagePath
    }))
  );

  console.log(`🖼️  Seeded ${DEFAULT_GALLERY.length} default gallery images.`);
}

module.exports = {
  seedDefaultGallery
};
