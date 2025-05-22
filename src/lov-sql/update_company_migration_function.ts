
// SQL function to migrate company data from profiles.company_name to company records
// 
// CREATE OR REPLACE FUNCTION public.migrate_company_data()
// RETURNS void
// LANGUAGE plpgsql
// AS $function$
// DECLARE
//   company_rec RECORD;
//   new_company_id UUID;
// BEGIN
//   -- Get distinct company names from profiles
//   FOR company_rec IN SELECT DISTINCT company_name FROM public.profiles WHERE company_name IS NOT NULL LOOP
//     -- Create new company record
//     INSERT INTO public.companies (name)
//     VALUES (company_rec.company_name)
//     RETURNING id INTO new_company_id;
//     
//     -- Update profiles with the new company_id
//     UPDATE public.profiles
//     SET company_id = new_company_id
//     WHERE company_name = company_rec.company_name;
//   END LOOP;
// END;
// $function$

