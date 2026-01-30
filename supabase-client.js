// 1. Supabase CDN - Include this in all HTML files:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 2. Client Initialization
// Since this is a static frontend, we'll use a globally accessible client.
// Replace the placeholders with your actual Supabase URL and Anon Key.

const SUPABASE_URL = "https://nxhmxcupmnkvvtyxqvxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aG14Y3VwbW5rdnZ0eXhxdnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODU5NDYsImV4cCI6MjA4NTM2MTk0Nn0.Lj8eAEw5fleZ7eRr_TvX3YfnMotdLzn2LJaGbRsCNaA";

// Defensive initialization to prevent 'undefined' crashes
if (SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("⚠️ Annadaan: Supabase keys are missing in supabase-client.js. Backend features will not work.");
    window.sb = {
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }), order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: { message: "Supabase not configured" } }) })
        })
    };
} else {
    try {
        const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.sb = sb;
    } catch (e) {
        console.error("❌ Annadaan: Failed to initialize Supabase client:", e);
        window.sb = null;
    }
}
