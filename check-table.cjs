require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('Checking lost_items table structure...');
    
    // Try to get one record to see the structure
    const { data, error } = await supabase
      .from('lost_items')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying lost_items:', error);
    } else {
      if (data.length > 0) {
        console.log('Existing columns in lost_items table:');
        console.log(Object.keys(data[0]));
      } else {
        console.log('Table exists but no records found');
        // Try to insert a test record to see structure
        const { error: insertError } = await supabase
          .from('lost_items')
          .insert([{
            name: 'test',
            description: 'test description'
          }])
          .select();
        
        if (insertError) {
          console.error('Insert test failed:', insertError);
        }
      }
    }
    
    // Check if we can add missing columns
    console.log('\nChecking required columns for our API...');
    const testData = {
      item_name: 'Test Item',
      description: 'Test description',
      category: 'test',
      last_seen_location: 'Test location',
      last_seen_date: new Date().toISOString(),
      contact_info: 'test@example.com',
      urgency: 'medium',
      status: 'submitted'
    };
    
    const { error: testError } = await supabase
      .from('lost_items')
      .insert([testData])
      .select();
    
    if (testError) {
      console.error('Test insert with new structure failed:', testError);
      console.log('We need to update the table schema');
    } else {
      console.log('New structure works!');
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

checkTableStructure().then(() => process.exit(0));