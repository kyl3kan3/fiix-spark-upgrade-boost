
-- Enable Row Level Security on the locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for locations table to allow authenticated users to perform CRUD operations
-- This assumes all authenticated users should be able to manage locations
-- You can modify these policies later to be more restrictive based on user roles or company access

-- Policy for SELECT operations
CREATE POLICY "Authenticated users can view locations" 
  ON public.locations 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy for INSERT operations
CREATE POLICY "Authenticated users can create locations" 
  ON public.locations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Policy for UPDATE operations
CREATE POLICY "Authenticated users can update locations" 
  ON public.locations 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Policy for DELETE operations
CREATE POLICY "Authenticated users can delete locations" 
  ON public.locations 
  FOR DELETE 
  TO authenticated 
  USING (true);
