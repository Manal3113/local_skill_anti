const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Mask phone number helper
const maskPhone = (phone) => {
  if (phone && phone.length >= 10) {
    const raw = phone.replace(/\D/g, '');
    if (raw.length === 10) {
      return `+91 ${raw.slice(0, 2)}•••• ••${raw.slice(-2)}`;
    }
  }
  return '••••••••••';
};

const formatWorker = (row, isAdmin = false) => {
  if (!row) return null;
  const worker = {
    _id: row.id,
    id: row.id,
    name: row.name,
    skillCategory: row.skill_category,
    village: row.village,
    phone: isAdmin ? row.phone : maskPhone(row.phone),
    availabilityStatus: row.availability_status,
    isVerified: row.is_verified,
    verifiedBy: row.verified_by,
    verificationDate: row.verification_date,
    eShramUan: row.e_shram_uan,
    experienceYears: Number(row.experience_years) || 0,
    dailyWageMin: Number(row.daily_wage_min) || 0,
    dailyWageMax: Number(row.daily_wage_max) || 0,
    gender: row.gender,
    bio: row.bio,
    rating: Number(row.rating) || 0,
    ratingCount: Number(row.rating_count) || 0,
    ratings: row.ratings || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return worker;
};

let activeWorkerTable = 'workers';

const getWorkerTable = async () => {
  const { error } = await supabase.from('workers').select('id').limit(1);
  if (!error) {
    activeWorkerTable = 'workers';
  } else {
    activeWorkerTable = 'skill_registry';
  }
  return activeWorkerTable;
};
const getWorkers = async (filters, isAdmin = false) => {
  const {
    search,
    skill,
    village,
    availability,
    verified,
    sortBy = 'rating',
    page = 1,
    limit = 12,
  } = filters;

  const tbl = await getWorkerTable();
  let query = supabase.from(tbl).select('*', { count: 'exact' });

  if (skill && skill !== 'all') {
    query = query.eq('skill_category', skill);
  }
  if (village && village !== 'all') {
    query = query.eq('village', village);
  }
  if (availability && availability !== 'all') {
    query = query.eq('availability_status', availability);
  }
  if (verified === 'true') {
    query = query.eq('is_verified', true);
  } else if (verified === 'false') {
    query = query.eq('is_verified', false);
  }
  if (search && search.trim() !== '') {
    const term = search.trim();
    query = query.or(`name.ilike.%${term}%,skill_category.ilike.%${term}%,village.ilike.%${term}%,bio.ilike.%${term}%`);
  }

  // Sorting
  if (sortBy === 'rating') {
    query = query.order('rating', { ascending: false });
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'experience') {
    query = query.order('experience_years', { ascending: false });
  } else if (sortBy === 'wage_low') {
    query = query.order('daily_wage_min', { ascending: true });
  } else if (sortBy === 'wage_high') {
    query = query.order('daily_wage_max', { ascending: false });
  } else {
    query = query.order('name', { ascending: true });
  }

  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const start = (p - 1) * l;
  const end = start + l - 1;

  query = query.range(start, end);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    workers: (data || []).map(w => formatWorker(w, isAdmin)),
    total: count || 0,
    page: p,
    totalPages: Math.ceil((count || 0) / l),
  };
};

// 2. Get Worker by ID
const getWorkerById = async (id, isAdmin = false) => {
  const tbl = await getWorkerTable();
  const { data, error } = await supabase.from(tbl).select('*').eq('id', id).single();
  if (error) return null;
  return formatWorker(data, isAdmin);
};

// 3. Create Worker
const createWorker = async (workerData, isAdmin = false) => {
  const tbl = await getWorkerTable();
  const payload = {
    name: workerData.name.trim(),
    skill_category: workerData.skillCategory.trim(),
    village: workerData.village.trim(),
    phone: workerData.phone.trim(),
    availability_status: workerData.availabilityStatus || 'available',
    is_verified: isAdmin,
    verified_by: isAdmin ? (workerData.verifiedBy || 'Admin') : '',
    verification_date: isAdmin ? new Date() : null,
    e_shram_uan: (workerData.eShramUan || '').trim(),
    experience_years: Number(workerData.experienceYears) || 1,
    daily_wage_min: Number(workerData.dailyWageMin) || 400,
    daily_wage_max: Number(workerData.dailyWageMax) || 800,
    gender: workerData.gender || 'Not Specified',
    bio: (workerData.bio || '').trim(),
  };

  const { data, error } = await supabase.from(tbl).insert([payload]).select().single();
  if (error) throw error;
  return formatWorker(data, isAdmin);
};

