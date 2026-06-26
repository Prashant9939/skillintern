-- Disable all row level security for custom database authentication
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Custom Auth Users)
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  phone_number text not null unique,
  role text not null check (role in ('student', 'admin')) default 'student',
  university_name text,
  college_name text,
  degree text,
  department_stream text,
  semester text,
  academic_session text,
  major_subject text,
  roll_number text,
  registration_number text,
  gender text,
  date_of_birth text,
  full_address text,
  city text,
  state text,
  pincode text,
  document_id text,
  emergency_contact_name text,
  emergency_contact_number text,
  emergency_contact_relation text,
  agreed_terms boolean default false,
  agreed_updates boolean default false,
  profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create database unique indexes for email and phone
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_number_idx ON public.profiles (phone_number);

-- 2. INTERNSHIPS TABLE
create table public.internships (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  requirements text[] default '{}'::text[],
  duration text not null default '120 Hrs',
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. QUESTIONS TABLE
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  internship_id uuid references public.internships(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null, -- Array of strings e.g. ["Option A", "Option B", ...]
  correct_option_index integer not null check (correct_option_index >= 0 and correct_option_index <= 3),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TEST RESULTS TABLE
create table public.test_results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  internship_id uuid references public.internships(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  percentage numeric(5, 2) not null,
  passed boolean not null,
  reference_number text,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable Row Level Security (RLS) on all tables and configure public access policies
alter table public.profiles enable row level security;
create policy "Allow public access" on public.profiles for all using (true) with check (true);

alter table public.internships enable row level security;
create policy "Allow public access" on public.internships for all using (true) with check (true);

alter table public.questions enable row level security;
create policy "Allow public access" on public.questions for all using (true) with check (true);

alter table public.test_results enable row level security;
create policy "Allow public access" on public.test_results for all using (true) with check (true);


-- ============================================================
-- DEFAULT ADMIN ACCOUNT SEED
-- Email   : admin@ugintern.com
-- Password: Shiwam@99
-- Hash    : SHA-256("Shiwam@99" + "ugintern-secure-salt-2026")
-- ============================================================
-- Run this in Supabase SQL Editor after creating the tables above.
-- Uses DO $$ ... END $$ so the INSERT is skipped if the admin already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'admin@ugintern.com'
  ) THEN
    INSERT INTO public.profiles (email, password_hash, full_name, phone_number, department_stream, role)
    VALUES (
      'admin@ugintern.com',
      '276b24287f4e0c697926eb8a513c867775eda1c727332a6ea725316872c9fbb7',
      'Super Admin',
      '0000000000',
      'Platform Administration',
      'admin'
    );
  END IF;
END $$;

-- ============================================================
-- PROFILE COMPLETION MIGRATION (For existing databases)
-- ============================================================
-- Run these queries in the Supabase SQL Editor if you already have the profiles table created.
--
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_name text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_name text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS degree text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_stream text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academic_session text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS major_subject text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_number text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_address text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed boolean default false;

-- ============================================================
-- DATABASE SECURITY HARDENING
-- ============================================================

-- 1. Secure existing SECURITY DEFINER function public.rls_auto_enable() if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
    WHERE proname = 'rls_auto_enable' AND nspname = 'public'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres, service_role';
  END IF;
END $$;

-- 2. Prevent default EXECUTE privileges from being granted to PUBLIC for all future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM authenticated;


-- 7. HTML DOCUMENT TEMPLATES TABLE
create table public.document_templates (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  html_content text not null,
  is_visible boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.document_templates enable row level security;
create policy "Allow public access" on public.document_templates for all using (true) with check (true);


-- 8. PAYMENTS TABLE
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  internship_id text not null,
  amount integer not null, -- in paise (15000 paise for 150 INR)
  status text not null default 'pending', -- pending, completed, failed
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.payments enable row level security;
create policy "Allow public access" on public.payments for all using (true) with check (true);


-- 9. PLATFORM SETTINGS TABLE
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.platform_settings enable row level security;
create policy "Allow public access" on public.platform_settings for all using (true) with check (true);





-- 10. EMAIL LOGS TABLE
create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  recipient_email text not null,
  subject text not null,
  status text not null default 'pending', -- pending, sent, failed
  message_id text,
  preview_url text,
  template_name text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.email_logs enable row level security;
create policy "Allow public access" on public.email_logs for all using (true) with check (true);


-- 11. ANNOUNCEMENTS TABLE
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  priority text not null check (priority in ('low', 'medium', 'high')) default 'medium',
  type text not null check (type in ('info', 'warning', 'success')) default 'info',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.announcements enable row level security;
create policy "Allow public access" on public.announcements for all using (true) with check (true);


-- 12. ANNOUNCEMENT READS JUNCTION TABLE
create table public.announcement_reads (
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (announcement_id, student_id)
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.announcement_reads enable row level security;
create policy "Allow public access" on public.announcement_reads for all using (true) with check (true);

create table public.result_change_history (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  test_result_id uuid references public.test_results(id) on delete cascade not null,
  field_name text not null,
  previous_value text,
  new_value text,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.result_change_history enable row level security;
create policy "Allow public access" on public.result_change_history for all using (true) with check (true);

-- 13. SUPPORT TICKETS TABLE
create table public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  description text not null,
  category text not null, -- e.g. Technical, Payment, Certificate, Other
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and create public access policies
alter table public.support_tickets enable row level security;
create policy "Allow public access" on public.support_tickets for all using (true) with check (true);

-- ============================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================
-- Create index keys for foreign keys to optimize query joins and cascade deletes
CREATE INDEX IF NOT EXISTS idx_questions_internship_id ON public.questions(internship_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON public.test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_internship_id ON public.test_results(internship_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_student_id ON public.email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON public.announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_student_id ON public.announcement_reads(student_id);
CREATE INDEX IF NOT EXISTS idx_result_change_history_student_id ON public.result_change_history(student_id);
CREATE INDEX IF NOT EXISTS idx_result_change_history_admin_id ON public.result_change_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_result_change_history_test_result_id ON public.result_change_history(test_result_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student_id ON public.support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

