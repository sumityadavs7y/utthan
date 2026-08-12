'use strict';

const IMG = '/images';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('SiteConfigs', [{
      phone: '+91 90000 00000',
      email: 'hello@theutthanfoundation.in',
      address: 'Placeholder UP Office — Street, Locality, Lucknow, Uttar Pradesh 226001',
      addressShort: 'Lucknow, Uttar Pradesh (placeholder)',
      mapEmbedUrl: null,
      facebookUrl: 'https://facebook.com/',
      instagramUrl: 'https://instagram.com/',
      twitterUrl: 'https://x.com/',
      linkedinUrl: 'https://linkedin.com/',
      youtubeUrl: 'https://youtube.com/',
      upiId: 'utthan@upi-placeholder',
      bankName: 'Placeholder Bank of India',
      accountName: 'The Utthan Foundation (Placeholder)',
      accountNumber: '000000000000',
      ifsc: 'PLCH0000000',
      qrImagePath: `${IMG}/donate-qr-placeholder.svg`,
      donationLink: 'https://example.com/donate-placeholder',
      memberFeeNote: 'Membership fee: ₹500 / year (placeholder — replace with real fee structure).',
      createdAt: now,
      updatedAt: now
    }]);

    await queryInterface.bulkInsert('ImpactStats', [
      { label: 'Meals served', value: 12500, prefix: null, suffix: '+', sortOrder: 1, createdAt: now, updatedAt: now },
      { label: 'Children supported', value: 840, prefix: null, suffix: '+', sortOrder: 2, createdAt: now, updatedAt: now },
      { label: 'Villages reached', value: 36, prefix: null, suffix: '', sortOrder: 3, createdAt: now, updatedAt: now },
      { label: 'Active volunteers', value: 120, prefix: null, suffix: '+', sortOrder: 4, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Campaigns', [
      {
        title: 'Winter Warmth Drive',
        slug: 'winter-warmth-drive',
        category: 'Relief',
        status: 'ongoing',
        summary: 'Blankets and warm clothing for families facing cold nights in rural Uttar Pradesh.',
        description: 'Placeholder campaign detail. This winter drive distributes blankets and warm clothes to elderly residents and children in underserved villages. Replace this copy with real campaign narrative.',
        imagePath: `${IMG}/winter-blanket-distribution.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/winter-blanket-distribution.jpg`,
          `${IMG}/winter-clothing-donation.jpg`,
          `${IMG}/clothes-distribution-village.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-11-01', title: 'Campaign launched', detail: 'Volunteer teams formed across districts.' },
          { date: '2025-12-15', title: 'First distribution', detail: 'Blankets delivered in two pilot villages.' },
          { date: '2026-01-20', title: 'Mid-campaign review', detail: 'Expanded to additional blocks.' }
        ]),
        goalAmount: 500000,
        raisedAmount: 312000,
        authorName: 'Field Team',
        authorImagePath: null,
        location: 'Eastern UP (placeholder)',
        startDate: '2025-11-01',
        endDate: '2026-02-28',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'School Kits for Every Child',
        slug: 'school-kits-for-every-child',
        category: 'Education',
        status: 'ongoing',
        summary: 'Books, bags, and classroom support so children can stay in school.',
        description: 'Placeholder education campaign. We provide Hindi, Maths, and Science kits plus backpacks to government school students. Replace with real program details.',
        imagePath: `${IMG}/school-supplies-distribution.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/school-supplies-distribution.jpg`,
          `${IMG}/rural-classroom-teaching.jpg`,
          `${IMG}/community-library-books.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-06-01', title: 'Needs assessment', detail: 'Visited partner schools.' },
          { date: '2025-07-15', title: 'Kit packing', detail: 'Volunteers assembled learning kits.' },
          { date: '2025-08-10', title: 'Distribution begins', detail: 'First 200 kits handed over.' }
        ]),
        goalAmount: 350000,
        raisedAmount: 198000,
        authorName: 'Education Desk',
        authorImagePath: null,
        location: 'Lucknow & Barabanki (placeholder)',
        startDate: '2025-06-01',
        endDate: '2026-03-31',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Community Kitchen Meals',
        slug: 'community-kitchen-meals',
        category: 'Food Security',
        status: 'ongoing',
        summary: 'Hot meals and grocery kits for neighbors facing hunger.',
        description: 'Placeholder food security campaign covering cooked meals and dry ration kits (rice, atta, pulses, oil, salt).',
        imagePath: `${IMG}/hot-meal-distribution.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/hot-meal-distribution.jpg`,
          `${IMG}/food-aid-kit-handover.jpg`,
          `${IMG}/grocery-aid-alley.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-09-01', title: 'Kitchen setup', detail: 'Community kitchen opened.' },
          { date: '2025-10-01', title: 'Daily service', detail: 'Serving lunch packs five days a week.' }
        ]),
        goalAmount: 400000,
        raisedAmount: 256000,
        authorName: 'Kitchen Team',
        authorImagePath: null,
        location: 'Lucknow (placeholder)',
        startDate: '2025-09-01',
        endDate: '2026-08-31',
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Village Health Camps',
        slug: 'village-health-camps',
        category: 'Health',
        status: 'ongoing',
        summary: 'Free check-ups, medicines, and health awareness in partner villages.',
        description: 'Placeholder health campaign. Mobile clinics and weekend camps offer basic screening, medicines, and hygiene education for families with limited clinic access. Replace with real program details.',
        imagePath: `${IMG}/village-aid-notebooks.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/village-aid-notebooks.jpg`,
          `${IMG}/clothes-distribution-village.jpg`,
          `${IMG}/grocery-aid-alley.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-10-01', title: 'Camp calendar set', detail: 'Partner PHCs and volunteer doctors confirmed.' },
          { date: '2025-11-12', title: 'First camp', detail: 'Screening and medicine kits in two villages.' },
          { date: '2026-02-01', title: 'Expanded coverage', detail: 'Added three more blocks.' }
        ]),
        goalAmount: 280000,
        raisedAmount: 142000,
        authorName: 'Health Desk',
        authorImagePath: null,
        location: 'Eastern UP (placeholder)',
        startDate: '2025-10-01',
        endDate: '2026-06-30',
        sortOrder: 4,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Clean Water for Schools',
        slug: 'clean-water-for-schools',
        category: 'Water & Sanitation',
        status: 'ongoing',
        summary: 'Safe drinking water stations and hygiene kits for rural government schools.',
        description: 'Placeholder WASH campaign. We install filtered drinking water points, repair handwash stations, and train student hygiene clubs. Replace with real site names and budgets.',
        imagePath: `${IMG}/community-street-cleanup.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/community-street-cleanup.jpg`,
          `${IMG}/rural-classroom-teaching.jpg`,
          `${IMG}/school-supplies-distribution.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-08-01', title: 'School survey', detail: 'Mapped water access gaps across partner schools.' },
          { date: '2025-09-20', title: 'First installations', detail: 'Filters and tanks fitted at two schools.' },
          { date: '2026-01-10', title: 'Hygiene club training', detail: 'Student monitors trained on maintenance.' }
        ]),
        goalAmount: 320000,
        raisedAmount: 175000,
        authorName: 'WASH Team',
        authorImagePath: null,
        location: 'Barabanki & Sitapur (placeholder)',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        sortOrder: 5,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Community Library Corners',
        slug: 'community-library-corners',
        category: 'Education',
        status: 'ongoing',
        summary: 'Neighborhood reading corners with books, tutoring hours, and parent workshops.',
        description: 'Placeholder literacy campaign. We set up small library corners in community spaces, stock age-appropriate books, and run evening tutoring for primary students. Replace with real locations.',
        imagePath: `${IMG}/community-library-books.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/community-library-books.jpg`,
          `${IMG}/rural-classroom-teaching.jpg`,
          `${IMG}/village-aid-notebooks.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2025-07-01', title: 'Space partnerships', detail: 'Agreements with three community halls.' },
          { date: '2025-08-15', title: 'Book drives', detail: 'First shelves stocked with donated titles.' },
          { date: '2025-12-01', title: 'Tutoring starts', detail: 'Evening sessions for classes 1–5.' }
        ]),
        goalAmount: 250000,
        raisedAmount: 98000,
        authorName: 'Education Desk',
        authorImagePath: null,
        location: 'Lucknow outskirts (placeholder)',
        startDate: '2025-07-01',
        endDate: '2026-06-30',
        sortOrder: 6,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Green Village Saplings',
        slug: 'green-village-saplings',
        category: 'Environment',
        status: 'completed',
        summary: 'Community tree plantation with schools and local volunteers.',
        description: 'Placeholder completed campaign. Saplings planted with school children and elders across partner villages.',
        imagePath: `${IMG}/community-tree-planting.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/community-tree-planting.jpg`,
          `${IMG}/community-street-cleanup.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2024-07-01', title: 'Launch', detail: 'Sites identified with panchayats.' },
          { date: '2024-08-15', title: 'Plantation drive', detail: '2,000+ saplings planted.' },
          { date: '2025-03-01', title: 'Campaign closed', detail: 'Survival survey completed.' }
        ]),
        goalAmount: 200000,
        raisedAmount: 200000,
        authorName: 'Green Team',
        authorImagePath: null,
        location: 'Rural UP (placeholder)',
        startDate: '2024-07-01',
        endDate: '2025-03-01',
        sortOrder: 7,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Women Livelihood Ateliers',
        slug: 'women-livelihood-ateliers',
        category: 'Livelihood',
        status: 'upcoming',
        summary: 'Sewing and candle-making workshops for women\'s economic independence.',
        description: 'Placeholder upcoming campaign for vocational training — sewing machines and candle workshops. Launch date and budget are placeholders.',
        imagePath: `${IMG}/women-sewing-workshop.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/women-sewing-workshop.jpg`,
          `${IMG}/women-candle-making.jpg`,
          `${IMG}/inclusive-candle-workshop.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2026-09-01', title: 'Enrollment opens', detail: 'Applications from partner SHGs.' },
          { date: '2026-10-01', title: 'Training begins', detail: '12-week skill modules.' }
        ]),
        goalAmount: 450000,
        raisedAmount: 0,
        authorName: 'Livelihood Desk',
        authorImagePath: null,
        location: 'Central UP (placeholder)',
        startDate: '2026-09-01',
        endDate: '2027-03-31',
        sortOrder: 8,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Street Animal Care',
        slug: 'street-animal-care',
        category: 'Animal Welfare',
        status: 'upcoming',
        summary: 'Rescue, clinic care, and community feeding for street animals.',
        description: 'Placeholder animal welfare campaign covering rescue van response, veterinary treatment, and neighborhood feeding.',
        imagePath: `${IMG}/injured-dog-rescue-van.jpg`,
        photoPaths: JSON.stringify([
          `${IMG}/injured-dog-rescue-van.jpg`,
          `${IMG}/veterinary-clinic-care.jpg`,
          `${IMG}/street-dog-feeding.jpg`,
          `${IMG}/street-animal-rescue-blanket.jpg`
        ]),
        timeline: JSON.stringify([
          { date: '2026-10-15', title: 'Clinic partnership', detail: 'Agreements with local vets.' },
          { date: '2026-11-01', title: 'Rescue roster', detail: 'Volunteer shifts begin.' }
        ]),
        goalAmount: 300000,
        raisedAmount: 0,
        authorName: 'Care Team',
        authorImagePath: null,
        location: 'Lucknow (placeholder)',
        startDate: '2026-10-15',
        endDate: '2027-04-30',
        sortOrder: 9,
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert('Posts', [
      {
        title: 'How a community kitchen feeds hope',
        category: 'Impact',
        content: 'Placeholder blog post. Neighbors line up for a warm meal while volunteers ladle rice and dal. Replace this story with a real field update from The Utthan Foundation.',
        imagePath: `${IMG}/hot-meal-distribution.jpg`,
        createdAt: new Date('2026-06-12T10:00:00Z'),
        updatedAt: now
      },
      {
        title: 'Notebooks that open classroom doors',
        category: 'Education',
        content: 'Placeholder blog post about school supply distribution day — Hindi, Maths, and Science books reaching children in a mud-walled classroom.',
        imagePath: `${IMG}/school-supplies-distribution.jpg`,
        createdAt: new Date('2026-05-03T10:00:00Z'),
        updatedAt: now
      },
      {
        title: 'Planting tomorrow with village youth',
        category: 'Environment',
        content: 'Placeholder blog post describing a sunset plantation drive where elders and schoolchildren plant mango saplings together.',
        imagePath: `${IMG}/community-tree-planting.jpg`,
        createdAt: new Date('2026-03-18T10:00:00Z'),
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert('Galleries', [
      {
        title: 'Meal service',
        caption: 'Hot meal distribution in the neighborhood (placeholder)',
        imagePath: `${IMG}/hot-meal-distribution.jpg`,
        mediaDate: '2026-06-01',
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Winter kit',
        caption: 'Winter clothing for children (placeholder)',
        imagePath: `${IMG}/winter-clothing-donation.jpg`,
        mediaDate: '2026-01-12',
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Classroom',
        caption: 'Rural classroom teaching session (placeholder)',
        imagePath: `${IMG}/rural-classroom-teaching.jpg`,
        mediaDate: '2026-04-20',
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Cleanup',
        caption: 'Community street sanitation drive (placeholder)',
        imagePath: `${IMG}/community-street-cleanup.jpg`,
        mediaDate: '2026-02-08',
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Workshop',
        caption: 'Women sewing livelihood workshop (placeholder)',
        imagePath: `${IMG}/women-sewing-workshop.jpg`,
        mediaDate: '2025-11-30',
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Animal care',
        caption: 'Street dog feeding program (placeholder)',
        imagePath: `${IMG}/street-dog-feeding.jpg`,
        mediaDate: '2026-05-22',
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert('TeamMembers', [
      {
        name: 'Asha Verma',
        designation: 'Chief Advisor',
        imagePath: `${IMG}/village-aid-notebooks.jpg`,
        category: 'advisory',
        bio: 'Placeholder bio for Chief Advisory Committee member.',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Ravi Sharma',
        designation: 'Advisory Member — Education',
        imagePath: `${IMG}/rural-classroom-teaching.jpg`,
        category: 'advisory',
        bio: 'Placeholder bio for education advisor.',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Neha Gupta',
        designation: 'Advisory Member — Health & Relief',
        imagePath: `${IMG}/winter-blanket-distribution.jpg`,
        category: 'advisory',
        bio: 'Placeholder bio for relief advisor.',
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Sumit Yadav',
        designation: 'Operations Lead',
        imagePath: `${IMG}/community-street-cleanup.jpg`,
        category: 'board',
        bio: 'Placeholder team bio — operations and fieldwork coordination.',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Priya Singh',
        designation: 'Programs Coordinator',
        imagePath: `${IMG}/women-candle-making.jpg`,
        category: 'board',
        bio: 'Placeholder team bio — program design and partner schools.',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Imran Khan',
        designation: 'Volunteer Lead',
        imagePath: `${IMG}/food-aid-kit-handover.jpg`,
        category: 'volunteer',
        bio: 'Placeholder volunteer bio — kitchen and distribution shifts.',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert('Chairmen', [{
      photoPath: `${IMG}/inclusive-candle-workshop.jpg`,
      message: 'Placeholder message from leadership: Utthan exists so dignity and opportunity reach every neighbor. Replace this note with a real chairperson statement.',
      name: 'Placeholder Chairperson',
      role: 'Chairperson',
      signaturePath: null,
      createdAt: now,
      updatedAt: now
    }]);

    await queryInterface.bulkInsert('Testimonials', [
      {
        title: 'A warmer winter',
        quote: 'Placeholder success story with a much longer narrative: When the first frost settled over our village, we had almost nothing left to keep the children warm. The wind came through the gaps in our walls, and every evening felt longer than the last. Neighbors shared what little they had — a spare shawl here, a thin quilt there — but nights were still bitterly cold and sleep came in short, restless stretches. I remember sitting awake beside the cooking hearth after the embers died, counting breaths and praying the youngest would not wake crying from the chill. That winter we skipped meals so we could buy a little more fuel, and still it was never enough. Then the Utthan Foundation winter drive reached our lane. Volunteers arrived quietly with blankets, woolens, and socks folded with care. There were no loud speeches and no cameras pushed into our faces — only careful hands placing warmth into our home, asking if we needed anything else, and listening when we spoke. They returned the next week to check on the elders at the end of the street and to make sure the children had dry clothes for school. For the first time that season, my mother and the little ones slept through until morning. The house still felt poor, but it no longer felt abandoned. That single stretch of nights changed how we talk about help in our family: it is not charity from far away, and it is not a debt we must repay with shame. It is neighbors rising together so no one is left shivering alone. We still tell this story whenever winter returns — when fog lies low on the fields and the first cold rain starts — because warmth is more than cloth. It is dignity, it is belonging, and it is the promise that someone will knock on your door before the cold becomes unbearable.',
        name: 'Kamla Devi',
        role: 'Beneficiary, Winter Drive',
        imagePath: `${IMG}/winter-blanket-distribution.jpg`,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Back to class',
        quote: 'Placeholder success story: New books and a bag meant my daughter stopped skipping school. She reads Hindi aloud every evening now.',
        name: 'Suresh Yadav',
        role: 'Parent, School Kits',
        imagePath: `${IMG}/school-supplies-distribution.jpg`,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Skills that earn',
        quote: 'Placeholder success story: The sewing workshop helped me finish my first paid order. I am saving for a machine of my own.',
        name: 'Meena',
        role: 'Trainee, Livelihood Program',
        imagePath: `${IMG}/women-sewing-workshop.jpg`,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'A full plate again',
        quote: 'Placeholder success story: The community kitchen meals kept our children fed when work dried up. We could focus on finding steady work again.',
        name: 'Ramesh Kumar',
        role: 'Neighbor, Community Kitchen',
        imagePath: `${IMG}/hot-meal-distribution.jpg`,
        sortOrder: 4,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Clean water at school',
        quote: 'Placeholder success story: After the water station was installed, children stopped falling sick from dirty drinking water. Attendance improved within weeks.',
        name: 'Anita Sharma',
        role: 'Teacher, Partner School',
        imagePath: `${IMG}/community-street-cleanup.jpg`,
        sortOrder: 5,
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Books within reach',
        quote: 'Placeholder success story: The library corner is where my son learned to love reading. Evening tutoring gave him confidence he never had in class.',
        name: 'Farida Begum',
        role: 'Parent, Library Corners',
        imagePath: `${IMG}/community-library-books.jpg`,
        sortOrder: 6,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Testimonials', null, {});
    await queryInterface.bulkDelete('Chairmen', null, {});
    await queryInterface.bulkDelete('TeamMembers', null, {});
    await queryInterface.bulkDelete('Galleries', null, {});
    await queryInterface.bulkDelete('Posts', null, {});
    await queryInterface.bulkDelete('Campaigns', null, {});
    await queryInterface.bulkDelete('ImpactStats', null, {});
    await queryInterface.bulkDelete('SiteConfigs', null, {});
  }
};