// 4. Toggle Verification
const toggleWorkerVerification = async (id, user) => {
  const tbl = await getWorkerTable();
  const current = await getWorkerById(id, true);
  if (!current) return null;

  const newStatus = !current.isVerified;
  const updatePayload = {
    is_verified: newStatus,
    verified_by: newStatus ? (user ? user.fullName : 'Gram Panchayat Office') : '',
    verification_date: newStatus ? new Date() : null,
  };

  const { data, error } = await supabase.from(tbl).update(updatePayload).eq('id', id).select().single();
  if (error) throw error;
  return formatWorker(data, true);
};

// 5. Update Worker
const updateWorker = async (id, updates) => {
  const tbl = await getWorkerTable();
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.skillCategory !== undefined) payload.skill_category = updates.skillCategory;
  if (updates.village !== undefined) payload.village = updates.village;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.availabilityStatus !== undefined) payload.availability_status = updates.availabilityStatus;
  if (updates.eShramUan !== undefined) payload.e_shram_uan = updates.eShramUan;
  if (updates.experienceYears !== undefined) payload.experience_years = Number(updates.experienceYears);
  if (updates.dailyWageMin !== undefined) payload.daily_wage_min = Number(updates.dailyWageMin);
  if (updates.dailyWageMax !== undefined) payload.daily_wage_max = Number(updates.dailyWageMax);
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.isVerified !== undefined) payload.is_verified = updates.isVerified;

  const { data, error } = await supabase.from(tbl).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return formatWorker(data, true);
};

// 6. Delete Worker
const deleteWorker = async (id) => {
  const tbl = await getWorkerTable();
  const { error } = await supabase.from(tbl).delete().eq('id', id);
  if (error) throw error;
  return true;
};

// 7. Get Filters Metadata
const getFilterOptions = async () => {
  const tbl = await getWorkerTable();
  const { data, error } = await supabase.from(tbl).select('skill_category, village, availability_status');
  if (error) throw error;

  const skills = [...new Set(data.map(d => d.skill_category).filter(Boolean))].sort();
  const villages = [...new Set(data.map(d => d.village).filter(Boolean))].sort();
  
  const statsMap = {};
  data.forEach(d => {
    statsMap[d.availability_status] = (statsMap[d.availability_status] || 0) + 1;
  });
  const availabilityStats = Object.keys(statsMap).map(k => ({ _id: k, count: statsMap[k] }));

  return { skills, villages, availabilityStats };
};

// 8. Get Stats Dashboard
const getStats = async () => {
  const tbl = await getWorkerTable();
  const { data: workers, error: wErr } = await supabase.from(tbl).select('*');
  if (wErr) throw wErr;

  const { data: requests, error: rErr } = await supabase.from('contact_requests').select('*');
  if (rErr) throw rErr;

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter(w => w.is_verified).length;
  const availableWorkers = workers.filter(w => w.availability_status === 'available').length;
  const verificationRate = totalWorkers > 0 ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0;

  const skillCounts = {};
  workers.forEach(w => {
    skillCounts[w.skill_category] = (skillCounts[w.skill_category] || 0) + 1;
  });
  const skillDistribution = Object.keys(skillCounts).map(k => ({ _id: k, count: skillCounts[k] })).sort((a,b) => b.count - a.count);

  const villageCounts = {};
  workers.forEach(w => {
    villageCounts[w.village] = (villageCounts[w.village] || 0) + 1;
  });
  const villageDistribution = Object.keys(villageCounts).map(k => ({ _id: k, count: villageCounts[k] })).sort((a,b) => b.count - a.count);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;

  return {
    totalWorkers,
    verifiedWorkers,
    verificationRate,
    availableWorkers,
    totalSkills: Object.keys(skillCounts).length,
    totalVillages: Object.keys(villageCounts).length,
    totalRequests: requests.length,
    pendingRequests,
    approvedRequests,
    skillDistribution,
    villageDistribution,
  };
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  toggleWorkerVerification,
  updateWorker,
  deleteWorker,
  getFilterOptions,
  getStats,
};
