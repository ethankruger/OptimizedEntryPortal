-- Add completion fields to emergencies table
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived field and completed_at to appointments (if not exists)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived field and archived_at to inquiries (if not exists)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_archived ON emergencies(archived);
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON appointments(archived);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Add trigger to auto-set archived_at when status changes to archived for inquiries
CREATE OR REPLACE FUNCTION set_inquiries_archived_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'archived' AND OLD.status != 'archived' THEN
        NEW.archived_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inquiries_archived_at_trigger ON inquiries;
CREATE TRIGGER inquiries_archived_at_trigger
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION set_inquiries_archived_at();

-- Add trigger to auto-set completed_at when status changes to completed for appointments
CREATE OR REPLACE FUNCTION set_appointments_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_completed_at_trigger ON appointments;
CREATE TRIGGER appointments_completed_at_trigger
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION set_appointments_completed_at();

-- Add trigger to auto-set completed_at when status changes to completed for emergencies
CREATE OR REPLACE FUNCTION set_emergencies_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS emergencies_completed_at_trigger ON emergencies;
CREATE TRIGGER emergencies_completed_at_trigger
    BEFORE UPDATE ON emergencies
    FOR EACH ROW
    EXECUTE FUNCTION set_emergencies_completed_at();
