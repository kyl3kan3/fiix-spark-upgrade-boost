UPDATE public.companies SET created_by = NULL WHERE created_by = 'f2a192a8-ca9f-4732-afbd-6deded999517';
DELETE FROM auth.users WHERE id = 'f2a192a8-ca9f-4732-afbd-6deded999517';