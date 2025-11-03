/*
  # Canteen Management System Schema

  ## Overview
  This migration creates the complete database schema for the Canteen Management System,
  including user profiles, menu items, and meal selections with proper RLS policies.

  ## Tables Created
  
  1. **profiles**
     - Links to auth.users for employee information
     - Stores employee name, email, role (employee/admin)
     - created_at timestamp for record tracking

  2. **menu_items**
     - Stores daily menu items (breakfast, lunch, snacks)
     - Fields: name, description, meal_type, menu_date
     - Tracks creation and updates with timestamps
     - Allows admins to manage menu for specific dates

  3. **meal_selections**
     - Records employee meal confirmations (opt-in/opt-out)
     - Links user to specific menu items
     - Tracks selection status and timestamps
     - Ensures one selection per user per menu item

  ## Security
  - RLS enabled on all tables
  - Employees can view menus and manage their own selections
  - Admins have full access to manage menus and view all selections
  - Authentication required for all operations

  ## Important Notes
  1. meal_type enum: 'breakfast', 'lunch', 'snacks'
  2. Unique constraint prevents duplicate selections
  3. Cascade deletes maintain referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks')),
  menu_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Menu items policies
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create meal_selections table
CREATE TABLE IF NOT EXISTS meal_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  selection_date date NOT NULL,
  is_selected boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, menu_item_id, selection_date)
);

ALTER TABLE meal_selections ENABLE ROW LEVEL SECURITY;

-- Meal selections policies
CREATE POLICY "Users can view own selections"
  ON meal_selections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selections"
  ON meal_selections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selections"
  ON meal_selections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own selections"
  ON meal_selections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all selections"
  ON meal_selections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_date ON menu_items(menu_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_meal_type ON menu_items(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_selections_user ON meal_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_selections_date ON meal_selections(selection_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_selections_updated_at
  BEFORE UPDATE ON meal_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();