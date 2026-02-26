-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  unit_name TEXT DEFAULT 'SMK Mitra Industri MM2100',
  role TEXT DEFAULT 'walas',
  default_class TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date_signed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- 4. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Signatures Policies
CREATE POLICY "Signatures are viewable by everyone" 
ON signatures FOR SELECT USING (true);

CREATE POLICY "Users can insert own signatures" 
ON signatures FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own signatures" 
ON signatures FOR UPDATE USING (auth.uid() = created_by);

-- 6. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, unit_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'SMK Mitra Industri MM2100');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
