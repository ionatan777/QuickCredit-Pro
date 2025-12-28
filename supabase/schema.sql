-- QuickCredit Pro - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller')),
  store_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Evaluations table (core business data)
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Customer data
  customer_age INT NOT NULL,
  customer_monthly_income DECIMAL(10,2) NOT NULL,
  customer_employment_tenure_months INT NOT NULL,
  customer_has_internal_default BOOLEAN DEFAULT FALSE,
  customer_phone TEXT,
  customer_id_number TEXT,
  
  -- Operation data
  operation_product_price DECIMAL(10,2) NOT NULL,
  operation_down_payment DECIMAL(10,2) NOT NULL,
  operation_term_months INT NOT NULL,
  operation_monthly_payment DECIMAL(10,2) NOT NULL,
  operation_product_name TEXT NOT NULL,
  
  -- Evaluation results
  decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'CONDITIONAL_APPROVE', 'REVIEW', 'REJECT')),
  segment TEXT NOT NULL CHECK (segment IN ('LOW', 'MID', 'HIGH')),
  
  -- Metrics
  metric_dti DECIMAL(6,4) NOT NULL,
  metric_down_payment_ratio DECIMAL(6,4) NOT NULL,
  metric_financed_amount DECIMAL(10,2) NOT NULL,
  
  -- JSON fields for complex data
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  evaluated_by UUID REFERENCES public.profiles(id) NOT NULL,
  store_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT evaluations_dti_check CHECK (metric_dti >= 0),
  CONSTRAINT evaluations_down_payment_check CHECK (operation_down_payment >= 0)
);

-- 3. Create indexes for better query performance
CREATE INDEX idx_evaluations_decision ON public.evaluations(decision);
CREATE INDEX idx_evaluations_evaluated_by ON public.evaluations(evaluated_by);
CREATE INDEX idx_evaluations_created_at ON public.evaluations(created_at DESC);
CREATE INDEX idx_evaluations_store_id ON public.evaluations(store_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. RLS Policies for evaluations
-- Sellers can read their own evaluations
CREATE POLICY "Sellers can read own evaluations"
  ON public.evaluations
  FOR SELECT
  USING (evaluated_by = auth.uid());

-- Admins can read all evaluations
CREATE POLICY "Admins can read all evaluations"
  ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can create evaluations
CREATE POLICY "Authenticated users can create evaluations"
  ON public.evaluations
  FOR INSERT
  WITH CHECK (auth.uid() = evaluated_by);

-- 7. Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger for updated_at on profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Create view for evaluation statistics (for admin dashboard)
CREATE OR REPLACE VIEW public.evaluation_stats AS
SELECT
  COUNT(*) as total_evaluations,
  COUNT(CASE WHEN decision = 'APPROVE' THEN 1 END) as approved_count,
  COUNT(CASE WHEN decision = 'CONDITIONAL_APPROVE' THEN 1 END) as conditional_count,
  COUNT(CASE WHEN decision = 'REVIEW' THEN 1 END) as review_count,
  COUNT(CASE WHEN decision = 'REJECT' THEN 1 END) as rejected_count,
  ROUND(AVG(metric_dti), 4) as avg_dti,
  ROUND(AVG(metric_down_payment_ratio), 4) as avg_down_payment_ratio,
  evaluated_by,
  DATE(created_at) as evaluation_date
FROM public.evaluations
GROUP BY evaluated_by, DATE(created_at);

-- Grant access to the view
GRANT SELECT ON public.evaluation_stats TO authenticated;

-- 12. Insert demo users (for testing)
-- Note: You'll need to create these users via Supabase Auth UI first,
-- then update their profiles with this SQL

-- Example: After creating users in Auth, update their profiles:
-- UPDATE public.profiles 
-- SET role = 'admin', full_name = 'Admin User'
-- WHERE email = 'admin@quickcredit.com';

-- UPDATE public.profiles
-- SET role = 'seller', full_name = 'Seller User'
-- WHERE email = 'seller@quickcredit.com';

-- Done! Your database is ready for production 🚀
