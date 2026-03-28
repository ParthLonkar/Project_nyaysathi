-- Row-Level Security Policies

-- Complaints table RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Users can read their own complaints
CREATE POLICY "Users can read own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Users can insert their own complaints
CREATE POLICY "Users can insert complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own complaints (limited fields)
CREATE POLICY "Users can update own complaints"
  ON complaints FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ))
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Admins can delete complaints
CREATE POLICY "Admins can delete complaints"
  ON complaints FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- User roles table RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() 
    AND ur2.role = 'admin'
  ));

-- Audit log RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));
