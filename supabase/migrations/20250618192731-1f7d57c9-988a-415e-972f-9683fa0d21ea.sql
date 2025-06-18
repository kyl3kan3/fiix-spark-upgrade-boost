
-- Add frequency column to checklists table
ALTER TABLE public.checklists 
ADD COLUMN frequency TEXT DEFAULT 'one-time';

-- Add a comment to document the expected values
COMMENT ON COLUMN public.checklists.frequency IS 'Frequency of checklist execution: one-time, daily, weekly, monthly, quarterly, annually';
