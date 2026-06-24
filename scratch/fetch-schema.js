const url = 'https://dsljrhhfwueqabeooaen.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpyaGhmd3VlcWFiZW9vYWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMwMDAzOSwiZXhwIjoyMDk3ODc2MDM5fQ.3ZRL6P1JPEHlgypJPGxTZDrk5mi6qUzr3tNqNQFqzvo';

fetch(url, {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Paths found:", Object.keys(data.paths));
  console.log("\nDefinitions:");
  if (data.definitions) {
    Object.keys(data.definitions).forEach(def => {
      console.log(`- ${def}`);
      console.log("  Properties:", Object.keys(data.definitions[def].properties));
    });
  }
})
.catch(err => console.error(err));
