-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  size INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  golden_visa BOOLEAN DEFAULT false,
  completion_year INTEGER,
  image_url TEXT,
  description TEXT,
  purchase_price NUMERIC(12, 2) DEFAULT 0,
  transfer_fees NUMERIC(12, 2) DEFAULT 0,
  renovation_cost NUMERIC(12, 2) DEFAULT 0,
  selling_price NUMERIC(12, 2) DEFAULT 0,
  roi NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_area ON projects(area);
CREATE INDEX idx_projects_golden_visa ON projects(golden_visa);
CREATE INDEX idx_inquiries_project_id ON inquiries(project_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Projects can be created by authenticated users" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Projects can be updated by authenticated users" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Projects can be deleted by authenticated users" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for inquiries
CREATE POLICY "Inquiries are viewable by authenticated users" ON inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Insert sample data
INSERT INTO projects (
  title, area, price, size, bedrooms, bathrooms, status, golden_visa, 
  completion_year, image_url, description, purchase_price, transfer_fees, 
  renovation_cost, selling_price, roi
) VALUES 
(
  'Luxury Apartment in Kolonaki',
  'Kolonaki, Athens',
  450000,
  120,
  3,
  2,
  'available',
  true,
  2018,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'Stunning luxury apartment in the heart of Kolonaki, featuring modern amenities and breathtaking city views. Perfect for Golden Visa investment with excellent ROI potential.',
  380000,
  15000,
  25000,
  520000,
  25.0
),
(
  'Seaside Villa in Glyfada',
  'Glyfada, Athens',
  750000,
  200,
  4,
  3,
  'available',
  true,
  2020,
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
  'Beautiful seaside villa with private pool and garden. Located in prestigious Glyfada area with direct beach access. Golden Visa eligible with high rental yield potential.',
  650000,
  25000,
  35000,
  890000,
  28.5
),
(
  'Modern Loft in Psiri',
  'Psiri, Athens',
  280000,
  85,
  2,
  1,
  'available',
  true,
  2019,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'Charming modern loft in trendy Psiri district. Recently renovated with industrial design elements. Perfect for young professionals and Golden Visa investors.',
  240000,
  10000,
  18000,
  340000,
  22.0
),
(
  'Penthouse in Syntagma',
  'Syntagma, Athens',
  1200000,
  180,
  3,
  3,
  'reserved',
  true,
  2021,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  'Exclusive penthouse with panoramic Acropolis views. Premium location near Parliament and luxury shopping. Features private terrace and high-end finishes.',
  1050000,
  40000,
  50000,
  1450000,
  30.2
),
(
  'Traditional House in Plaka',
  'Plaka, Athens',
  650000,
  150,
  4,
  2,
  'sold',
  true,
  1960,
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&h=600&fit=crop',
  'Authentic traditional house in historic Plaka neighborhood. Recently restored preserving original architectural features. Steps from Acropolis and major attractions.',
  550000,
  20000,
  45000,
  780000,
  26.8
);