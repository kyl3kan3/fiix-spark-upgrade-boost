-- Align profiles.role default with handle_new_user / force_default_profile_role.
UPDATE public.profiles
SET role = 'technician'
WHERE role = 'user';

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'technician';
