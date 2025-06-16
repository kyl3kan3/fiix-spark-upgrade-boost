
-- Enable Row Level Security on the assets table if not already enabled
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets table to allow authenticated users to perform CRUD operations
-- This assumes all authenticated users should be able to manage assets
-- You can modify these policies later to be more restrictive based on user roles

-- Policy for SELECT operations
CREATE POLICY "Authenticated users can view assets" 
  ON public.assets 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy for INSERT operations
CREATE POLICY "Authenticated users can create assets" 
  ON public.assets 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Policy for UPDATE operations
CREATE POLICY "Authenticated users can update assets" 
  ON public.assets 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Policy for DELETE operations
CREATE POLICY "Authenticated users can delete assets" 
  ON public.assets 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Also ensure vendor_assets table has proper RLS policies since our deletion function interacts with it
ALTER TABLE public.vendor_assets ENABLE ROW LEVEL SECURITY;

-- Policy for vendor_assets SELECT
CREATE POLICY "Authenticated users can view vendor_assets" 
  ON public.vendor_assets 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy for vendor_assets DELETE (needed for the auto-deletion in our asset deletion function)
CREATE POLICY "Authenticated users can delete vendor_assets" 
  ON public.vendor_assets 
  FOR DELETE 
  TO authenticated 
  USING (true);
