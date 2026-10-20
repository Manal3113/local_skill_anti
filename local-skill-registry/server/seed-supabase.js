const { supabase, isSupabaseConfigured } = require('./config/supabase');
const bcrypt = require('bcryptjs');

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
  'Shivpur', 'Ramnagar', 'Chandanwadi', 'Pipla', 'Belora',
  'Morgaon', 'Khed', 'Sonapur', 'Wadgaon', 'Jamthi',
  'Sultanpur', 'Navapur', 'Anjanvel', 'Dhamangaon', 'Shirkoli'
];

async function seedSupabase() {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured! Please provide SUPABASE_URL and SUPABASE_KEY in server/.env');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('  Seeding Supabase Database...                      ');
  console.log('====================================================');

  // 1. Determine target table
  const { error: chkErr } = await supabase.from('workers').select('id').limit(1);
  const targetTable = !chkErr ? 'workers' : 'skill_registry';
  console.log(`Using target table: ${targetTable}`);

  // Clear existing
  console.log('Clearing old Supabase tables...');
  await supabase.from('contact_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from(targetTable).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Admin User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Panchayat@2026', salt);
  await supabase.from('users').insert([{
    username: 'admin',
    password: hashedPassword,
    full_name: 'Santosh Deshpande (Panchayat Clerk)',
    role: 'panchayat_clerk',
    panchayat_name: 'Sonapur Group Gram Panchayat',
    village: 'Sonapur',
  }]);
  console.log('  [Created] Admin User: admin / Panchayat@2026');

  // 3. Workers
  const workers = [];
  for (let i = 0; i < 112; i++) {
    const isFemale = i % 5 === 0;
    const firstName = isFemale ? firstNamesFemale[i % firstNamesFemale.length] : firstNamesMale[i % firstNamesMale.length];
    const lastName = lastNames[(i * 3 + 7) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const skillObj = skills[i % skills.length];
    const village = villages[(i * 2 + 1) % villages.length];
    const phone = `98${String(10000000 + i * 78913).slice(0, 8)}`;
    const isVerified = i % 3 !== 0;

    workers.push({
      name: fullName,
      skill_category: skillObj.name,
      village,
      phone,
      availability_status: i % 7 === 0 ? 'busy' : (i % 11 === 0 ? 'seasonal' : 'available'),
      is_verified: isVerified,
      verified_by: isVerified ? 'Sonapur Gram Panchayat' : '',
      verification_date: isVerified ? new Date().toISOString() : null,
      e_shram_uan: `9876${String(10000000 + i * 4519).slice(0, 8)}`,
      experience_years: (i % 15) + 1,
      daily_wage_min: skillObj.wageMin,
      daily_wage_max: skillObj.wageMax,
      gender: isFemale ? 'Female' : 'Male',
      bio: `Skilled rural ${skillObj.name.toLowerCase()} operating in ${village} and nearby panchayats. Tools: ${skillObj.tool}.`,
      rating: Number((3.8 + ((i * 17) % 13) * 0.1).toFixed(1)),
      rating_count: (i % 20) + 1,
      ratings: [],
    });
  }

  const { error: wErr } = await supabase.from(targetTable).insert(workers);
  if (wErr) {
    console.error('❌ Failed to insert workers:', wErr);
  } else {
    console.log(`  [Inserted] 112 workers successfully into Supabase!`);
  }

  console.log('====================================================');
  console.log('  Supabase Seeding Completed!                       ');
  console.log('====================================================');
}

if (require.main === module) {
  seedSupabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedSupabase };
