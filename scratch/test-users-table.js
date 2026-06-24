const { createClient } = require('@supabase/supabase-js');

const url = 'https://dsljrhhfwueqabeooaen.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpyaGhmd3VlcWFiZW9vYWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMwMDAzOSwiZXhwIjoyMDk3ODc2MDM5fQ.3ZRL6P1JPEHlgypJPGxTZDrk5mi6qUzr3tNqNQFqzvo';

const supabase = createClient(url, key);

async function check() {
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(5);
  console.log("Query users result:", { users, usersError });
  
  const { data: items, error: itemsError } = await supabase.from('items').select('*').limit(1);
  console.log("Query items result:", { items, itemsError });
}

check();
