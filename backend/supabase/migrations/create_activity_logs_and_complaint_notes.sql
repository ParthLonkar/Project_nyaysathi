-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Create complaint_notes table  
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_notes_complaint_id ON complaint_notes(complaint_id);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- activity_logs: Users can only see their own logs
CREATE POLICY "Users view own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- complaint_notes: Users can see notes from complaints in their department
CREATE POLICY "Users view complaint notes"
  ON complaint_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_notes.complaint_id
    )
  );

CREATE POLICY "Users insert complaint notes"
  ON complaint_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_notes.complaint_id
    )
  );
