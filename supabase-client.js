// 1. Supabase CDN - Include this in all HTML files:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 2. Client Initialization
const SUPABASE_URL = "https://ldnvxkvpylygnlnwdepm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cs9jlEwA1lFeGV4_kSITyA_R_DA70tQ";

if (SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("⚠️ Annadaan: Supabase keys are missing in supabase-client.js. Backend features will not work.");
    window.sb = {
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }), order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: { message: "Supabase not configured" } }) })
        }),
        auth: {
            signInWithOAuth: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
            signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
            signUp: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
            signOut: () => Promise.resolve({ error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null })
        }
    };
} else {
    try {
        const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        window.sb = sb;
        console.log("✅ Annadaan: Supabase client connected to", SUPABASE_URL);
    } catch (e) {
        console.error("❌ Annadaan: Failed to initialize Supabase client:", e);
        window.sb = null;
    }
}
