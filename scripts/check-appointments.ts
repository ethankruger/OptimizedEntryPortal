import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjrntjjataqpueikvfei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcm50amphdGFxcHVlaWt2ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDQ0MDUsImV4cCI6MjA4MTkyMDQwNX0.Kj55Mrrf9Y8L8J5rbJVZudqUQJy_OAzFGDlV6dETb4A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
  console.log('Checking appointments...');

  const { data, error } = await supabase
    .from('appointments')
    .select('id, customer_name, service_address, service_city, service_state, service_zip, latitude, longitude, geocoded_at');

  if (error) {
    console.error('Error fetching appointments:', error);
    process.exit(1);
  }

  console.log(`\nFound ${data?.length || 0} appointments:\n`);
  data?.forEach(apt => {
    console.log(`- ${apt.customer_name}`);
    console.log(`  Address: ${apt.service_address}, ${apt.service_city}, ${apt.service_state} ${apt.service_zip}`);
    console.log(`  Coordinates: ${apt.latitude ? `${apt.latitude}, ${apt.longitude}` : 'Not geocoded'}`);
    console.log(`  Geocoded at: ${apt.geocoded_at || 'Never'}\n`);
  });

  process.exit(0);
}

checkAppointments();
