/**
 * ============================================================================
 * Annadaan — Supabase Client & Unified Production Authentication Architecture
 * Features:
 * - 6-Hour Absolute Session Lifetime Enforcement
 * - Safe Local Session SignOut (scope: 'local')
 * - Realtime Postgres Changes Management
 * - Google OAuth Callback Handling
 * - Flash Error / Expiry Notification System
 * ============================================================================
 */

(function () {
  'use strict';

  const SUPABASE_URL = "https://ldnvxkvpylygnlnwdepm.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_cs9jlEwA1lFeGV4_kSITyA_R_DA70tQ";
  const MAX_SESSION_LIFETIME_MS = 6 * 60 * 60 * 1000; // 6 Hours in milliseconds

  // Initialize Supabase Client
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log("✅ Annadaan: Supabase connected to", SUPABASE_URL);
    } catch (e) {
      console.error("❌ Annadaan: Supabase client initialization failed:", e);
      window.sb = null;
    }
  } else {
    console.warn("⚠️ Annadaan: Supabase JS library not loaded prior to supabase-client.js");
  }

  // Unified Authentication & Session Manager
  window.AnnadaanAuth = {
    MAX_SESSION_MS: MAX_SESSION_LIFETIME_MS,

    /**
     * Mark session start timestamp when a user signs in
     */
    startSession: function (userData, role) {
      const now = Date.now();
      localStorage.setItem('annadaan_session_start', now.toString());
      
      const sessionUser = {
        ...userData,
        type: role,
        session_created_at: now
      };

      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      if (role === 'donor') {
        localStorage.setItem('donor', JSON.stringify(sessionUser));
      }
      return sessionUser;
    },

    /**
     * Check if the current session has exceeded the 6-hour limit
     */
    isSessionExpired: function () {
      const startTime = localStorage.getItem('annadaan_session_start');
      if (!startTime) return true;
      const elapsed = Date.now() - parseInt(startTime, 10);
      return elapsed > MAX_SESSION_LIFETIME_MS;
    },

    /**
     * Get remaining session time in human readable format
     */
    getRemainingTimeMinutes: function () {
      const startTime = localStorage.getItem('annadaan_session_start');
      if (!startTime) return 0;
      const elapsed = Date.now() - parseInt(startTime, 10);
      const remainingMs = Math.max(0, MAX_SESSION_LIFETIME_MS - elapsed);
      return Math.floor(remainingMs / (60 * 1000));
    },

    /**
     * Validate current session with Supabase and enforce 6-hour max lifetime.
     * Returns a Promise resolving to the validated user, or null if expired/invalid.
     */
    validateSession: async function (requiredRole = null) {
      // 1. Check client-side 6-hour absolute boundary
      if (this.isSessionExpired()) {
        const hadUser = localStorage.getItem('currentUser') || localStorage.getItem('donor');
        if (hadUser) {
          console.warn("⏱️ Annadaan: Session exceeded 6-hour maximum lifetime.");
          await this.signOut(true, "Your session has expired. Please sign in again.");
        }
        return null;
      }

      // 2. Check Supabase server-side session
      if (window.sb && window.sb.auth) {
        try {
          const { data: { session }, error } = await window.sb.auth.getSession();
          if (error) {
            console.error("Supabase getSession error:", error);
          }

          if (session && session.user) {
            // Restore user identity from metadata
            let user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
              const u = session.user;
              const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User';
              const phone = u.phone || u.user_metadata?.phone || ('G-' + u.id.replace(/-/g, '').slice(0, 10));
              const role = requiredRole || u.user_metadata?.role || 'donor';
              user = this.startSession({ id: u.id, name, phone, email: u.email }, role);
            }

            if (requiredRole && user.type && user.type !== requiredRole) {
              console.warn(`Role mismatch: Expected ${requiredRole}, got ${user.type}`);
              return null;
            }

            return user;
          }
        } catch (e) {
          console.warn("Session check exception:", e);
        }
      }

      // 3. Fallback to localStorage session if within 6 hours
      const localUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('donor'));
      if (localUser) {
        if (requiredRole && localUser.type && localUser.type !== requiredRole) {
          return null;
        }
        return localUser;
      }

      return null;
    },

    /**
     * Route Protection Guard
     */
    protectRoute: async function (requiredRole, loginUrl = 'login.html') {
      const user = await this.validateSession(requiredRole);
      if (!user) {
        window.location.href = loginUrl;
        return null;
      }
      return user;
    },

    /**
     * Global Local Logout
     * Signs out this browser session using scope: 'local' so other devices remain active.
     */
    signOut: async function (isExpired = false, customMsg = null) {
      try {
        if (window.sb && window.sb.auth) {
          await window.sb.auth.signOut({ scope: 'local' });
        }
      } catch (e) {
        console.warn("Supabase local signOut error:", e);
      }

      // Clear all authenticated cached state
      localStorage.removeItem('currentUser');
      localStorage.removeItem('donor');
      localStorage.removeItem('annadaan_session_start');
      sessionStorage.removeItem('temp_donor');

      // Set flash message for login screen
      const msg = customMsg || (isExpired ? "Your session has expired. Please sign in again." : "You have been safely signed out.");
      sessionStorage.setItem('auth_flash_message', msg);

      // Determine redirect path
      const path = window.location.pathname.toLowerCase();
      if (path.includes('donor')) {
        window.location.href = 'login.html';
      } else if (path.includes('volunteer')) {
        window.location.href = 'ngo-volunteer-auth.html';
      } else {
        window.location.href = 'index.html';
      }
    },

    /**
     * Check and display any pending flash message on login screens
     */
    checkFlashMessage: function () {
      const msg = sessionStorage.getItem('auth_flash_message');
      if (msg) {
        sessionStorage.removeItem('auth_flash_message');
        const alertBox = document.createElement('div');
        alertBox.className = 'auth-flash-alert';
        alertBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-info-circle" style="color: #2D6A4F; font-size: 16px;"></i>
            <span>${msg}</span>
          </div>
          <button onclick="this.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:16px; color:#6b7280;">&times;</button>
        `;
        const card = document.querySelector('.login-card') || document.querySelector('.card') || document.body;
        if (card.firstChild) {
          card.insertBefore(alertBox, card.firstChild);
        } else {
          card.appendChild(alertBox);
        }
      }
    }
  };

  // Run flash message check on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AnnadaanAuth.checkFlashMessage());
  } else {
    window.AnnadaanAuth.checkFlashMessage();
  }
})();
