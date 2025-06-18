
-- Create checklists table for checklist templates
CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  company_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create checklist_items table for individual checklist items
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'checkbox', -- checkbox, text, number, date
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_submissions table for completed checklists
CREATE TABLE public.checklist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
);

-- Create checklist_submission_items table for individual item responses
CREATE TABLE public.checklist_submission_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.checklist_submissions(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  response_value TEXT,
  is_checked BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_submission_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for checklists
CREATE POLICY "Users can view checklists from their company" 
  ON public.checklists 
  FOR SELECT 
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create checklists for their company" 
  ON public.checklists 
  FOR INSERT 
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update checklists they created" 
  ON public.checklists 
  FOR UPDATE 
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete checklists they created" 
  ON public.checklists 
  FOR DELETE 
  USING (created_by = auth.uid());

-- Create RLS policies for checklist_items
CREATE POLICY "Users can view checklist items from their company" 
  ON public.checklist_items 
  FOR SELECT 
  USING (checklist_id IN (SELECT id FROM public.checklists WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage checklist items for their checklists" 
  ON public.checklist_items 
  FOR ALL 
  USING (checklist_id IN (SELECT id FROM public.checklists WHERE created_by = auth.uid()));

-- Create RLS policies for checklist_submissions
CREATE POLICY "Users can view submissions from their company" 
  ON public.checklist_submissions 
  FOR SELECT 
  USING (checklist_id IN (SELECT id FROM public.checklists WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can create submissions" 
  ON public.checklist_submissions 
  FOR INSERT 
  WITH CHECK (submitted_by = auth.uid());

-- Create RLS policies for checklist_submission_items
CREATE POLICY "Users can view submission items from their company" 
  ON public.checklist_submission_items 
  FOR SELECT 
  USING (submission_id IN (SELECT id FROM public.checklist_submissions WHERE checklist_id IN (SELECT id FROM public.checklists WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))));

CREATE POLICY "Users can create submission items for their submissions" 
  ON public.checklist_submission_items 
  FOR INSERT 
  WITH CHECK (submission_id IN (SELECT id FROM public.checklist_submissions WHERE submitted_by = auth.uid()));
