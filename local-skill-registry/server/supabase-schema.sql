-- ========================================================
-- Supabase PostgreSQL Schema for Local Skill Registry
-- Run this in your Supabase SQL Editor
-- ========================================================

-- 1. Update existing skill_registry table (if you created it)
ALTER TABLE IF EXISTS public.skill_registry
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS skill_category TEXT,
ADD COLUMN IF NOT EXISTS village TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS e_shram_uan TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS experience_years NUMERIC DEFAULT 2,
ADD COLUMN IF NOT EXISTS daily_wage_min NUMERIC DEFAULT 400,
ADD COLUMN IF NOT EXISTS daily_wage_max NUMERIC DEFAULT 800,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Not Specified',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.skill_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read skill_registry" ON public.skill_registry;
DROP POLICY IF EXISTS "Public insert skill_registry" ON public.skill_registry;
DROP POLICY IF EXISTS "Public update skill_registry" ON public.skill_registry;
DROP POLICY IF EXISTS "Public delete skill_registry" ON public.skill_registry;

CREATE POLICY "Public read skill_registry" ON public.skill_registry FOR SELECT USING (true);
CREATE POLICY "Public insert skill_registry" ON public.skill_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update skill_registry" ON public.skill_registry FOR UPDATE USING (true);
CREATE POLICY "Public delete skill_registry" ON public.skill_registry FOR DELETE USING (true);

-- 2. Create Workers Table
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    village TEXT NOT NULL,
    phone TEXT NOT NULL,
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'seasonal', 'on_leave')),
    is_verified BOOLEAN DEFAULT false,
    verified_by TEXT DEFAULT '',
    verification_date TIMESTAMPTZ,
    e_shram_uan TEXT DEFAULT '',
    experience_years NUMERIC DEFAULT 2,
    daily_wage_min NUMERIC DEFAULT 400,
    daily_wage_max NUMERIC DEFAULT 800,
    gender TEXT DEFAULT 'Not Specified' CHECK (gender IN ('Male', 'Female', 'Other', 'Not Specified')),
    bio TEXT DEFAULT '',
    rating NUMERIC DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    ratings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_workers_skill ON public.workers(skill_category);
CREATE INDEX IF NOT EXISTS idx_workers_village ON public.workers(village);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON public.workers(availability_status);
CREATE INDEX IF NOT EXISTS idx_workers_verified ON public.workers(is_verified);

-- 3. Create Contact Requests Table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    worker_name TEXT NOT NULL,
    worker_skill TEXT NOT NULL,
    worker_village TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_phone TEXT NOT NULL,
    requester_email TEXT DEFAULT '',
    requester_organization TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    tracking_id TEXT UNIQUE NOT NULL,
    access_code TEXT,
    reviewed_by TEXT DEFAULT '',
    review_notes TEXT DEFAULT '',
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_worker ON public.contact_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_tracking ON public.contact_requests(tracking_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

-- 4. Create Users Table (for Panchayat clerks/admins)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'panchayat_clerk' CHECK (role IN ('panchayat_clerk', 'admin')),
    panchayat_name TEXT DEFAULT 'Gram Panchayat Central Office',
    village TEXT DEFAULT 'Sonapur',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for server backend API access
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access via API (can be restricted as needed)
CREATE POLICY "Public read workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Public insert workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update workers" ON public.workers FOR UPDATE USING (true);

CREATE POLICY "Public read contact_requests" ON public.contact_requests FOR SELECT USING (true);
CREATE POLICY "Public insert contact_requests" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update contact_requests" ON public.contact_requests FOR UPDATE USING (true);

CREATE POLICY "Public access users" ON public.users FOR ALL USING (true);
