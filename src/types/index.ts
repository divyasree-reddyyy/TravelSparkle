export type Role = 'USER' | 'ADMIN';

export interface Profile {
  id: string;
  display_name: string;
  role: Role;
  created_at: string;
}

export type DestinationCategory =
  | 'beach'
  | 'mountain'
  | 'city'
  | 'adventure'
  | 'spiritual'
  | 'island';

export interface Destination {
  id: string;
  title: string;
  country: string;
  category: DestinationCategory;
  description: string;
  rating: number;
  estimated_budget: number;
  duration_days: number;
  image_url: string;
  featured: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number;
  notes: string;
  created_at: string;
  destination?: Destination | null;
}

export type ItineraryCategory = 'hotel' | 'food' | 'transport' | 'sightseeing' | 'notes';

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_number: number;
  category: ItineraryCategory;
  title: string;
  description: string;
  cost: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  destination_id: string;
  created_at: string;
  destination?: Destination;
}

export interface Review {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: Pick<Profile, 'display_name'>;
}
