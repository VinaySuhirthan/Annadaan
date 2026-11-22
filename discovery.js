/**
 * ============================================================================
 * Annadaan - Intelligent Contextual Guided Walkthrough & Feature Discovery
 * Automatically guides new users through high-impact, non-obvious features.
 * Reference: https://driverjs.com/docs/animated-tour
 * ============================================================================
 */

(function () {
  'use strict';

  // Driver.js CDN URLs
  const DRIVER_CSS_URL = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
  const DRIVER_JS_URL = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';

  // State Persistence Key per Authenticated User
  function getStorageKey() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('donor'));
      const id = (user && (user.phone || user.id || user.email)) || 'guest';
      return `annadaan_walkthrough_${id}`;
    } catch (e) {
      return 'annadaan_walkthrough_guest';
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
      console.warn('Walkthrough state save warning:', e);
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

  // Identify Current Page / Role
  function getPageKey() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('donor-home')) return 'donor_home';
    if (path.includes('add-food')) return 'donor_add_food';
    if (path.includes('volunteer-dashboard') || path.includes('ngo-dashboard')) return 'volunteer_dashboard';
    if (path.includes('view-food')) return 'view_food';
    if (path.includes('my-volunteering') || path.includes('my-requests')) return 'volunteer_my_deliveries';
    if (path.includes('dummy') || path.includes('rewards')) return 'rewards_store';
    return null;
  }

  // Curated Walkthrough Configurations (Explains only hidden or critical operational workflows)
  const TOURS = {
    donor_home: {
      title: 'Donor Command Center',
      steps: [
        {
          element: '#statsGrid',
          popover: {
            title: 'Real-Time Community Impact',
            description: 'These 4 metrics calculate live meals nourished and verified shelter drop-offs from real delivery confirmations.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#donorTabs',
          popover: {
            title: 'Two-Way Shelter Approval Gate',
            description: 'When a local NGO requests your surplus food, an "Accept Request" action appears here. You authorize the pickup before volunteer couriers are dispatched.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#btnListSurplus',
          fallbackElement: '#btnTopDonate',
          popover: {
            title: 'Post Surplus Listings',
            description: 'List food immediately after banquets or meal services with photo verification and exact kitchen entrance GPS coordinates.',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '#navProfile',
          fallbackElement: '#topAvatar',
          popover: {
            title: 'Verified Contributor Profile',
            description: 'Access your verified donor reference ID, contact details, and lifetime social audit history anytime.',
            side: 'bottom',
            align: 'end'
          }
        }
      ]
    },

    donor_add_food: {
      title: 'Food Safety & Entrance Geocoding',
      steps: [
        {
          element: '#validHours',
          popover: {
            title: 'Freshness Safety Window',
            description: 'Crucial food safety control: specify how long cooked food remains safe to consume. Once this window nears expiry, notifications escalate.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: "button[title='Pin on Map']",
          fallbackElement: '#map-btn',
          popover: {
            title: 'Kitchen Entrance Geolocation',
            description: 'Drag the pin to your exact loading dock or gate so volunteer couriers find your pickup point without phone tag.',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    },

    volunteer_dashboard: {
      title: 'Volunteer Dispatch Center',
      steps: [
        {
          element: '#welcomeGreeting',
          fallbackElement: '.page-intro',
          popover: {
            title: 'Welcome to Annadaan Volunteer Portal',
            description: 'Volunteers and community partners help collect and deliver surplus food from donors to local shelters, preventing waste and feeding those in need.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#statsGrid',
          popover: {
            title: 'Your Live Statistics & Impact',
            description: 'Track your total food batch distributions, people served, community reliability rating, and green credits earned from verified deliveries.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#cardViewFood',
          fallbackElement: '.volunteer-action-card:nth-child(1)',
          popover: {
            title: 'View Available Food',
            description: 'Browse fresh surplus food listings ready for pickup. Filter by dietary preference and claim meals within your delivery radius.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#cardMyVolunteering',
          fallbackElement: '.volunteer-action-card:nth-child(2)',
          popover: {
            title: 'My Volunteering & Deliveries',
            description: 'Track your assigned pickup runs, donor contact numbers, delivery navigation, and review your completed distribution history.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#cardRewards',
          fallbackElement: '.volunteer-action-card:nth-child(5)',
          popover: {
            title: 'Achievements & Rewards Store',
            description: 'Track your volunteering milestones and redeem earned green credits for public transit subsidies like Metro Day Passes and MTC bus tickets.',
            side: 'top',
            align: 'end'
          }
        },
        {
          element: '#topAvatar',
          fallbackElement: '.app-topbar',
          popover: {
            title: "You're Ready to Make a Difference!",
            description: "Every delivery counts! You can restart this walkthrough anytime using the Guide button in the header. Have a great run!",
            side: 'bottom',
            align: 'end'
          }
        }
      ]
    },

    view_food: {
      title: 'Available Food Discovery',
      steps: [
        {
          element: '#locBar',
          popover: {
            title: 'Live Location Detection',
            description: 'Detect your GPS location or choose your neighborhood to calculate exact road distance to nearby surplus food listings.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.filter-bar',
          popover: {
            title: 'Dietary & Distance Filters',
            description: 'Quickly filter by Vegetarian or Non-Veg, specify your travel radius (5km to 50km), and sort by closest or newest listings.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#food-container',
          popover: {
            title: 'Food Donation Cards',
            description: 'Review food photos, serves capacity, and freshness window. Tap "Request Food" to claim or "Assist Drop" to coordinate pickup.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    },

    volunteer_my_deliveries: {
      title: 'My Deliveries & Requests',
      steps: [
        {
          element: '#volunteerTabs',
          popover: {
            title: 'Task Pipeline Tabs',
            description: 'Switch between Current Tasks in progress and your permanent Delivery History of verified meal distributions.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#content-area',
          popover: {
            title: 'Pickup Tracking & Contact',
            description: 'Access donor contact numbers, view kitchen address on maps, and update transit status directly from each task card.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    },

    rewards_store: {
      title: 'Green Rewards Store',
      steps: [
        {
          element: '.rewards-balance-card',
          popover: {
            title: 'Your Green Credits Balance',
            description: 'Earn 50+ credits for each verified food distribution. Use them to unlock real eco-friendly public transit day passes.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.rewards-catalog-grid',
          popover: {
            title: 'Transit Subsidies & Vouchers',
            description: 'Select a Metro Day Pass or MTC Bus Ticket to redeem instant digital voucher tokens for your volunteer travel.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    }
  };

  // Asynchronous Asset Loader
  let driverLoadPromise = null;
  function loadDriverAssets() {
    if (driverLoadPromise) return driverLoadPromise;

    driverLoadPromise = new Promise((resolve) => {
      if (window.driver && window.driver.js && window.driver.js.driver) {
        return resolve(true);
      }

      if (!document.querySelector(`link[href="${DRIVER_CSS_URL}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = DRIVER_CSS_URL;
        document.head.appendChild(link);
      }

      if (!document.querySelector(`script[src="${DRIVER_JS_URL}"]`)) {
        const script = document.createElement('script');
        script.src = DRIVER_JS_URL;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      } else {
        resolve(true);
      }
    });

    return driverLoadPromise;
  }

  // Launch Guided Walkthrough
  function launchTour(pageKey, isManualTrigger = false) {
    const config = TOURS[pageKey];
    if (!config) return;

    loadDriverAssets().then((loaded) => {
      const validSteps = [];
      config.steps.forEach((step) => {
        let el = document.querySelector(step.element);
        if (!el && step.fallbackElement) {
          el = document.querySelector(step.fallbackElement);
        }
        if (el && el.offsetParent !== null) {
          validSteps.push({
            element: el,
            popover: {
              title: step.popover.title,
              description: `
                <div>${step.popover.description}</div>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: flex-end;">
                  <button class="annadaan-dont-show-btn" style="background: none; border: none; color: #6b7280; font-size: 11px; cursor: pointer; text-decoration: underline;" onclick="window.AnnadaanGuide.dismissPage('${pageKey}')">Don't show again</button>
                </div>
              `,
              side: step.popover.side || 'bottom',
              align: step.popover.align || 'start'
            }
          });
        }
      });

      if (validSteps.length === 0) return;

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
          doneBtnText: 'Finish',
          steps: validSteps,
          onDestroyed: () => {
            markPageCompleted(pageKey);
          }
        });

        driverObj.drive();
      }
    });
  }

  // Automatic Launch on First Eligible Visit or Explicit ?tour=1 Param
  function checkAndAutoLaunch() {
    const pageKey = getPageKey();
    if (!pageKey || !TOURS[pageKey]) return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.has('tour') || urlParams.has('guide');

    if (forceTour || !isPageDismissedOrCompleted(pageKey)) {
      // Delay slightly so layout and Supabase stats have finished initial render
      setTimeout(() => {
        launchTour(pageKey, forceTour);
      }, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndAutoLaunch);
  } else {
    checkAndAutoLaunch();
  }

  // Public API
  window.AnnadaanGuide = {
    launchTour: (key, manual = true) => {
      const pageKey = key || getPageKey();
      if (pageKey) launchTour(pageKey, manual);
    },
    dismissPage: (key) => {
      const pageKey = key || getPageKey();
      if (pageKey) markPageDismissed(pageKey);
      if (window.driver && window.driver.js) {
        const activeDriver = document.querySelector('.driver-popover');
        if (activeDriver) {
          const closeBtn = activeDriver.querySelector('.driver-popover-close-btn');
          if (closeBtn) closeBtn.click();
        }
      }
    },
    resetState: () => {
      localStorage.removeItem(getStorageKey());
      alert('Walkthrough state reset. You will see guides again on your next visit.');
    }
  };

  window.AnnadaanDiscovery = {
    startTour: () => window.AnnadaanGuide.launchTour(null, true),
    resetState: () => window.AnnadaanGuide.resetState()
  };
})();
