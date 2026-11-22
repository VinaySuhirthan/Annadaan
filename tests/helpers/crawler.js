/**
 * Annadaan Automated Interaction & Feature Crawler
 * Discovers and inventories every interactive element, form, button, and navigation route across the codebase.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');

const PAGES = [
  { file: 'index.html', route: '/', role: 'public', name: 'Landing & Role Selection' },
  { file: 'food-status.html', route: '/food-status.html', role: 'public', name: 'Realtime Food Tracking' },
  { file: 'donor/login.html', route: '/donor/login.html', role: 'donor', name: 'Donor Authentication & Google OAuth' },
  { file: 'donor/donor-home.html', route: '/donor/donor-home.html', role: 'donor', name: 'Donor Dashboard & Two-Way Gate' },
  { file: 'donor/add-food.html', route: '/donor/add-food.html', role: 'donor', name: 'Food Surplus Posting & GPS Geocoding' },
  { file: 'volunteer/ngo-volunteer-auth.html', route: '/volunteer/ngo-volunteer-auth.html', role: 'ngo/volunteer', name: 'NGO & Volunteer Unified Auth' },
  { file: 'volunteer/volunteer-login.html', route: '/volunteer/volunteer-login.html', role: 'volunteer', name: 'Volunteer Dedicated Login' },
  { file: 'volunteer/ngo-dashboard.html', route: '/volunteer/ngo-dashboard.html', role: 'ngo', name: 'NGO Dispatch & Claim Hub' },
  { file: 'volunteer/view-food.html', route: '/volunteer/view-food.html', role: 'ngo/volunteer', name: 'Distance-Sorted Food Marketplace' },
  { file: 'volunteer/my-requests.html', route: '/volunteer/my-requests.html', role: 'ngo', name: 'NGO Claim Tracking & Status' },
  { file: 'volunteer/volunteer-dashboard.html', route: '/volunteer/volunteer-dashboard.html', role: 'volunteer', name: 'Volunteer Courier Dashboard' },
  { file: 'volunteer/my-volunteering.html', route: '/volunteer/my-volunteering.html', role: 'volunteer', name: 'Volunteer Active Runs' },
  { file: 'volunteer/pickup-schedule.html', route: '/volunteer/pickup-schedule.html', role: 'volunteer', name: 'Pickup Schedule' },
  { file: 'volunteer/delivery-feedback.html', route: '/volunteer/delivery-feedback.html', role: 'ngo', name: 'Shelter Proof of Delivery' },
  { file: 'volunteer/statistics.html', route: '/volunteer/statistics.html', role: 'volunteer', name: 'Community Impact Statistics' }
];

function classifyElement(tag, attrs, text) {
  const onclick = attrs.onclick || '';
  const href = attrs.href || '';
  const type = attrs.type || '';

  if (onclick.includes('signOut') || onclick.includes('logout') || onclick.includes('Login') || onclick.includes('verifyOtp') || onclick.includes('sendOtp')) {
    return 'Authentication action';
  }
  if (onclick.includes('delete') || onclick.includes('reject') || onclick.includes('remove') || onclick.includes('Cancel')) {
    return 'Destructive action';
  }
  if (onclick.includes('accept') || onclick.includes('confirm') || onclick.includes('submit') || onclick.includes('insert') || onclick.includes('save') || type === 'submit') {
    return 'Database mutation';
  }
  if (tag === 'form') {
    return 'Form submission';
  }
  if (tag === 'a' && href.startsWith('http')) {
    return 'External link';
  }
  if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
    return 'Navigation';
  }
  if (onclick.includes('show') || onclick.includes('toggle') || onclick.includes('tab') || onclick.includes('modal') || onclick.includes('filter')) {
    return 'Interactive / Read-only UI';
  }
  if (href === '#' && !onclick) {
    return 'Defect: Broken Anchor without Handler';
  }
  return 'Interactive element';
}

function crawlApplication() {
  const inventory = [];
  const featureRegistry = [];

  for (const p of PAGES) {
    const fullPath = path.join(ROOT_DIR, p.file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');

    // 1. Identify Buttons
    const buttonMatches = content.matchAll(/<button([^>]*)>(.*?)<\/button>/gis);
    for (const b of buttonMatches) {
      const rawAttrs = b[1];
      const text = b[2].replace(/<[^>]*>/g, '').trim();
      const id = (rawAttrs.match(/id=["']([^"']*)["']/) || [])[1] || '';
      const onclick = (rawAttrs.match(/onclick=["']([^"']*)["']/) || [])[1] || '';
      const cls = (rawAttrs.match(/class=["']([^"']*)["']/) || [])[1] || '';

      const classification = classifyElement('button', { onclick, id, class: cls }, text);
      const isDefect = !onclick && !cls.includes('driver') && !rawAttrs.includes('type="submit"');

      inventory.push({
        page: p.file,
        role: p.role,
        type: 'button',
        id: id || '(anonymous button)',
        label: text || id || 'Button',
        action: onclick || '(form submit)',
        classification,
        status: isDefect ? 'DEFECT: Missing Action' : 'FUNCTIONAL'
      });
    }

    // 2. Identify Links
    const linkMatches = content.matchAll(/<a([^>]*)>(.*?)<\/a>/gis);
    for (const a of linkMatches) {
      const rawAttrs = a[1];
      const text = a[2].replace(/<[^>]*>/g, '').trim();
      const id = (rawAttrs.match(/id=["']([^"']*)["']/) || [])[1] || '';
      const href = (rawAttrs.match(/href=["']([^"']*)["']/) || [])[1] || '';
      const onclick = (rawAttrs.match(/onclick=["']([^"']*)["']/) || [])[1] || '';

      const classification = classifyElement('a', { href, onclick, id }, text);
      const isBroken = href === '#' && !onclick;

      inventory.push({
        page: p.file,
        role: p.role,
        type: 'link',
        id: id || '(anonymous link)',
        label: text || href || 'Link',
        action: onclick || href,
        classification,
        status: isBroken ? 'DEFECT: Broken Anchor' : 'FUNCTIONAL'
      });
    }

    // 3. Identify Forms & Form Inputs
    const formMatches = content.matchAll(/<form([^>]*)>/gis);
    for (const f of formMatches) {
      const rawAttrs = f[1];
      const id = (rawAttrs.match(/id=["']([^"']*)["']/) || [])[1] || '(main form)';
      inventory.push({
        page: p.file,
        role: p.role,
        type: 'form',
        id,
        label: `Form ${id}`,
        action: 'Form Submit Event',
        classification: 'Form submission',
        status: 'FUNCTIONAL'
      });
    }

    // 4. Register Features per Page
    featureRegistry.push({
      page: p.file,
      feature: p.name,
      userRole: p.role,
      expectedBehavior: `Accessible to ${p.role}, mounts fluid background, enforces session security where applicable.`,
      testStatus: 'IMPLEMENTED'
    });
  }

  const reportsDir = path.resolve(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(path.join(reportsDir, 'interaction-inventory.json'), JSON.stringify(inventory, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'feature-registry.json'), JSON.stringify(featureRegistry, null, 2));

  return { inventory, featureRegistry };
}

if (require.main === module) {
  const { inventory, featureRegistry } = crawlApplication();
  console.log(`✅ Discovered ${featureRegistry.length} Page Features`);
  console.log(`✅ Indexed ${inventory.length} Interactive Elements (Buttons, Links, Forms)`);
}

module.exports = { crawlApplication, PAGES };
