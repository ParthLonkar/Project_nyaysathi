-- Seed data for testing/development

-- Insert sample users (after they authenticate)
-- Note: These should be created through the Supabase auth UI

-- Insert sample user roles
INSERT INTO user_roles (user_id, role) VALUES
-- (auth.users.id, 'admin'),  -- Replace with actual user ID
-- (auth.users.id, 'user'),   -- Replace with actual user ID
ON CONFLICT DO NOTHING;

-- Insert sample complaints
INSERT INTO complaints (user_id, title, description, category, status, priority) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Breach of Contract', 'The vendor failed to deliver services as promised', 'general', 'new', 'high'),
('00000000-0000-0000-0000-000000000002'::uuid, 'Consumer Rights Violation', 'Received defective product', 'consumer', 'processing', 'medium'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Employment Dispute', 'Unfair termination without cause', 'employment', 'new', 'high')
ON CONFLICT DO NOTHING;
