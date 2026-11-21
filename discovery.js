/**
 * ============================================================================
 * Annadaan - Intelligent Contextual Onboarding & Feature Discovery System
 * Reference: https://driverjs.com/docs/animated-tour
 * ============================================================================
 */

(function () {
  'use strict';

  // Driver.js CDN URLs
  const DRIVER_CSS_URL = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
  const DRIVER_JS_URL = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';

  // State Persistence Key
  function getStorageKey() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('donor'));
      const id = (user && (user.phone || user.id || user.email)) || 'guest';
      return `annadaan_discovery_${id}`;
    } catch (e) {
      return 'annadaan_discovery_guest';
    }
  }

  function getUserDiscoveryState() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey())) || { dismissed: [], completed: [] };
    } catch (e) {
      return { dismissed: [], completed: [] };
    }
  }

  function saveUserDiscoveryState(state) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (e) {
      console.warn('Discovery state save warning:', e);
    }
  }

  function isPageDismissedOrCompleted(pageKey) {
    const state = getUserDiscoveryState();
    return state.dismissed.includes(pageKey) || state.completed.includes(pageKey);
  }

  function markPageCompleted(pageKey) {
    const state = getUserDiscoveryState();
    if (!state.completed.includes(pageKey)) state.completed.push(pageKey);
    saveUserDiscoveryState(state);
  }

  function markPageDismissed(pageKey) {
    const state = getUserDiscoveryState();
    if (!state.dismissed.includes(pageKey)) state.dismissed.push(pageKey);
    saveUserDiscoveryState(state);
  }

  // Identify Current Page
  function getPageKey() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('donor-home')) return 'donor_home';
    if (path.includes('add-food')) return 'donor_add_food';
    if (path.includes('ngo-dashboard')) return 'ngo_dashboard';
    if (path.includes('view-food')) return 'view_food';
    if (path.includes('volunteer-dashboard')) return 'volunteer_dashboard';
    if (path.includes('my-volunteering')) return 'volunteer_my_deliveries';
    if (path.includes('my-requests')) return 'ngo_my_requests';
    if (path.includes('delivery-feedback')) return 'delivery_feedback';
    return null;
  }

  // Curated Feature Discovery Configurations
  // IMPORTANT: Highlights ONLY non-obvious, hidden, or critical operational features
  const TOURS = {
    donor_home: {
      title: 'Donor Command Center',
      steps: [
        {
          element: '#fab',
          popover: {
            title: '🚀 Post Surplus in 60 Seconds',
            description: 'This floating button is your instant action trigger. Tap it anytime to post surplus meals right after an event or commercial meal service.',
            side: 'left',
            align: 'end'
          }
        },
        {
          element: '#homeTabs',
          popover: {
            title: '⏱️ Active vs. Delivered Batches',
            description: 'Switch between live listings currently being claimed by local shelters and your archived proof-of-delivery receipts.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#listingsActive',
          popover: {
            title: '🤝 Two-Way Approval Gate',
            description: 'When an NGO requests your food, you will see an "Accept" button here. You must approve the request before the courier or NGO is cleared for pickup.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    },

    donor_add_food: {
      title: 'Food Listing Safety & Geocoding',
      steps: [
        {
          element: '#validHours',
          popover: {
            title: '⌛ The Safe Freshness Clock',
            description: 'Crucial food safety control! Specify how long cooked food remains safe to consume. Once this window elapses, listings are prioritized or archived to prevent spoilage.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: "button[title='Pin on Map']",
          popover: {
            title: '📍 Pin Exact Kitchen Entrance',
            description: 'Hidden gem: Don\'t just type a street name. Click this map pin to drag a marker to your exact loading dock or gate for courier GPS navigation.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#donorType',
          popover: {
            title: '🏷️ Occasion & Event Categorization',
            description: 'Selecting "Others" unlocks custom event tags (e.g., wedding banquet, corporate lunch), helping shelters estimate food packaging style.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    },

    ngo_dashboard: {
      title: 'NGO Dispatch & Verification Hub',
      steps: [
        {
          element: '.dashboard-card:nth-child(1)',
          popover: {
            title: '🍲 Live Food Marketplace',
            description: 'Browse incoming surplus food filtered by live distance, check freshness timers, and claim portions for your community kitchen.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#feedbackPrompt',
          fallbackElement: '.dashboard-card:nth-child(4)',
          popover: {
            title: '📊 Delivery Verification Protocol',
            description: 'Critical step! Whenever food is distributed, confirm the number of people fed and drop-site GPS coordinates here. This keeps the community audit trail transparent.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.dashboard-card:nth-child(2)',
          popover: {
            title: '📦 Real-Time Request Tracking',
            description: 'Monitor your claim statuses from "Waiting for Donor Approval" to "Volunteer Dispatched" in real time.',
            side: 'bottom',
            align: 'start'
          }
        }
      ]
    },

    view_food: {
      title: 'Food Salvage Marketplace',
      steps: [
        {
          element: '#detect-btn',
          popover: {
            title: '🛰️ Real-Time Haversine Geolocation',
            description: 'Tap "Detect" to calculate exact travel distances from your facility to each donor using OpenStreetMap reverse geocoding.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#sort-filter',
          popover: {
            title: '⚡ Emergency "Expiring Soon" Sort',
            description: 'High-priority feature for food rescue: sort by time remaining to claim fresh meals right before their safe consumption deadline expires.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#distance-filter',
          popover: {
            title: '🚗 45-Minute Transit Radius',
            description: 'Filter food within 5 km to 10 km to ensure hot meals reach beneficiaries quickly without cooling down.',
            side: 'bottom',
            align: 'start'
          }
        }
      ]
    },

    volunteer_dashboard: {
      title: 'Volunteer Logistics Console',
      steps: [
        {
          element: '#recommendationsCard',
          popover: {
            title: '🗺️ High-Need Drop-off Hotspots',
            description: 'Intelligent spatial feature: Analyzes recent verified deliveries to recommend exact neighborhoods and clusters with the highest community need today.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#greenCreditsCard',
          popover: {
            title: '🌿 Green Sustainability Credits',
            description: 'Every completed meal distribution awards you Green Credits, redeemable for volunteer impact badges and sustainability partner rewards.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.dashboard-card:nth-child(2)',
          popover: {
            title: '📋 Logistics Progression',
            description: 'Manage active deliveries. You update status to "Picked Up" at the kitchen, and "Delivered" once meals reach people in need.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    },

    volunteer_my_deliveries: {
      title: 'Active Deliveries Protocol',
      steps: [
        {
          element: '.tabs',
          popover: {
            title: '📦 Active Transit vs. History',
            description: 'Switch between current assignments requiring pickup/delivery and completed distribution logs with verified people served.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#content-area',
          popover: {
            title: '🚚 Two-Stage Handover Confirmation',
            description: 'Always click "Confirm Food Picked Up" upon receiving containers from the donor, and "Confirm Delivery to Needy" after distributing to beneficiaries.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    },

    ngo_my_requests: {
      title: 'NGO Food Request Life Cycle',
      steps: [
        {
          element: '#requests-container',
          popover: {
            title: '⏳ Live Request State Machine',
            description: 'Status moves from "NGO Requested" (waiting for donor approval) to "Accepted" (pickup unlocked), then "Picked Up" and "Delivered".',
            side: 'top',
            align: 'center'
          }
        }
      ]
    }
  };

  // Helper to dynamically inject Driver.js assets if not already on page
  function ensureDriverAssets(callback) {
    if (window.driver && window.driver.js && window.driver.js.driver) {
      return callback();
    }

    if (!document.getElementById('driver-css')) {
      const link = document.createElement('link');
      link.id = 'driver-css';
      link.rel = 'stylesheet';
      link.href = DRIVER_CSS_URL;
      document.head.appendChild(link);
    }

    if (!document.getElementById('driver-js')) {
      const script = document.createElement('script');
      script.id = 'driver-js';
      script.src = DRIVER_JS_URL;
      script.onload = () => callback();
      script.onerror = () => {
        console.warn('Driver.js CDN failed to load; using native spotlight fallback.');
        callback(new Error('Driver.js load failed'));
      };
      document.head.appendChild(script);
    } else {
      // Script tag exists, wait for load
      const checkInterval = setInterval(() => {
        if (window.driver && window.driver.js) {
          clearInterval(checkInterval);
          callback();
        }
      }, 50);
    }
  }

  // Filter Steps to only elements currently existing & visible in DOM
  function sanitizeSteps(tourConfig) {
    return tourConfig.steps
      .map((step) => {
        let el = document.querySelector(step.element);
        if (!el && step.fallbackElement) {
          el = document.querySelector(step.fallbackElement);
        }
        if (el && el.offsetParent !== null) {
          return {
            element: el,
            popover: {
              ...step.popover,
              popoverClass: 'annadaan-popover'
            }
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Launch Tour via Driver.js
  function launchTour(pageKey, isExplicit = false) {
    const tourConfig = TOURS[pageKey];
    if (!tourConfig) return;

    ensureDriverAssets((err) => {
      const validSteps = sanitizeSteps(tourConfig);
      if (validSteps.length === 0) {
        if (isExplicit && window.showAlert) {
          window.showAlert('No interactive feature guides available on this view.', 'info');
        }
        return;
      }

      if (window.driver && window.driver.js && window.driver.js.driver) {
        const driverObj = window.driver.js.driver({
          showProgress: true,
          animate: true,
          allowClose: true,
          overlayOpacity: 0.65,
          stagePadding: 8,
          stageRadius: 12,
          popoverClass: 'annadaan-popover',
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Finish ✓',
          steps: validSteps,
          onDestroyed: () => {
            markPageCompleted(pageKey);
          }
        });

        driverObj.drive();
      } else {
        // Fallback simple spotlight if offline
        runNativeFallbackTour(validSteps, pageKey);
      }
    });
  }

  // Graceful Native Fallback if CDN is offline
  function runNativeFallbackTour(steps, pageKey) {
    let currentIdx = 0;

    function showStep(idx) {
      if (idx >= steps.length) {
        markPageCompleted(pageKey);
        cleanup();
        return;
      }

      const step = steps[idx];
      step.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      step.element.style.outline = '3px solid #2D6A4F';
      step.element.style.boxShadow = '0 0 20px rgba(45, 106, 79, 0.5)';

      const confirmMsg = `${step.popover.title}\n\n${step.popover.description}\n\n(Step ${idx + 1} of ${steps.length})`;
      setTimeout(() => {
        if (confirm(confirmMsg + '\n\nClick OK for next feature, or Cancel to finish.')) {
          step.element.style.outline = '';
          step.element.style.boxShadow = '';
          showStep(idx + 1);
        } else {
          step.element.style.outline = '';
          step.element.style.boxShadow = '';
          cleanup();
        }
      }, 300);
    }

    function cleanup() {
      steps.forEach((s) => {
        if (s.element) {
          s.element.style.outline = '';
          s.element.style.boxShadow = '';
        }
      });
    }

    showStep(0);
  }

  // Inject Floating Help Beacon Trigger ("? Feature Guide")
  function injectFloatingGuideButton(pageKey) {
    if (document.getElementById('annadaan-guide-fab-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'annadaan-guide-fab-btn';
    btn.className = 'annadaan-guide-fab animate-fade-in';
    btn.setAttribute('aria-label', 'Open Feature Discovery Guide');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
      </svg>
      <span>Feature Guide</span>
      <span class="fab-badge"></span>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      launchTour(pageKey, true);
    });

    document.body.appendChild(btn);
  }

  // Inject Non-Intrusive First-Time Slide-in Beacon
  function injectFirstTimeBanner(pageKey) {
    if (isPageDismissedOrCompleted(pageKey)) return;
    if (document.getElementById('annadaan-discovery-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'annadaan-discovery-banner';
    banner.className = 'annadaan-discovery-banner';
    banner.innerHTML = `
      <div class="banner-icon">✨</div>
      <div class="banner-content">
        <div class="banner-title">Feature Discovery</div>
        <div class="banner-sub">Take a 20-second tour of non-obvious tools on this page.</div>
        <div class="banner-actions">
          <button class="btn-banner-start" id="btnBannerStartTour">Start Tour</button>
          <button class="btn-banner-dismiss" id="btnBannerDismissTour">Don't show again</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('btnBannerStartTour').addEventListener('click', () => {
      banner.remove();
      launchTour(pageKey, true);
    });

    document.getElementById('btnBannerDismissTour').addEventListener('click', () => {
      markPageDismissed(pageKey);
      banner.remove();
    });
  }

  // Auto-Initialization on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    const pageKey = getPageKey();
    if (!pageKey || !TOURS[pageKey]) return;

    // Inject permanent floating trigger so users are always in control
    injectFloatingGuideButton(pageKey);

    // Offer subtle, non-intrusive prompt after 1.8 seconds on first visit
    setTimeout(() => {
      injectFirstTimeBanner(pageKey);
    }, 1800);
  });

  // Global API exposed for manual re-triggering from navigation menus or settings
  window.AnnadaanDiscovery = {
    startTour: () => {
      const pageKey = getPageKey();
      if (pageKey) launchTour(pageKey, true);
    },
    resetState: () => {
      localStorage.removeItem(getStorageKey());
      if (window.showAlert) window.showAlert('Feature discovery reset. You will see guides again.', 'success');
    }
  };
})();
