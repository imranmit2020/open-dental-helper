-- Fix exec_sql function to properly handle whitespace and newlines
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
    query_lower text;
    trimmed_query text;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Clean and normalize the query
    trimmed_query := trim(regexp_replace(sql, '\s+', ' ', 'g'));
    query_lower := lower(trimmed_query);
    
    -- Validate that only SELECT queries are allowed
    IF NOT query_lower LIKE 'select%' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed. Query starts with: %', left(query_lower, 20);
    END IF;

    -- Prevent potentially dangerous operations (but allow information_schema)
    IF query_lower LIKE '%drop %' OR 
       query_lower LIKE '%delete %' OR 
       query_lower LIKE '%update %' OR 
       query_lower LIKE '%insert %' OR
       query_lower LIKE '%create %' OR 
       query_lower LIKE '%alter %' OR
       query_lower LIKE '%truncate %' THEN
        RAISE EXCEPTION 'Query contains forbidden operations';
    END IF;

    -- Execute the query and return results as JSON
    EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', sql) INTO result;
    
    -- Return empty array if no results
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Query execution failed: %', SQLERRM;
END;
$$;