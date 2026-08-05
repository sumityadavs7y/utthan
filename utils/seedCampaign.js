const { Campaign } = require('../models');

const DEFAULT_CAMPAIGNS = [
  {
    title: 'New Shelter For Orphan Kids Specially Abled People',
    category: 'Education',
    imagePath: '/images/project/pic1.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Sahil Kumar',
    authorImagePath: '/images/avatar/avatar1.jpg',
    location: 'Lucknow, UP',
    sortOrder: 1
  },
  {
    title: 'Donation of Food to the underprivileged',
    category: 'Charity',
    imagePath: '/images/project/pic2.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Pawan Giri',
    authorImagePath: '/images/avatar/avatar2.jpg',
    location: 'Lucknow, UP',
    sortOrder: 2
  },
  {
    title: 'Providing free medical help and vaccination',
    category: 'Health',
    imagePath: '/images/project/pic3.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Pawan Giri',
    authorImagePath: '/images/avatar/avatar3.jpg',
    location: 'Lucknow, UP',
    sortOrder: 3
  },
  {
    title: 'Partnering to create a community',
    category: 'Health',
    imagePath: '/images/project/pic4.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Nikhil Singh',
    authorImagePath: '/images/avatar/avatar4.jpg',
    location: 'Lucknow, UP',
    sortOrder: 4
  },
  {
    title: 'Primary School Build for Children',
    category: 'Education',
    imagePath: '/images/project/pic5.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Ayush Singh',
    authorImagePath: '/images/avatar/avatar5.jpg',
    location: 'Lucknow, UP',
    sortOrder: 5
  },
  {
    title: 'Best & Less published their supplier lists',
    category: 'Health',
    imagePath: '/images/project/pic6.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Aman Kumar',
    authorImagePath: '/images/avatar/avatar6.jpg',
    location: 'Lucknow, UP',
    sortOrder: 6
  },
  {
    title: 'New vaccine for cattle calf loss learned',
    category: 'Health',
    imagePath: '/images/project/pic7.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Aman Kumar',
    authorImagePath: '/images/avatar/avatar7.jpg',
    location: 'Lucknow, UP',
    sortOrder: 7
  },
  {
    title: 'Smallest of donations can help change a life',
    category: 'Health',
    imagePath: '/images/project/pic8.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Pawan Giri',
    authorImagePath: '/images/avatar/avatar8.jpg',
    location: 'Lucknow, UP',
    sortOrder: 8
  },
  {
    title: 'It is a long established fact that a reader',
    category: 'Health',
    imagePath: '/images/project/pic9.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Avinash',
    authorImagePath: '/images/avatar/avatar9.jpg',
    location: 'Lucknow, UP',
    sortOrder: 9
  },
  {
    title: 'Charity can help make smile of poor people',
    category: 'Health',
    imagePath: '/images/project/pic10.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Aman',
    authorImagePath: '/images/avatar/avatar5.jpg',
    location: 'Lucknow, UP',
    sortOrder: 10
  },
  {
    title: 'Benefits Earned From Charity Donations',
    category: 'Health',
    imagePath: '/images/project/pic11.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Ayush Singh',
    authorImagePath: '/images/avatar/avatar4.jpg',
    location: 'Lucknow, UP',
    sortOrder: 11
  },
  {
    title: 'The Shameful Story Of Abandoning old ones',
    category: 'Health',
    imagePath: '/images/project/pic12.jpg',
    goalAmount: 70000,
    raisedAmount: 0,
    authorName: 'Avinash',
    authorImagePath: '/images/avatar/avatar3.jpg',
    location: 'Lucknow, UP',
    sortOrder: 12
  }
];

async function seedDefaultCampaigns() {
  const count = await Campaign.count();
  if (count > 0) return;

  await Campaign.bulkCreate(DEFAULT_CAMPAIGNS);
  console.log(`📢 Seeded ${DEFAULT_CAMPAIGNS.length} default campaigns.`);
}

module.exports = {
  seedDefaultCampaigns
};
