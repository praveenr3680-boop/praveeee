import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'admin';
  created_at: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks';
  menu_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MealSelection = {
  id: string;
  user_id: string;
  menu_item_id: string;
  selection_date: string;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
};
