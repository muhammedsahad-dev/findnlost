const { createClient } = require('@supabase/supabase-js');

const url = 'https://dsljrhhfwueqabeooaen.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpyaGhmd3VlcWFiZW9vYWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMwMDAzOSwiZXhwIjoyMDk3ODc2MDM5fQ.3ZRL6P1JPEHlgypJPGxTZDrk5mi6qUzr3tNqNQFqzvo';

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  console.log("Users fetched:", users ? users.length : 0);
  if (users && users.length > 0) {
    console.log("First user sample:", {
      id: users[0].id,
      email: users[0].email,
      role: users[0].role
    });
  } else {
    console.log("Error or no users:", error);
  }
}

check();
