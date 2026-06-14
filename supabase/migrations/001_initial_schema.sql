-- ============================================================
-- Valerie Health — initial database schema
-- Run this in Supabase SQL Editor or via Supabase CLI
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name              TEXT,
  date_of_birth          DATE,
  stage                  TEXT CHECK (stage IN ('perimenopause','menopause','surgical_menopause','not_sure')),
  top_symptoms           TEXT[] DEFAULT '{}',
  goals                  TEXT[] DEFAULT '{}',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','past_due','canceled','free')),
  trial_ends_at          TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  onboarding_completed   BOOLEAN DEFAULT FALSE,
  avatar_url             TEXT,
  timezone               TEXT DEFAULT 'America/New_York',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ── Check-ins ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_ins (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score     INTEGER CHECK (overall_score BETWEEN 1 AND 10),
  -- Physical
  hot_flash_count   INTEGER DEFAULT 0,
  sleep_hours       NUMERIC(3,1),
  sleep_quality     INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  pain_level        INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  -- Mental / mood
  anxiety_level     INTEGER CHECK (anxiety_level BETWEEN 0 AND 10),
  brain_fog_level   INTEGER CHECK (brain_fog_level BETWEEN 0 AND 10),
  irritability_level INTEGER CHECK (irritability_level BETWEEN 0 AND 10),
  mood_score        INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  -- Energy
  energy_level      INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  -- Note
  note              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ── AI Conversations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      TEXT DEFAULT 'New conversation',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role            TEXT CHECK (role IN ('user','assistant')) NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Insights (generated weekly) ───────────────────────────
CREATE TABLE IF NOT EXISTS insights (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start   DATE NOT NULL,
  content      TEXT NOT NULL,
  insight_type TEXT DEFAULT 'weekly',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ── Providers directory (curated) ────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  title           TEXT,
  specialty       TEXT,
  approach        TEXT,
  telehealth      BOOLEAN DEFAULT FALSE,
  city            TEXT,
  state           TEXT,
  accepting_new   BOOLEAN DEFAULT TRUE,
  menopause_cert  BOOLEAN DEFAULT FALSE,
  bio             TEXT,
  website         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights        ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers       ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Check-ins
CREATE POLICY "checkins_all_own" ON check_ins FOR ALL USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "conversations_all_own" ON conversations FOR ALL USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "messages_all_own" ON messages FOR ALL USING (auth.uid() = user_id);

-- Insights
CREATE POLICY "insights_all_own" ON insights FOR ALL USING (auth.uid() = user_id);

-- Providers — public read
CREATE POLICY "providers_public_read" ON providers FOR SELECT USING (true);

-- ── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Seed a few demo providers ────────────────────────────────
INSERT INTO providers (name, title, specialty, approach, telehealth, city, state, accepting_new, menopause_cert, bio) VALUES
('Dr. Sarah Chen', 'MD, FACOG', 'OB-GYN', 'Integrative menopause care with evidence-based HRT', true, 'New York', 'NY', true, true, 'Dr. Chen specializes in perimenopause and menopause management with a whole-person approach. Board-certified in OB-GYN with 15 years focused on midlife women''s health.'),
('Dr. Amara Osei', 'DO, NCMP', 'Internal Medicine', 'Hormone therapy and lifestyle medicine', true, 'Austin', 'TX', true, true, 'NAMS Certified Menopause Practitioner. Dr. Osei believes every woman deserves a menopause specialist, not just a generalist who tolerates the conversation.'),
('Dr. Lisa Moretti', 'MD', 'Integrative Medicine', 'Mind-body approaches, nutrition, and bioidentical hormones', false, 'Los Angeles', 'CA', true, false, 'Combining functional medicine with conventional care to address the root causes of menopause symptoms.'),
('Dr. Rachel Kim', 'PhD, LCSW', 'Mental Health', 'CBT and menopause-related mood disorders', true, 'Chicago', 'IL', true, false, 'Specializes in anxiety, depression, and cognitive changes associated with perimenopause. NAMS affiliated therapist.'),
('Dr. Maya Patel', 'DPT', 'Pelvic Floor PT', 'Pelvic floor rehabilitation and genitourinary health', false, 'Boston', 'MA', true, false, 'Pelvic floor specialist focused on the genitourinary symptoms of menopause including bladder changes and pelvic pain.');
