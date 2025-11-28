-- ============================================
-- Lost and Found Portal - Supabase Schema
-- Optimized for Performance & Security
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- ENUMS
-- ============================================

-- User role types
CREATE TYPE user_role AS ENUM ('director', 'admin', 'student');

-- Item status types
CREATE TYPE item_status AS ENUM ('pending', 'approved', 'claimed', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT username_length CHECK (length(username) >= 3),
    CONSTRAINT password_length CHECK (length(password) >= 60) -- bcrypt hash is 60 chars
);

-- Lost items table
CREATE TABLE lost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location_found VARCHAR(255) NOT NULL,
    date_found DATE NOT NULL,
    image_url TEXT,
    status item_status NOT NULL DEFAULT 'pending',
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT item_name_length CHECK (length(item_name) >= 2),
    CONSTRAINT description_length CHECK (length(description) >= 10),
    CONSTRAINT date_not_future CHECK (date_found <= CURRENT_DATE),
    CONSTRAINT valid_status_transitions CHECK (
        (status = 'pending') OR
        (status = 'approved' AND approved_by IS NOT NULL) OR
        (status = 'claimed' AND claimed_by IS NOT NULL) OR
        (status = 'rejected')
    )
);

-- ============================================
-- INDEXES (Performance Optimization)
-- ============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Lost items table indexes
CREATE INDEX idx_lost_items_status ON lost_items(status);
CREATE INDEX idx_lost_items_reported_by ON lost_items(reported_by);
CREATE INDEX idx_lost_items_claimed_by ON lost_items(claimed_by);
CREATE INDEX idx_lost_items_date_found ON lost_items(date_found DESC);
CREATE INDEX idx_lost_items_created_at ON lost_items(created_at DESC);
CREATE INDEX idx_lost_items_category ON lost_items(category);

-- Full-text search indexes (for item search)
CREATE INDEX idx_lost_items_item_name_trgm ON lost_items USING gin(item_name gin_trgm_ops);
CREATE INDEX idx_lost_items_description_trgm ON lost_items USING gin(description gin_trgm_ops);
CREATE INDEX idx_lost_items_location_trgm ON lost_items USING gin(location_found gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_lost_items_status_date ON lost_items(status, date_found DESC);
CREATE INDEX idx_lost_items_reported_status ON lost_items(reported_by, status);

-- ============================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for lost_items table
CREATE TRIGGER update_lost_items_updated_at
    BEFORE UPDATE ON lost_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set claimed_at timestamp
CREATE OR REPLACE FUNCTION set_claimed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'claimed' AND OLD.status != 'claimed' THEN
        NEW.claimed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lost_items_claimed_at
    BEFORE UPDATE ON lost_items
    FOR EACH ROW
    EXECUTE FUNCTION set_claimed_at();

-- Auto-set approved_at timestamp
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.approved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lost_items_approved_at
    BEFORE UPDATE ON lost_items
    FOR EACH ROW
    EXECUTE FUNCTION set_approved_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users Table RLS Policies
-- ============================================

-- Service role can do everything (for API routes)
CREATE POLICY "Service role has full access to users"
    ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Directors can read all users
CREATE POLICY "Directors can read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'director'
        )
    );

-- Admins can read all users
CREATE POLICY "Admins can read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Directors can manage users
CREATE POLICY "Directors can manage users"
    ON users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'director'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'director'
        )
    );

-- ============================================
-- Lost Items Table RLS Policies
-- ============================================

-- Service role can do everything
CREATE POLICY "Service role has full access to lost_items"
    ON lost_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- All authenticated users can view approved items
CREATE POLICY "Authenticated users can view approved items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (status = 'approved' OR status = 'claimed');

-- Students can view their own reported items (any status)
CREATE POLICY "Students can view own reported items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (reported_by = auth.uid());

-- Students can view their claimed items
CREATE POLICY "Students can view own claimed items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (claimed_by = auth.uid());

-- Students can report new items
CREATE POLICY "Students can report items"
    ON lost_items
    FOR INSERT
    TO authenticated
    WITH CHECK (reported_by = auth.uid() AND status = 'pending');

-- Students can update their own pending items
CREATE POLICY "Students can update own pending items"
    ON lost_items
    FOR UPDATE
    TO authenticated
    USING (reported_by = auth.uid() AND status = 'pending')
    WITH CHECK (reported_by = auth.uid());

-- Admins can view all items
CREATE POLICY "Admins can view all items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update items (approve/reject)
CREATE POLICY "Admins can update items"
    ON lost_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete items
CREATE POLICY "Admins can delete items"
    ON lost_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Directors can view all items
CREATE POLICY "Directors can view all items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'director'
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search items (fuzzy search)
CREATE OR REPLACE FUNCTION search_lost_items(
    search_query TEXT,
    search_status item_status DEFAULT NULL,
    search_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    item_name VARCHAR,
    category VARCHAR,
    description TEXT,
    location_found VARCHAR,
    date_found DATE,
    status item_status,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        li.id,
        li.item_name,
        li.category,
        li.description,
        li.location_found,
        li.date_found,
        li.status,
        GREATEST(
            similarity(li.item_name, search_query),
            similarity(li.description, search_query),
            similarity(li.location_found, search_query)
        ) AS similarity_score
    FROM lost_items li
    WHERE
        (search_status IS NULL OR li.status = search_status)
        AND (search_category IS NULL OR li.category = search_category)
        AND (
            li.item_name ILIKE '%' || search_query || '%'
            OR li.description ILIKE '%' || search_query || '%'
            OR li.location_found ILIKE '%' || search_query || '%'
        )
    ORDER BY similarity_score DESC, li.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
    total_reported INTEGER,
    total_claimed INTEGER,
    pending_items INTEGER,
    approved_items INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_reported,
        COUNT(*) FILTER (WHERE claimed_by = user_id)::INTEGER AS total_claimed,
        COUNT(*) FILTER (WHERE reported_by = user_id AND status = 'pending')::INTEGER AS pending_items,
        COUNT(*) FILTER (WHERE reported_by = user_id AND status = 'approved')::INTEGER AS approved_items
    FROM lost_items
    WHERE reported_by = user_id OR claimed_by = user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE lost_items;

-- Set autovacuum settings for better performance
ALTER TABLE users SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE lost_items SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE users IS 'Stores user accounts with roles: director, admin, student';
COMMENT ON TABLE lost_items IS 'Stores lost and found items with approval workflow';

COMMENT ON COLUMN users.password IS 'bcrypt hashed password (60 chars)';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';

COMMENT ON COLUMN lost_items.status IS 'Item workflow: pending -> approved/rejected, approved -> claimed';
COMMENT ON COLUMN lost_items.reported_by IS 'Student who reported the item';
COMMENT ON COLUMN lost_items.claimed_by IS 'Student who claimed the item';
COMMENT ON COLUMN lost_items.approved_by IS 'Admin who approved/rejected the item';

-- ============================================
-- INITIAL SETUP COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
