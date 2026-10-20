const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, closeDB } = require('./config/db');
const Worker = require('./models/Worker');
const ContactRequest = require('./models/ContactRequest');
const User = require('./models/User');

dotenv.config();

const firstNamesMale = [
  'Ramesh', 'Suresh', 'Ganesh', 'Dilip', 'Manoj', 'Prakash', 'Vijay', 'Datta',
  'Balu', 'Santosh', 'Sachin', 'Anand', 'Nilesh', 'Mahesh', 'Pradeep', 'Ashok',
  'Kailash', 'Dnyaneshwar', 'Pandurang', 'Baban', 'Tukaram', 'Sanjay', 'Sunil',
  'Ravindra', 'Deepak', 'Arun', 'Vasant', 'Govind', 'Bhimrao', 'Kishore'
];

const firstNamesFemale = [
  'Sunita', 'Savita', 'Anita', 'Rekha', 'Kavita', 'Asha', 'Shobha', 'Lata',
  'Usha', 'Suman', 'Meena', 'Mangal', 'Sangita', 'Pratibha', 'Vaishali',
  'Archana', 'Jyoti', 'Surekha', 'Swati', 'Manjula'
];

const lastNames = [
  'Pawar', 'Jadhav', 'Shinde', 'Gaikwad', 'Patil', 'Kamble', 'More', 'Chavan',
  'Kadam', 'Bhosale', 'Salunke', 'Sonawane', 'Waghmare', 'Bhalerao', 'Deshmukh',
  'Rathod', 'Shingare', 'Gokhale', 'Thorat', 'Mane', 'Jagtap', 'Tambe', 'Sawant',
  'Babar', 'Lokhande', 'Kharat', 'Dhumal', 'Munde', 'Gawade', 'Koli'
];

const skills = [
  { name: 'Mason', tool: 'Trowel, spirit level, plumb bob', wageMin: 600, wageMax: 900 },
  { name: 'Electrician', tool: 'Multimeter, conduit bender, wire strippers', wageMin: 550, wageMax: 850 },
  { name: 'Tailor', tool: 'Industrial sewing machine, cutting shears', wageMin: 400, wageMax: 700 },
  { name: 'Driver', tool: 'Heavy/light commercial driving license, GPS', wageMin: 600, wageMax: 950 },
  { name: 'Welder', tool: 'Arc welding set, gas cutter, protective shield', wageMin: 650, wageMax: 1000 },
  { name: 'Farm Laborer', tool: 'Sickle, spade, tractor attachment operator', wageMin: 350, wageMax: 550 },
  { name: 'Plumber', tool: 'Pipe wrench, threading kit, PVC heat welder', wageMin: 500, wageMax: 800 },
  { name: 'Carpenter', tool: 'Power planer, circular saw, chisels', wageMin: 600, wageMax: 900 },
  { name: 'Painter', tool: 'Airless spray pump, roller brushes, wall putty mixer', wageMin: 500, wageMax: 800 },
  { name: 'Cook', tool: 'Commercial cookware, tandoor, banquet catering', wageMin: 600, wageMax: 1100 },
  { name: 'Mechanic', tool: 'Socket set, hydraulic jack, compressor', wageMin: 550, wageMax: 900 },
  { name: 'Blacksmith', tool: 'Anvil, coal furnace, heavy sledgehammers', wageMin: 500, wageMax: 850 },
  { name: 'Potter', tool: 'Electric potter wheel, terracotta baking kiln', wageMin: 400, wageMax: 650 },
  { name: 'Solar Technician', tool: 'Solar panel tester, DC clamp meter, crimping tools', wageMin: 700, wageMax: 1200 },
  { name: 'Weaver', tool: 'Handloom & powerloom shuttle kit, warp frame', wageMin: 450, wageMax: 750 },
];

const villages = [
  'Shivpur',
  'Ramnagar',
  'Chandanwadi',
  'Pipla',
  'Belora',
  'Morgaon',
  'Khed',
  'Sonapur',
  'Wadgaon',
  'Jamthi',
  'Sultanpur',
  'Navapur',
  'Anjanvel',
  'Dhamangaon',
  'Shirkoli',
];

