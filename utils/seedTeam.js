const { Chairman, TeamMember } = require('../models');

const DEFAULT_CHAIRMAN = {
  photoPath: '/images/about/chairman.jpg',
  message: 'The Utthan Foundation was established with a goal to improve the lives of marginalized communities and bring about a positive change in our society. We started with a small team of dedicated individuals who shared a passion for making a difference. Through the years, with the support of our donors and volunteers, we have been able to expand our reach and make a real impact in the lives of many. Our mission is to empower disadvantaged communities by providing access to education, healthcare and livelihood opportunities. We also strive to promote equality and justice for all by raising awareness about social issues and advocating for policy change.',
  name: 'Shri Devendra Pratap Singh',
  role: 'Lecturer @ SVM Inter College',
  signaturePath: '/images/about/signature.png'
};

const DEFAULT_BOARD = [
  { name: 'Bhuvanendra Pratap Singh', designation: 'Founder & President', imagePath: '/images/team/nitin.jpg', sortOrder: 1 },
  { name: 'Nikhilendra Pratap Singh', designation: 'Vice President', imagePath: '/images/team/nikhil.jpg', sortOrder: 2 },
  { name: 'Kavita Kumari', designation: 'Secretary', imagePath: '/images/team/kavita.jpg', sortOrder: 3 },
  { name: 'Indra Kumar Singh', designation: 'Secretary', imagePath: '/images/team/indra.jpg', sortOrder: 4 },
  { name: 'Shivendra Pratap Singh', designation: 'Treasurer', imagePath: '/images/team/shivam.jpg', sortOrder: 5 },
  { name: 'Shristi Kumari', designation: 'Organiser', imagePath: '/images/team/shristi.jpg', sortOrder: 6 },
  { name: 'Pawan Kumar Giri', designation: 'Marketing Head', imagePath: '/images/team/pawan.jpg', sortOrder: 7 }
];

async function seedDefaultTeam() {
  const chairmanCount = await Chairman.count();
  if (chairmanCount === 0) {
    await Chairman.create(DEFAULT_CHAIRMAN);
    console.log('👔 Seeded default chairman profile.');
  }

  const boardCount = await TeamMember.count({ where: { category: 'board' } });
  if (boardCount === 0) {
    await TeamMember.bulkCreate(
      DEFAULT_BOARD.map((member) => ({
        ...member,
        category: 'board'
      }))
    );
    console.log(`👥 Seeded ${DEFAULT_BOARD.length} board members.`);
  }
}

module.exports = {
  seedDefaultTeam
};
