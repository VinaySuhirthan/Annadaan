/**
 * ANNADAAN — Simulated Food Photo Verification Experience
 * 
 * IMPORTANT: FRONTEND DEMONSTRATION ONLY.
 * No genuine AI inference, computer vision, or food-safety inspection is performed.
 * This demo does NOT verify food freshness, hygiene, or safety.
 */

(function () {
  'use strict';

  // 50 Varied, encouraging positive acknowledgements
  const POSITIVE_ACKNOWLEDGEMENTS = [
    "A thoughtful donation can make someone's day.",
    "Every meal shared makes a genuine difference.",
    "Thank you for helping reduce food waste in our community.",
    "Your generosity helps bring warmth and nourishment.",
    "Small everyday actions create meaningful change.",
    "A meal shared is hope shared.",
    "Thank you for being an active part of Annadaan.",
    "Your contribution helps build a caring neighborhood.",
    "Sharing good food brings people closer together.",
    "Kindness on a plate goes a long way.",
    "Thank you for turning surplus into real support.",
    "A warm meal is a simple gift with a lasting impact.",
    "Your mindfulness helps nourish someone in need.",
    "Community care starts with shared meals like yours.",
    "Every contribution strengthens our collective support.",
    "Compassion in action creates ripples of goodwill.",
    "Food connects us all — thank you for giving back.",
    "Giving with care makes every plate meaningful.",
    "Together we ensure good food reaches local shelters.",
    "Thank you for choosing to share instead of waste.",
    "Your goodwill turns a surplus meal into smiles.",
    "Generosity is the heart of a resilient community.",
    "A simple act of sharing creates a brighter tomorrow.",
    "Thank you for championing community food sharing.",
    "Every plate shared is a step toward zero hunger.",
    "Thoughtful donations build stronger neighborhoods.",
    "Caring for others is the essence of Annadaan.",
    "Your gesture of kindness touches real lives today.",
    "Food made with love, shared with an open heart.",
    "Thank you for contributing to an empathetic world.",
    "Bridging abundance and need, one meal at a time.",
    "Generosity is contagious — thank you for inspiring.",
    "You make our food redistribution network stronger.",
    "Every shared meal is a shared blessing.",
    "A helping hand and a warm plate make all the difference.",
    "Thank you for caring about those around you.",
    "Turning excess meals into heartfelt community care.",
    "Your donation brings hope and nourishment together.",
    "Big changes happen through humble, consistent giving.",
    "Thank you for standing up against unnecessary food waste.",
    "Shared meals build bonds across the entire city.",
    "A thoughtful donor makes a world of difference.",
    "Honoring food by sharing it with those who need it.",
    "One plate at a time, we help make hunger a thing of the past.",
    "Your generosity lights up someone's day today.",
    "Thank you for supporting community-driven nutrition.",
    "Giving is not just about making a donation; it is about making a difference.",
    "Food is precious — thank you for sharing it wisely.",
    "Your thoughtfulness ensures food reaches willing hands.",
    "Gratitude for your kindness and dedication to sharing."
  ];

  let lastMessageIndex = -1;
  let activeAnimationId = null;
  let activeTimeoutId = null;
  let startTime = null;
  const TOTAL_DURATION_MS = 7500; // Exactly 7.5 seconds

  function getRandomAcknowledgement() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * POSITIVE_ACKNOWLEDGEMENTS.length);
    } while (newIndex === lastMessageIndex && POSITIVE_ACKNOWLEDGEMENTS.length > 1);
    lastMessageIndex = newIndex;
    return POSITIVE_ACKNOWLEDGEMENTS[newIndex];
  }

  function getElements() {
    return {
      container: document.getElementById('photoVerificationSection'),
      activeState: document.getElementById('verifActiveState'),
      completionState: document.getElementById('verifCompletionState'),
      stageTitle: document.getElementById('verifStageTitle'),
      stageSubtitle: document.getElementById('verifStageSubtitle'),
      progressBar: document.getElementById('verifProgressBar'),
      progressPercent: document.getElementById('verifProgressPercent'),
      quoteText: document.getElementById('verifQuoteText')
    };
  }

  /**
   * Reset and cancel any ongoing simulation
   */
  function cancelSimulation() {
    if (activeAnimationId) {
      cancelAnimationFrame(activeAnimationId);
      activeAnimationId = null;
    }
    if (activeTimeoutId) {
      clearTimeout(activeTimeoutId);
      activeTimeoutId = null;
    }
    startTime = null;
  }

  function resetVerification() {
    cancelSimulation();
    const els = getElements();
    if (!els.container) return;

    els.container.style.display = 'none';
    if (els.activeState) els.activeState.style.display = 'flex';
    if (els.completionState) els.completionState.style.display = 'none';
    if (els.progressBar) els.progressBar.style.width = '0%';
    if (els.progressPercent) els.progressPercent.textContent = '0%';
  }

  /**
   * Triggered on photo upload/change
   */
  function startVerification() {
    cancelSimulation();
    const els = getElements();
    if (!els.container) return;

    // Show container and active state
    els.container.style.display = 'block';
    els.activeState.style.display = 'flex';
    els.completionState.style.display = 'none';
    els.stageTitle.textContent = "Food Image Review";
    els.stageSubtitle.textContent = "Preparing your uploaded photo...";
    els.progressBar.style.width = '0%';
    els.progressPercent.textContent = '0%';

    startTime = performance.now();

    function updateProgress(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / TOTAL_DURATION_MS, 1.0);
      const percentage = Math.round(progress * 100);

      // Update progress bar
      if (els.progressBar) els.progressBar.style.width = percentage + '%';
      if (els.progressPercent) els.progressPercent.textContent = percentage + '%';

      // Stage messages:
      // 0–2 seconds: "Receiving food photograph..."
      // 2–4 seconds: "Reviewing image clarity..."
      // 4–6 seconds: "Preparing photo preview..."
      // 6–7.5 seconds: "Finalizing image submission..."
      if (elapsed < 2000) {
        els.stageSubtitle.textContent = "Receiving food photograph...";
      } else if (elapsed < 4000) {
        els.stageSubtitle.textContent = "Reviewing image clarity...";
      } else if (elapsed < 6000) {
        els.stageSubtitle.textContent = "Preparing photo preview...";
      } else {
        els.stageSubtitle.textContent = "Finalizing image submission...";
      }

      if (elapsed < TOTAL_DURATION_MS) {
        activeAnimationId = requestAnimationFrame(updateProgress);
      } else {
        completeVerification();
      }
    }

    activeAnimationId = requestAnimationFrame(updateProgress);
  }

  function completeVerification() {
    cancelSimulation();
    const els = getElements();
    if (!els.container) return;

    // Switch to completion state
    els.activeState.style.display = 'none';
    els.completionState.style.display = 'flex';

    if (els.quoteText) {
      els.quoteText.textContent = `"${getRandomAcknowledgement()}"`;
    }
  }

  // Expose globally
  window.PhotoVerification = {
    start: startVerification,
    reset: resetVerification,
    cancel: cancelSimulation,
    messages: POSITIVE_ACKNOWLEDGEMENTS
  };
})();