const reviewComments = [
  'Completed our panchayat hall plastering on time. High work ethics and very polite.',
  'Repaired our 3-phase agricultural water pump wiring safely during harvest season. Excellent work!',
  'Stitched 40 school uniform sets with precise measurements. Delivered before the deadline.',
  'Drove our tractor and goods carrier across ghats with complete care and safety.',
  'Fabricated sturdy iron security gates for our rural health sub-center. Very solid welding.',
  'Expert in grape vine pruning and drip line servicing. Dedicated and hardworking worker.',
  'Fixed underground pipeline leakage in Ward 3 with minimum excavation.',
  'Handcrafted sturdy teak wood door frames for our community library.',
  'Painted our village primary school walls with vibrant waterproof paint. Clean finishing.',
  'Prepared delicious meals for a 200-person village gathering with hygienic preparation.',
  'Repaired our mini-tractor engine quickly on-site without needing transport to the city.',
  'Sharpened and tempered our farming ploughshares and sickles. Outstanding traditional craft.',
  'Supplied high-quality clay water pots and earthen tiles for our village festival.',
  'Installed our 3kW rooftop solar setup with neat cabling and earthing.',
  'Wove beautiful traditional cotton border sarees with intricate patterns.',
];

const sampleRequesters = [
  'Arvind Deshmukh (PWD Civil Contractor)',
  'Meena Thorat (Zilla Parishad School Principal)',
  'Rajeshwar Rao (Kisan Vikas Agro Cooperative)',
  'Vikas Rural Livelihood Mission NGO',
  'Dr. Sanjay Kulkarni (Primary Health Center PHC)',
  'Shrikant Bhalerao (Panchayat Water Works)',
  'Anjali Joshi (Anganwadi Center In-Charge)',
  'Kailash Shinde (Dairy & Poultry Farmer)',
  'Sitaram Gokhale (Panchayat Secretary)',
  'Mahendra Verma (Rural Transport Logistics)',
];

