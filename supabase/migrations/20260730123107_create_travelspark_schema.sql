/*
# TravelSpark — initial schema

1. Purpose
   Travel planner app. Users browse destinations, create trips, build day-wise
   itineraries, save favorites, leave reviews, and see budget breakdowns.
   Admins manage destinations. Auth is Supabase email/password.

2. New Tables
   - profiles        : mirrors auth.users, adds display_name + role (USER/ADMIN)
   - destinations    : curated places (title, country, category, description,
                       rating, estimated_budget, duration_days, image_url)
   - trips           : a user's planned trip (name, destination, dates, travelers,
                       budget, notes). Owner-scoped.
   - itinerary_items : day-wise activities for a trip. Scoped via trips.
   - favorites       : user's saved destinations. Owner-scoped.
   - reviews         : user reviews on destinations. Owner-scoped.

3. Security (RLS)
   - destinations: public read (anon + authenticated); only admin write.
   - profiles: each user reads/updates own row; admins read all.
   - trips / itinerary_items / favorites / reviews: owner-scoped CRUD via auth.uid().
   - Admin detection: profiles.role = 'ADMIN' (checked in policies via EXISTS subquery).

4. Notes
   - user_id columns default to auth.uid() so client inserts omitting owner succeed.
   - itinerary_items scoped through trips ownership (no direct user_id column).
   - Admin write policy on destinations uses a helper EXISTS check on profiles.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
TO authenticated USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- destinations
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  country text NOT NULL,
  category text NOT NULL CHECK (category IN ('beach','mountain','city','adventure','spiritual','island')),
  description text NOT NULL DEFAULT '',
  rating numeric(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  estimated_budget numeric(10,2) NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 3 CHECK (duration_days > 0),
  image_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "destinations_select_public" ON destinations;
CREATE POLICY "destinations_select_public" ON destinations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "destinations_insert_admin" ON destinations;
CREATE POLICY "destinations_insert_admin" ON destinations FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

DROP POLICY IF EXISTS "destinations_update_admin" ON destinations;
CREATE POLICY "destinations_update_admin" ON destinations FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

DROP POLICY IF EXISTS "destinations_delete_admin" ON destinations;
CREATE POLICY "destinations_delete_admin" ON destinations FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- trips
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  travelers int NOT NULL DEFAULT 1 CHECK (travelers > 0),
  budget numeric(10,2) NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trips_select_own" ON trips;
CREATE POLICY "trips_select_own" ON trips FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_insert_own" ON trips;
CREATE POLICY "trips_insert_own" ON trips FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_update_own" ON trips;
CREATE POLICY "trips_update_own" ON trips FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_delete_own" ON trips;
CREATE POLICY "trips_delete_own" ON trips FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- itinerary_items (scoped via trips ownership)
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number int NOT NULL DEFAULT 1 CHECK (day_number > 0),
  category text NOT NULL CHECK (category IN ('hotel','food','transport','sightseeing','notes')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "itinerary_select_own" ON itinerary_items;
CREATE POLICY "itinerary_select_own" ON itinerary_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = itinerary_items.trip_id AND t.user_id = auth.uid())
);

DROP POLICY IF EXISTS "itinerary_insert_own" ON itinerary_items;
CREATE POLICY "itinerary_insert_own" ON itinerary_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = itinerary_items.trip_id AND t.user_id = auth.uid())
);

DROP POLICY IF EXISTS "itinerary_update_own" ON itinerary_items;
CREATE POLICY "itinerary_update_own" ON itinerary_items FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = itinerary_items.trip_id AND t.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = itinerary_items.trip_id AND t.user_id = auth.uid())
);

DROP POLICY IF EXISTS "itinerary_delete_own" ON itinerary_items;
CREATE POLICY "itinerary_delete_own" ON itinerary_items FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = itinerary_items.trip_id AND t.user_id = auth.uid())
);

-- favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, destination_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_trip ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dest ON reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);

-- Seed destinations
INSERT INTO destinations (title, country, category, description, rating, estimated_budget, duration_days, image_url, featured) VALUES
('Maldives Atolls','Maldives','beach','Pristine overwater villas, coral reefs, and turquoise lagoons in the Indian Ocean.',4.9,3200,5,'https://images.pexels.com/photos/9149359/pexels-photo-9149359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Bali Beach Escape','Indonesia','beach','Sun-kissed shores, surf breaks, and vibrant beach clubs across Bali''s coastline.',4.7,1400,6,'https://images.pexels.com/photos/29901885/pexels-photo-29901885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Swiss Alps Trek','Switzerland','mountain','Hike through wildflower meadows and snow-capped peaks in the Bernese Oberland.',4.8,2600,7,'https://images.pexels.com/photos/3098647/pexels-photo-3098647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Himalayan Adventure','Nepal','mountain','Trek the Annapurna circuit through rhododendron forests and high mountain passes.',4.9,1800,12,'https://images.pexels.com/photos/38706118/pexels-photo-38706118.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
('Prague Old Town','Czech Republic','city','Cobblestone lanes, gothic spires, and riverside cafés in the heart of Europe.',4.6,1100,4,'https://images.pexels.com/photos/34994033/pexels-photo-34994033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Istanbul Crossroads','Turkey','city','Where East meets West: bazaars, mosques, and Bosphorus sunsets.',4.5,1300,5,'https://images.pexels.com/photos/10612935/pexels-photo-10612935.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
('Varanasi Ghats','India','spiritual','Dawn boat rides on the Ganges past ancient ghats and temple rituals.',4.7,900,3,'https://images.pexels.com/photos/27403387/pexels-photo-27403387.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
('Dubai Desert Safari','UAE','adventure','Dune bashing, camel rides, and Bedouin camps under the desert stars.',4.6,1700,3,'https://images.pexels.com/photos/12565188/pexels-photo-12565188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Abu Dhabi Dunes','UAE','adventure','4x4 adventures across golden sands with luxury desert resorts.',4.5,2100,4,'https://images.pexels.com/photos/1453097/pexels-photo-1453097.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
('Maldives Island Resort','Maldives','island','Overwater bungalows and house reefs on a private atoll.',4.9,3800,6,'https://images.pexels.com/photos/8356055/pexels-photo-8356055.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
('Tropical Coast Village','Thailand','island','Fishing villages, limestone cliffs, and hidden lagoons.',4.6,1200,5,'https://images.pexels.com/photos/417351/pexels-photo-417351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
('Renaissance Old Town','Italy','city','Frescoed facades, piazzas, and gelato in a sunlit historic center.',4.7,1600,5,'https://images.pexels.com/photos/16922364/pexels-photo-16922364.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false)
ON CONFLICT DO NOTHING;
