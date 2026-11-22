-- =========================================================================
-- ANNADAAN FULL FRESH DATABASE SETUP SCRIPT FOR SUPABASE
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create donor_table
CREATE TABLE IF NOT EXISTS public.donor_table (
    phone TEXT PRIMARY KEY,
    id TEXT DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    email TEXT,
    auth_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create ngo_table
CREATE TABLE IF NOT EXISTS public.ngo_table (
    phone TEXT PRIMARY KEY,
    id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    org_id TEXT NOT NULL,
    head TEXT NOT NULL,
    address TEXT NOT NULL,
    location TEXT NOT NULL,
    email TEXT,
    auth_id UUID,
    type TEXT DEFAULT 'ngo',
    status TEXT DEFAULT 'active',
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create volunteer_table
CREATE TABLE IF NOT EXISTS public.volunteer_table (
    phone TEXT PRIMARY KEY,
    id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location TEXT NOT NULL,
    email TEXT,
    auth_id UUID,
    type TEXT DEFAULT 'volunteer',
    status TEXT DEFAULT 'active',
    photo_url TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create food_table
CREATE TABLE IF NOT EXISTS public.food_table (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    donor_phone TEXT,
    donor_type TEXT NOT NULL,
    event_name TEXT,
    food_type TEXT NOT NULL,
    serves INTEGER NOT NULL CHECK (serves > 0),
    valid_hours INTEGER,
    address TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    ngo_phone TEXT,
    volunteer_phone TEXT,
    accepted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivered_by TEXT,
    people_served INTEGER,
    delivery_feedback TEXT,
    delivery_lat NUMERIC,
    delivery_lng NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) with Permissive Policies
ALTER TABLE public.donor_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_table ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public Full Access donor_table" ON public.donor_table;
DROP POLICY IF EXISTS "Public Full Access ngo_table" ON public.ngo_table;
DROP POLICY IF EXISTS "Public Full Access volunteer_table" ON public.volunteer_table;
DROP POLICY IF EXISTS "Public Full Access food_table" ON public.food_table;

CREATE POLICY "Public Full Access donor_table" ON public.donor_table FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access ngo_table" ON public.ngo_table FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access volunteer_table" ON public.volunteer_table FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access food_table" ON public.food_table FOR ALL USING (true) WITH CHECK (true);

-- 6. Grant Table Permissions to API Roles (anon, authenticated, service_role)
-- Fixes PostgreSQL 'permission denied for table' error prior to RLS evaluation
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 7. Setup Supabase Realtime for instant UI sync
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'food_table'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.food_table;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'donor_table'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_table;
    END IF;
END $$;

-- 7. Setup Storage Bucket for food pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food_images', 'food_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for food_images bucket
DROP POLICY IF EXISTS "Public Select food_images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert food_images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update food_images" ON storage.objects;

CREATE POLICY "Public Select food_images" ON storage.objects
FOR SELECT USING (bucket_id = 'food_images');

CREATE POLICY "Public Insert food_images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food_images');

CREATE POLICY "Public Update food_images" ON storage.objects
FOR UPDATE USING (bucket_id = 'food_images');

