

// SQL migration to add company_name to profiles table
export const sql = `
-- Add company_name column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT;
`;

