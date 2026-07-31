-- TravelSpark seed data
-- Run this after the application has created the schema (ddl-auto=update).

INSERT INTO destinations (title, country, category, description, rating, estimated_budget, duration_days, image_url, featured)
VALUES
  ('Maldives Atolls','Maldives','beach','Pristine overwater villas, coral reefs, and turquoise lagoons in the Indian Ocean.',4.9,3200,5,'https://images.pexels.com/photos/9149359/pexels-photo-9149359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
  ('Bali Beach Escape','Indonesia','beach','Sun-kissed shores, surf breaks, and vibrant beach clubs across Bali''s coastline.',4.7,1400,6,'https://images.pexels.com/photos/29901885/pexels-photo-29901885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
  ('Swiss Alps Trek','Switzerland','mountain','Hike through wildflower meadows and snow-capped peaks in the Bernese Oberland.',4.8,2600,7,'https://images.pexels.com/photos/3098647/pexels-photo-3098647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
  ('Prague Old Town','Czech Republic','city','Cobblestone lanes, gothic spires, and riverside cafés in the heart of Europe.',4.6,1100,4,'https://images.pexels.com/photos/34994033/pexels-photo-34994033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true),
  ('Varanasi Ghats','India','spiritual','Dawn boat rides on the Ganges past ancient ghats and temple rituals.',4.7,900,3,'https://images.pexels.com/photos/27403387/pexels-photo-27403387.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false),
  ('Dubai Desert Safari','UAE','adventure','Dune bashing, camel rides, and Bedouin camps under the desert stars.',4.6,1700,3,'https://images.pexels.com/photos/12565188/pexels-photo-12565188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true)
ON CONFLICT DO NOTHING;
