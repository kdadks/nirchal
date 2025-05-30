-- Create admin users table
CREATE TABLE admin_users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users are viewable by authenticated users" ON admin_users
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users are insertable by admins" ON admin_users
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users are updatable by admins" ON admin_users
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users are deletable by admins" ON admin_users
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE admin_users.user_id = user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an editor
CREATE OR REPLACE FUNCTION is_editor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE admin_users.user_id = user_id
        AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin user (replace with actual admin user ID)
-- INSERT INTO admin_users (user_id, role) VALUES ('your-admin-user-id', 'admin');

-- Comments for proper setup:
/*
To set up the first admin user:

1. Create a user through Supabase Authentication
2. Get the user's UUID
3. Run the following SQL (replace the UUID):

INSERT INTO admin_users (user_id, role) 
VALUES ('paste-user-uuid-here', 'admin');

Additional users can then be added through the admin interface
by existing admin users.
*/