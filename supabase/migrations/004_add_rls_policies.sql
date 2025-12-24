-- Enable RLS on appointments, emergencies, and inquiries tables if not already enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view their own emergencies" ON emergencies;
DROP POLICY IF EXISTS "Users can insert their own emergencies" ON emergencies;
DROP POLICY IF EXISTS "Users can update their own emergencies" ON emergencies;
DROP POLICY IF EXISTS "Users can delete their own emergencies" ON emergencies;

DROP POLICY IF EXISTS "Users can view their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can insert their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can delete their own inquiries" ON inquiries;

-- Create policies for appointments
CREATE POLICY "Users can view their own appointments"
    ON appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
    ON appointments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
    ON appointments FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for emergencies
CREATE POLICY "Users can view their own emergencies"
    ON emergencies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergencies"
    ON emergencies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergencies"
    ON emergencies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergencies"
    ON emergencies FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for inquiries
CREATE POLICY "Users can view their own inquiries"
    ON inquiries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inquiries"
    ON inquiries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inquiries"
    ON inquiries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inquiries"
    ON inquiries FOR DELETE
    USING (auth.uid() = user_id);
