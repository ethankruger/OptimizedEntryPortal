import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjrntjjataqpueikvfei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcm50amphdGFxcHVlaWt2ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDQ0MDUsImV4cCI6MjA4MTkyMDQwNX0.Kj55Mrrf9Y8L8J5rbJVZudqUQJy_OAzFGDlV6dETb4A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearCoordinates() {
    console.log('Clearing appointment coordinates...');

    const { data, error } = await supabase
        .from('appointments')
        .update({
            latitude: null,
            longitude: null,
            geocoded_at: null
        })
        .not('latitude', 'is', null)
        .select();

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log(`✅ Cleared coordinates for ${data?.length || 0} appointments`);
    console.log('Now refresh your browser and click "Show Map" to see Google Maps geocoding in action!');
}

clearCoordinates();
