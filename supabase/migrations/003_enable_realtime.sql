-- Enable real-time replication for appointments, emergencies, and inquiries tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
