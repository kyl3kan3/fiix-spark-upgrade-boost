-- =====================================================
-- CRITICAL SECURITY FIXES - Emergency Data Protection  
-- =====================================================

-- STEP 1: Create proper user roles system to prevent privilege escalation
-- =====================================================

-- Create enum for roles (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('administrator', 'manager', 'technician', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role, company_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to get user's company (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Migrate existing roles from profiles to user_roles table
INSERT INTO public.user_roles (user_id, role, company_id)
SELECT id, role::app_role, company_id
FROM public.profiles
WHERE company_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = profiles.id 
      AND ur.company_id = profiles.company_id
  )
ON CONFLICT (user_id, role, company_id) DO NOTHING;

-- Drop and recreate RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
CREATE POLICY "Users can view roles in their company"
  ON public.user_roles
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage roles in their company" ON public.user_roles;
CREATE POLICY "Admins can manage roles in their company"
  ON public.user_roles
  FOR ALL
  USING (
    has_role(auth.uid(), 'administrator') 
    AND company_id = get_user_company(auth.uid())
  );

-- STEP 2: Remove dangerous public access policies
-- =====================================================

-- Drop all dangerous policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Anyone can create work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Anyone can view work order comments" ON public.work_order_comments;
DROP POLICY IF EXISTS "Anyone can create work order comments" ON public.work_order_comments;
DROP POLICY IF EXISTS "Anyone can view assets" ON public.assets;
DROP POLICY IF EXISTS "Anyone can create assets" ON public.assets;
DROP POLICY IF EXISTS "Anyone can update assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view vendors in their company" ON public.vendors;
DROP POLICY IF EXISTS "Users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Users can create locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update locations" ON public.locations;
DROP POLICY IF EXISTS "Users can delete locations" ON public.locations;

-- STEP 3: Create proper company-scoped RLS policies
-- =====================================================

-- Profiles: Company-scoped access only
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
CREATE POLICY "Users can view profiles in their company"
  ON public.profiles
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

-- Prevent users from updating their own role field
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;
CREATE POLICY "Users cannot change their own role"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND company_id = get_user_company(auth.uid())
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Work Orders: Company-scoped access
DROP POLICY IF EXISTS "Users can view work orders in their company" ON public.work_orders;
CREATE POLICY "Users can view work orders in their company"
  ON public.work_orders
  FOR SELECT
  USING (
    created_by IN (
      SELECT id FROM public.profiles 
      WHERE company_id = get_user_company(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create work orders" ON public.work_orders;
CREATE POLICY "Users can create work orders"
  ON public.work_orders
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND created_by IN (
      SELECT id FROM public.profiles 
      WHERE company_id = get_user_company(auth.uid())
    )
  );

-- Work Order Comments: Company-scoped access
DROP POLICY IF EXISTS "Users can view comments in their company" ON public.work_order_comments;
CREATE POLICY "Users can view comments in their company"
  ON public.work_order_comments
  FOR SELECT
  USING (
    work_order_id IN (
      SELECT id FROM public.work_orders wo
      WHERE wo.created_by IN (
        SELECT id FROM public.profiles 
        WHERE company_id = get_user_company(auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.work_order_comments;
CREATE POLICY "Users can create comments"
  ON public.work_order_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Assets: Add company_id column and policies
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Populate company_id for existing assets
UPDATE public.assets
SET company_id = (
  SELECT company_id FROM public.profiles 
  LIMIT 1
)
WHERE company_id IS NULL;

DROP POLICY IF EXISTS "Users can view assets in their company" ON public.assets;
CREATE POLICY "Users can view assets in their company"
  ON public.assets
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Users can create assets in their company" ON public.assets;
CREATE POLICY "Users can create assets in their company"
  ON public.assets
  FOR INSERT
  WITH CHECK (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Users can update assets in their company" ON public.assets;
CREATE POLICY "Users can update assets in their company"
  ON public.assets
  FOR UPDATE
  USING (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete assets in their company" ON public.assets;
CREATE POLICY "Admins can delete assets in their company"
  ON public.assets
  FOR DELETE
  USING (
    has_role(auth.uid(), 'administrator')
    AND company_id = get_user_company(auth.uid())
  );

-- Locations: Add company_id column and policies
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

UPDATE public.locations
SET company_id = (
  SELECT company_id FROM public.profiles 
  LIMIT 1
)
WHERE company_id IS NULL;

DROP POLICY IF EXISTS "Users can view locations in their company" ON public.locations;
CREATE POLICY "Users can view locations in their company"
  ON public.locations
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage locations in their company" ON public.locations;
CREATE POLICY "Admins can manage locations in their company"
  ON public.locations
  FOR ALL
  USING (
    has_role(auth.uid(), 'administrator')
    AND company_id = get_user_company(auth.uid())
  );

-- Vendors: Proper company-scoped policies
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

UPDATE public.vendors
SET company_id = (
  SELECT company_id FROM public.profiles 
  LIMIT 1
)
WHERE company_id IS NULL;

DROP POLICY IF EXISTS "Users can view vendors in their company" ON public.vendors;
CREATE POLICY "Users can view vendors in their company"
  ON public.vendors
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage vendors in their company" ON public.vendors;
CREATE POLICY "Admins can manage vendors in their company"
  ON public.vendors
  FOR ALL
  USING (
    has_role(auth.uid(), 'administrator')
    AND company_id = get_user_company(auth.uid())
  );

-- STEP 4: Fix database functions security
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_work_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_daily_logs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
      SELECT role::text 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
      LIMIT 1
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
      SELECT company_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    );
END;
$$;

-- STEP 5: Add indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_assets_company_id ON public.assets(company_id);
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON public.locations(company_id);
CREATE INDEX IF NOT EXISTS idx_vendors_company_id ON public.vendors(company_id);