const seedDatabase = async (manageConnection = true) => {
  try {
    console.log('====================================================');
    console.log('  Starting Local Skill Registry Database Seeding... ');
    console.log('====================================================');

    if (manageConnection) {
      await connectDB();
    }

    // 1. Clear existing collections
    console.log('Clearing existing data...');
    await Worker.deleteMany({});
    await ContactRequest.deleteMany({});
    await User.deleteMany({});

    // 2. Create Admin User (Panchayat Clerk)
    console.log('Seeding Panchayat Clerk Admin user...');
    const adminUser = new User({
      username: 'admin',
      password: 'Panchayat@2026',
      fullName: 'Santosh Deshpande (Panchayat Clerk)',
      role: 'panchayat_clerk',
      panchayatName: 'Sonapur Group Gram Panchayat',
      village: 'Sonapur',
    });
    await adminUser.save();
    console.log('  [Created] Admin User: admin / Panchayat@2026');

    // 3. Generate 112 Realistic Worker Records
    console.log('Generating 110+ fictional rural workers across 15 skills & 15 villages...');
    const workersToInsert = [];

    for (let i = 0; i < 112; i++) {
      const isFemale = i % 5 === 0;
      const firstName = isFemale
        ? firstNamesFemale[i % firstNamesFemale.length]
        : firstNamesMale[i % firstNamesMale.length];
      const lastName = lastNames[(i * 3 + 7) % lastNames.length];
      const fullName = `${firstName} ${lastName}`;

      // Pick skill cyclically to guarantee balanced representation across all 15 skills
      const skillObj = skills[i % skills.length];
      const village = villages[(i * 2 + 1) % villages.length];

      // Realistic phone number generator
      const phonePrefixes = ['9822', '9765', '9890', '9422', '9158', '9970', '8888', '7028', '9657'];
      const prefix = phonePrefixes[i % phonePrefixes.length];
      const suffix = String(100000 + ((i * 7919) % 900000));
      const phone = `${prefix}${suffix}`;

      // Availability: 72% available, 16% busy, 8% seasonal, 4% on_leave
      let availabilityStatus = 'available';
      if (i % 11 === 0) availabilityStatus = 'busy';
      else if (i % 17 === 0) availabilityStatus = 'seasonal';
      else if (i % 25 === 0) availabilityStatus = 'on_leave';

      // Verification: ~67% verified, 33% unverified
      const isVerified = i % 3 !== 0;
      const verifiedBy = isVerified ? `Gram Panchayat ${village}` : '';
      const verificationDate = isVerified ? new Date(Date.now() - (i + 5) * 86400000) : null;

      // e-Shram UAN reference (approx 80% have UAN cards)
      const hasUan = i % 5 !== 0;
      const uan1 = String(1000 + ((i * 123) % 9000));
      const uan2 = String(1000 + ((i * 456) % 9000));
      const uan3 = String(1000 + ((i * 789) % 9000));
      const eShramUan = hasUan ? `UAN-${uan1}-${uan2}-${uan3}` : '';

      // Experience: 2 to 24 years
      const experienceYears = 2 + (i % 22);

      // Wage variations
      const dailyWageMin = skillObj.wageMin + ((i % 3) * 50);
      const dailyWageMax = skillObj.wageMax + ((i % 3) * 50);

      // Ratings: Some workers have multiple reviews, some 1, some 0 (new workers)
      const ratingCount = i % 6 === 0 ? 0 : 1 + (i % 4);
      const ratings = [];
      let calculatedRating = 0;

      if (ratingCount > 0) {
        let sum = 0;
        for (let r = 0; r < ratingCount; r++) {
          const star = (i + r) % 7 === 0 ? 3 : (i + r) % 5 === 0 ? 4 : 5;
          sum += star;
          ratings.push({
            rating: star,
            comment: reviewComments[(i + r * 3) % reviewComments.length],
            reviewerName: sampleRequesters[(i + r) % sampleRequesters.length].split(' (')[0],
            reviewerOrg: sampleRequesters[(i + r) % sampleRequesters.length].split(' (')[1]?.replace(')', '') || 'Panchayat',
            createdAt: new Date(Date.now() - (r + 2) * 86400000 * 3),
          });
        }
        calculatedRating = Number((sum / ratingCount).toFixed(1));
      }

      const createdAt = new Date(Date.now() - (115 - i) * 86400000 * 1.5);

      workersToInsert.push({
        name: fullName,
        skillCategory: skillObj.name,
        village,
        phone,
        availabilityStatus,
        isVerified,
        verifiedBy,
        verificationDate,
        eShramUan,
        experienceYears,
        dailyWageMin,
        dailyWageMax,
        gender: isFemale ? 'Female' : 'Male',
        bio: `Skilled in ${skillObj.name.toLowerCase()} work with ${experienceYears} years experience in ${village} and nearby tehsils. Equipped with ${skillObj.tool}.`,
        rating: calculatedRating,
        ratingCount,
        ratings,
        createdAt,
        updatedAt: createdAt,
      });
    }

    const insertedWorkers = await Worker.insertMany(workersToInsert);
    console.log(`  [Inserted] ${insertedWorkers.length} worker records successfully!`);

    // 4. Seed 12 Sample Contact Requests
    console.log('Seeding realistic contact requests with pending/approved/denied statuses...');
    const contactRequests = [
      {
        workerId: insertedWorkers[0]._id,
        workerName: insertedWorkers[0].name,
        workerSkill: insertedWorkers[0].skillCategory,
        workerVillage: insertedWorkers[0].village,
        requesterName: 'Arvind Deshmukh',
        requesterPhone: '9822104590',
        requesterEmail: 'arvind.infra@pwdworks.in',
        requesterOrganization: 'Govt Contractor - PWD Division 2',
        purpose: 'Urgent requirement for Panchayat office boundary wall construction and masonry work for 12 days.',
        status: 'approved',
        trackingId: 'LSR-2026-1001',
        accessCode: 'PWD892',
        adminNotes: 'Verified contractor documents with ZP engineering office. Approved.',
        reviewedAt: new Date(Date.now() - 2 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: true,
      },
      {
        workerId: insertedWorkers[1]._id,
        workerName: insertedWorkers[1].name,
        workerSkill: insertedWorkers[1].skillCategory,
        workerVillage: insertedWorkers[1].village,
        requesterName: 'Meena Thorat',
        requesterPhone: '9765432101',
        requesterEmail: 'school.headmistress@zp.ac.in',
        requesterOrganization: 'Zilla Parishad Primary School',
        purpose: 'Classroom ceiling fan and switchboard rewiring prior to reopening after summer break.',
        status: 'approved',
        trackingId: 'LSR-2026-1002',
        accessCode: 'SCH341',
        adminNotes: 'Government educational institution request. Instant clearance granted.',
        reviewedAt: new Date(Date.now() - 3 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: false,
      },
      {
        workerId: insertedWorkers[2]._id,
        workerName: insertedWorkers[2].name,
        workerSkill: insertedWorkers[2].skillCategory,
        workerVillage: insertedWorkers[2].village,
        requesterName: 'Rajeshwar Rao',
        requesterPhone: '9422998877',
        requesterEmail: '',
        requesterOrganization: 'Kisan Agro Producer Company',
        purpose: 'Cotton crop harvest packing and farm sorting labor needed for 3 consecutive weeks.',
        status: 'pending',
        trackingId: 'LSR-2026-1003',
        accessCode: 'AGR512',
        adminNotes: '',
      },
      {
        workerId: insertedWorkers[3]._id,
        workerName: insertedWorkers[3].name,
        workerSkill: insertedWorkers[3].skillCategory,
        workerVillage: insertedWorkers[3].village,
        requesterName: 'Dr. Sanjay Kulkarni',
        requesterPhone: '9158774411',
        requesterEmail: 'phc.sonapur@health.gov.in',
        requesterOrganization: 'Primary Health Centre (PHC)',
        purpose: 'Emergency plumbing repairs for water tank overhead supply pipeline at health sub-center.',
        status: 'approved',
        trackingId: 'LSR-2026-1004',
        accessCode: 'PHC904',
        adminNotes: 'Critical medical infrastructure repair approved immediately.',
        reviewedAt: new Date(Date.now() - 1 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: true,
      },
      {
        workerId: insertedWorkers[4]._id,
        workerName: insertedWorkers[4].name,
        workerSkill: insertedWorkers[4].skillCategory,
        workerVillage: insertedWorkers[4].village,
        requesterName: 'Vikram Joshi',
        requesterPhone: '9922334455',
        requesterEmail: 'vikram.consulting@gmail.com',
        requesterOrganization: 'Private Telemarketing Agency',
        purpose: 'Promotional phone marketing and survey campaign.',
        status: 'denied',
        trackingId: 'LSR-2026-1005',
        accessCode: 'MKT109',
        adminNotes: 'Denied: Commercial promotional telemarketing violates worker privacy policy.',
        reviewedAt: new Date(Date.now() - 4 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: false,
      },
      {
        workerId: insertedWorkers[5]._id,
        workerName: insertedWorkers[5].name,
        workerSkill: insertedWorkers[5].skillCategory,
        workerVillage: insertedWorkers[5].village,
        requesterName: 'Shrikant Bhalerao',
        requesterPhone: '9890123456',
        requesterEmail: 'water.panchayat@sonapur.gov.in',
        requesterOrganization: 'Gram Panchayat Water Supply Department',
        purpose: 'Repairing community handpump lever and pipe casing in Harijan Vasti.',
        status: 'pending',
        trackingId: 'LSR-2026-1006',
        accessCode: 'WTR783',
        adminNotes: '',
      },
      {
        workerId: insertedWorkers[6]._id,
        workerName: insertedWorkers[6].name,
        workerSkill: insertedWorkers[6].skillCategory,
        workerVillage: insertedWorkers[6].village,
        requesterName: 'Sunil Jagtap',
        requesterPhone: '9764512389',
        requesterEmail: '',
        requesterOrganization: 'Local Resident & Farmer',
        purpose: 'Deep agricultural well submersible motor installation and switch fuse fitting.',
        status: 'pending',
        trackingId: 'LSR-2026-1007',
        accessCode: 'RES442',
        adminNotes: '',
      },
      {
        workerId: insertedWorkers[7]._id,
        workerName: insertedWorkers[7].name,
        workerSkill: insertedWorkers[7].skillCategory,
        workerVillage: insertedWorkers[7].village,
        requesterName: 'Vikas Livelihoods NGO',
        requesterPhone: '9421887766',
        requesterEmail: 'contact@vikasmission.org',
        requesterOrganization: 'Rural Development Foundation',
        purpose: 'Conducting 5-day handloom skill upgradation workshop for women self-help groups.',
        status: 'approved',
        trackingId: 'LSR-2026-1008',
        accessCode: 'NGO318',
        adminNotes: 'Verified NGO credentials for rural artisan development.',
        reviewedAt: new Date(Date.now() - 5 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: false,
      },
      {
        workerId: insertedWorkers[8]._id,
        workerName: insertedWorkers[8].name,
        workerSkill: insertedWorkers[8].skillCategory,
        workerVillage: insertedWorkers[8].village,
        requesterName: 'Anjali Joshi',
        requesterPhone: '8888991122',
        requesterEmail: '',
        requesterOrganization: 'Anganwadi Center 4',
        purpose: 'Painting educational cartoons and alphabets on Anganwadi room walls.',
        status: 'pending',
        trackingId: 'LSR-2026-1009',
        accessCode: 'ANG881',
        adminNotes: '',
      },
      {
        workerId: insertedWorkers[9]._id,
        workerName: insertedWorkers[9].name,
        workerSkill: insertedWorkers[9].skillCategory,
        workerVillage: insertedWorkers[9].village,
        requesterName: 'Kailash Shinde',
        requesterPhone: '7028123456',
        requesterEmail: 'kailash.dairy@yahoo.com',
        requesterOrganization: 'Shinde Dairy Farm',
        purpose: 'Solar milk chiller DC panel servicing and inverter troubleshooting.',
        status: 'approved',
        trackingId: 'LSR-2026-1010',
        accessCode: 'SOL559',
        adminNotes: 'Local agricultural dairy enterprise verified by village sarpanch.',
        reviewedAt: new Date(Date.now() - 1 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: true,
      },
      {
        workerId: insertedWorkers[10]._id,
        workerName: insertedWorkers[10].name,
        workerSkill: insertedWorkers[10].skillCategory,
        workerVillage: insertedWorkers[10].village,
        requesterName: 'Rohan Salve',
        requesterPhone: '9657112233',
        requesterEmail: '',
        requesterOrganization: 'Local Resident',
        purpose: 'Home wardrobe and kitchen shelf woodwork renovation.',
        status: 'pending',
        trackingId: 'LSR-2026-1011',
        accessCode: 'WDW229',
        adminNotes: '',
      },
      {
        workerId: insertedWorkers[11]._id,
        workerName: insertedWorkers[11].name,
        workerSkill: insertedWorkers[11].skillCategory,
        workerVillage: insertedWorkers[11].village,
        requesterName: 'Unknown Caller',
        requesterPhone: '9111222333',
        requesterEmail: '',
        requesterOrganization: 'Anonymous',
        purpose: 'Personal details request without providing legitimate work requirement or location.',
        status: 'denied',
        trackingId: 'LSR-2026-1012',
        accessCode: 'NON000',
        adminNotes: 'Denied: Incomplete verification details and suspicious anonymous inquiry.',
        reviewedAt: new Date(Date.now() - 6 * 86400000),
        reviewedBy: 'Santosh Deshpande (Panchayat Clerk)',
        hasRated: false,
      },
    ];

    const insertedRequests = await ContactRequest.insertMany(contactRequests);
    console.log(`  [Inserted] ${insertedRequests.length} sample contact requests successfully!`);

    console.log('====================================================');
    console.log('  Database Seeding Completed Successfully!          ');
    console.log('  - Workers: ' + insertedWorkers.length);
    console.log('  - Contact Requests: ' + insertedRequests.length);
    console.log('  - Admin Credentials:');
    console.log('    Username: admin');
    console.log('    Password: Panchayat@2026');
    console.log('====================================================');

    if (manageConnection) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('Database seeding failed:', error);
    if (manageConnection) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
