-- Google Product Taxonomy Search and Utility Functions

-- Function to search categories with relevance ranking
CREATE OR REPLACE FUNCTION search_google_categories(search_term TEXT)
RETURNS TABLE (
    id INTEGER,
    category_name TEXT,
    full_path TEXT,
    level INTEGER,
    parent_id INTEGER,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gpc.id,
        gpc.category_name,
        gpc.full_path,
        gpc.level,
        gpc.parent_id,
        CASE 
            -- Exact match on category name (highest priority)
            WHEN LOWER(gpc.category_name) = LOWER(search_term) THEN 1.0
            -- Starts with search term
            WHEN LOWER(gpc.category_name) LIKE LOWER(search_term || '%') THEN 0.9
            -- Contains search term
            WHEN LOWER(gpc.category_name) LIKE LOWER('%' || search_term || '%') THEN 0.7
            -- Full path contains search term
            WHEN LOWER(gpc.full_path) LIKE LOWER('%' || search_term || '%') THEN 0.5
            -- Full-text search match
            ELSE ts_rank(to_tsvector('english', gpc.full_path), plainto_tsquery('english', search_term))
        END AS relevance
    FROM google_product_categories gpc
    WHERE 
        LOWER(gpc.category_name) LIKE LOWER('%' || search_term || '%')
        OR LOWER(gpc.full_path) LIKE LOWER('%' || search_term || '%')
        OR to_tsvector('english', gpc.full_path) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance DESC, gpc.level ASC, gpc.category_name ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get category breadcrumb/hierarchy
CREATE OR REPLACE FUNCTION get_category_breadcrumb(category_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    breadcrumb TEXT;
BEGIN
    SELECT full_path INTO breadcrumb
    FROM google_product_categories
    WHERE id = category_id;
    
    RETURN breadcrumb;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON FUNCTION search_google_categories(TEXT) IS 'Search Google Product Taxonomy categories with relevance ranking';
COMMENT ON FUNCTION get_category_breadcrumb(INTEGER) IS 'Get the full hierarchical path (breadcrumb) for a category';
