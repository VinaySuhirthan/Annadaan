/**
 * Annadaan — Immersive Fluid Motion Background Controller
 * Manages life-cycle, GPU acceleration, visibility-pause, and DOM mounting.
 */

(function () {
  'use strict';

  function initFluidBackground() {
    // Prevent double initialization
    if (document.getElementById('fluid-motion-bg')) return;

    // Detect role/page type for optimal ambient vs immersive mode
    const path = window.location.pathname.toLowerCase();
    const isDashboard = path.includes('dashboard') || path.includes('donor-home') || path.includes('food') || path.includes('pickup') || path.includes('statistics') || path.includes('my-requests') || path.includes('my-volunteering');
    const modeClass = isDashboard ? 'fluid-bg-ambient' : 'fluid-bg-immersive';

    const container = document.createElement('div');
    container.id = 'fluid-motion-bg';
    container.className = `fluid-motion-viewport ${modeClass}`;
    container.setAttribute('aria-hidden', 'true');

    container.innerHTML = `
      <!-- Layer 1: Slowly shifting pastel gradient mesh -->
      <div class="fluid-layer-mesh"></div>

      <!-- Layer 2: Large organic morphing fluid blobs -->
      <div class="fluid-layer-blobs">
        <div class="morph-blob morph-blob-1"></div>
        <div class="morph-blob morph-blob-2"></div>
        <div class="morph-blob morph-blob-3"></div>
        <div class="morph-blob morph-blob-4"></div>
      </div>

      <!-- Layer 3 & 4: Large and medium floating translucent 3D glass bubbles -->
      <div class="fluid-layer-bubbles">
        <div class="glass-sphere sphere-huge-1"></div>
        <div class="glass-sphere sphere-huge-2"></div>
        <div class="glass-sphere sphere-medium-1"></div>
        <div class="glass-sphere sphere-medium-2"></div>
        <div class="glass-sphere sphere-small-1"></div>
        <div class="glass-sphere sphere-small-2"></div>
        <div class="glass-sphere sphere-tiny-1"></div>
        <div class="glass-sphere sphere-tiny-2"></div>
      </div>

      <!-- Layer 5: Thin geometric line art, concentric rings, triangles -->
      <div class="fluid-layer-geometry">
        <div class="geo-concentric-ring"></div>
        <div class="geo-dashed-arc"></div>
        <div class="geo-triangle">
          <svg viewBox="0 0 24 24">
            <polygon points="12,2 22,20 2,20" />
          </svg>
        </div>
        <div class="geo-curved-spline">
          <svg viewBox="0 0 200 150" fill="none" stroke="rgba(148, 163, 184, 0.45)" stroke-width="1.8">
            <path d="M10,80 C60,10 140,140 190,70" stroke-linecap="round" />
            <circle cx="10" cy="80" r="3" fill="#bae6fd" />
            <circle cx="190" cy="70" r="3" fill="#e9d5ff" />
          </svg>
        </div>
      </div>

      <!-- Layer 6: Tiny floating ambient particles -->
      <div class="fluid-layer-particles">
        <div class="particle-dot p-dot-1"></div>
        <div class="particle-dot p-dot-2"></div>
        <div class="particle-dot p-dot-3"></div>
        <div class="particle-dot p-dot-4"></div>
        <div class="particle-dot p-dot-5"></div>
        <div class="particle-dot p-dot-6"></div>
      </div>
    `;

    document.body.prepend(container);

    // Performance Optimization: Pause animations when tab is inactive to preserve battery/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        container.classList.add('fluid-motion-paused');
      } else {
        container.classList.remove('fluid-motion-paused');
      }
    });

    window.FluidBackground = {
      setMode: function (mode) {
        container.classList.remove('fluid-bg-ambient', 'fluid-bg-immersive');
        container.classList.add(mode === 'ambient' ? 'fluid-bg-ambient' : 'fluid-bg-immersive');
      },
      pause: function () {
        container.classList.add('fluid-motion-paused');
      },
      resume: function () {
        container.classList.remove('fluid-motion-paused');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFluidBackground);
  } else {
    initFluidBackground();
  }
})();

