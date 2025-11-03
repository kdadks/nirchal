-- CHECK REMAINING OVERLAPPING POLICIES
-- Identifies which tables still have multiple policies for the same command

WITH policy_counts AS (
    SELECT 
        schemaname,
        tablename,
        cmd,
        COUNT(*) as policy_count,
        array_agg(policyname ORDER BY policyname) as policy_names
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, cmd
    HAVING COUNT(*) > 1
)
SELECT 
    tablename,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        WHEN cmd = '*' THEN 'ALL'
        ELSE cmd
    END as command_type,
    policy_count,
    policy_names
FROM policy_counts
ORDER BY tablename, command_type;