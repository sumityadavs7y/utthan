const { ImpactStat, Testimonial } = require('../models');

const DEFAULT_STATS = [
  { label: 'Completed Projects', value: 48, prefix: null, suffix: null, sortOrder: 1 },
  { label: 'Happy Faces', value: 3200, prefix: null, suffix: '+', sortOrder: 2 },
  { label: 'Shelters Provided', value: 85, prefix: null, suffix: '+', sortOrder: 3 },
  { label: 'Animals Rescued', value: 210, prefix: null, suffix: '+', sortOrder: 4 }
];

const DEFAULT_TESTIMONIALS = [
  {
    title: 'Education gave my daughter a future',
    quote: 'Utthan Foundation helped my daughter continue school when we could not afford books or fees. Today she studies with confidence, and our whole family feels hope again.',
    name: 'Sunita Devi',
    role: 'Parent, Lucknow',
    imagePath: '/images/testimonials/large/pic1.jpg',
    sortOrder: 1
  },
  {
    title: 'Support when we needed it most',
    quote: 'During a medical emergency, the foundation stepped in with timely help and guidance. Their volunteers treated us with dignity and care when everything felt uncertain.',
    name: 'Ramesh Kumar',
    role: 'Beneficiary family',
    imagePath: '/images/testimonials/large/pic2.jpg',
    sortOrder: 2
  },
  {
    title: 'Proud to volunteer with Utthan',
    quote: 'Joining as a volunteer showed me how small efforts create lasting change. From education drives to rescue work, every initiative is rooted in compassion and community.',
    name: 'Ananya Sharma',
    role: 'Volunteer',
    imagePath: '/images/testimonials/large/pic3.jpg',
    sortOrder: 3
  }
];

async function seedDefaultImpact() {
  const statCount = await ImpactStat.count();
  if (statCount === 0) {
    await ImpactStat.bulkCreate(DEFAULT_STATS);
    console.log('📊 Seeded default impact stats.');
  }

  const testimonialCount = await Testimonial.count();
  if (testimonialCount === 0) {
    await Testimonial.bulkCreate(DEFAULT_TESTIMONIALS);
    console.log('💬 Seeded default testimonials.');
  }
}

module.exports = {
  seedDefaultImpact,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS
};
