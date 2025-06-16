
-- Check for any foreign key constraints that reference the assets table
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name='assets'
  AND tc.table_schema = 'public';

-- Also check what's referencing the specific asset we're trying to delete
SELECT 'work_orders' as table_name, count(*) as count FROM work_orders WHERE asset_id = 'ee71eda9-e410-4685-bfaf-bc7dd5911dfd'
UNION ALL
SELECT 'vendor_assets' as table_name, count(*) as count FROM vendor_assets WHERE asset_id = 'ee71eda9-e410-4685-bfaf-bc7dd5911dfd'
UNION ALL
SELECT 'assets_children' as table_name, count(*) as count FROM assets WHERE parent_id = 'ee71eda9-e410-4685-bfaf-bc7dd5911dfd';
