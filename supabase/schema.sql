-- ============================================================
-- Teacher Portal - Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  page_count INTEGER,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  page_number INTEGER,
  order_index INTEGER DEFAULT 0,
  infographic_url TEXT,
  infographic_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_books_teacher_id ON public.books(teacher_id);
CREATE INDEX IF NOT EXISTS idx_topics_book_id ON public.topics(book_id);
CREATE INDEX IF NOT EXISTS idx_topics_teacher_id ON public.topics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON public.topics(book_id, order_index);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Teachers can view own books"
  ON public.books FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own books"
  ON public.books FOR DELETE
  USING (auth.uid() = teacher_id);

-- Topics policies
CREATE POLICY "Teachers can view own topics"
  ON public.topics FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own topics"
  ON public.topics FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own topics"
  ON public.topics FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own topics"
  ON public.topics FOR DELETE
  USING (auth.uid() = teacher_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in the Supabase Dashboard > Storage
-- OR via the Supabase CLI
-- ============================================================

-- Create storage buckets (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('books', 'books', false, 52428800, ARRAY['application/pdf']),
  ('infographics', 'infographics', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for books bucket
CREATE POLICY "Teachers can upload books"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'books' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Teachers can read own books"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'books' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can delete own books"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'books' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for infographics bucket (public read)
CREATE POLICY "Anyone can view infographics"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'infographics');

CREATE POLICY "Teachers can upload infographics"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'infographics' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Teachers can update own infographics"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'infographics' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can delete own infographics"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'infographics' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
