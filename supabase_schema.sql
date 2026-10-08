-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  nik TEXT,
  unit_name TEXT DEFAULT 'SMK Mitra Industri MM2100',
  role TEXT DEFAULT 'walas',
  default_class TEXT,
  plain_password TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date_signed TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- 4. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 5. Signatures Policies
DROP POLICY IF EXISTS "Signatures are viewable by everyone" ON signatures;
CREATE POLICY "Signatures are viewable by everyone" 
ON signatures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own signatures" ON signatures;
CREATE POLICY "Users can insert own signatures" 
ON signatures FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own signatures" ON signatures;
CREATE POLICY "Users can update own signatures" 
ON signatures FOR UPDATE USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can delete signatures" ON signatures;
CREATE POLICY "Admins can delete signatures"
ON signatures FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 6. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nik, unit_name, role, plain_password)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'), 
    new.raw_user_meta_data->>'nik',
    COALESCE(new.raw_user_meta_data->>'unit_name', 'SMK Mitra Industri MM2100'),
    COALESCE(new.raw_user_meta_data->>'role', 'walas'),
    new.raw_user_meta_data->>'plain_password'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Sync existing users (IMPORTANT: Jalankan ini jika sudah ada yang daftar)
INSERT INTO public.profiles (id, full_name, unit_name)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Walas SMK'), 
  'SMK Mitra Industri MM2100'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 8. QUERY UNTUK MENGUBAH PASSWORD USER LAMA SECARA MANUAL (Via SQL Editor)
-- Ganti 'password_baru' dan 'email_user_lama@domain.com' sesuai kebutuhan Anda.
-- (Ekstensi pgcrypto sudah aktif secara default di Supabase)
/*
UPDATE auth.users 
SET encrypted_password = crypt('password_baru', gen_salt('bf')) 
WHERE email = 'email_user_lama@domain.com';

UPDATE public.profiles 
SET plain_password = 'password_baru' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'email_user_lama@domain.com');
*/

-- 9. RESET PASSWORD OLEH ADMIN (dipanggil dari Admin Panel via supabase.rpc)
-- Jalankan sekali di SQL Editor Supabase.
CREATE OR REPLACE FUNCTION public.admin_reset_password(target_user_id UUID, new_password TEXT)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Hanya admin yang boleh mereset password';
  END IF;
  IF new_password IS NULL OR length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal 6 karakter';
  END IF;

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  UPDATE public.profiles
  SET plain_password = new_password
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

REVOKE ALL ON FUNCTION public.admin_reset_password(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_password(UUID, TEXT) TO authenticated;
