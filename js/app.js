/* Flow99 landing page — Worker B: scroll-animation workflow + page JS.
   Vanilla JS only. No libraries, no network calls, no storage, no secrets,
   no payment / OTP / login code, no real WhatsApp sends. Standalone demo only:
   the hero chat below uses canned demo text and never sends or saves anything.
   Coordinator CSS hooks used by this file (define in the white glass stylesheet):
     .wf-js .wf-step            -> hidden start state (opacity 0, small translateY/scale)
     .wf-js .wf-step.in-view    -> visible state (transition to opacity 1, none)
     .wf-step.is-active         -> current step emphasis (optional stronger glass/shadow)
     .wf-step.is-highlighted    -> gentle auto-play highlight (same look as .is-active
                                  is fine; keep it subtle so it never fights scrolling)
     #flow99-reveal             -> hidden start state (small scale, low opacity)
     #flow99-reveal.revealed    -> big FLOW99 text scaled/glowed in
     @media (prefers-reduced-motion: reduce) -> all of the above with no transition
   If the coordinator stylesheet omits the .wf-js start states, steps simply stay
   readable and this script still drives progress, highlight and reveal classes.
   Progress is also set inline on #workflow-progress (style.width), so it works
   even without coordinator CSS for the bar itself. */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mark JS as present so hidden start states only apply when JS can reveal. */
  docEl.classList.add('wf-js');
  if (reducedMotion) docEl.classList.add('wf-reduced-motion');

  /* ---------- Small helpers ---------- */
  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /* ---------- Mobile menu toggle ---------- */
  function initMobileMenu() {
    var toggle = $('[data-menu-toggle]') || $('.nav-toggle') || $('#menu-toggle');
    var menu = $('[data-mobile-menu]') || $('.mobile-menu') || $('#mobile-menu') ||
      $('.nav-links') || $('#nav-links');
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
    $$('a', menu).forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ---------- Smooth scroll for nav anchors ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      var targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        if (reducedMotion || !('scrollBehavior' in docEl.style)) {
          target.scrollIntoView();
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------- Workflow scroll-'video' ---------- */
  var section = $('#workflow');
  var stepsContainer = $('#workflow-steps');
  var progressBar = $('#workflow-progress');
  var reveal = $('#flow99-reveal');
  var steps = stepsContainer ? $$('.wf-step', stepsContainer) : $$('.wf-step');
  var totalSteps = steps.length;
  var currentIndex = -1;      /* last step seen / highlighted (0-based, -1 = none) */
  var highestSeen = -1;       /* furthest step ever revealed — progress never rewinds below it while in section */
  var revealDone = false;
  var sectionInView = false;
  var manualPauseUntil = 0;   /* timestamp: auto-play stays off until then after manual scroll/touch */
  var autoTimer = null;
  var scrollQueued = false;

  function setProgress(value) {
    if (!progressBar) return;
    progressBar.style.width = (clamp(value, 0, 1) * 100).toFixed(1) + '%';
    progressBar.setAttribute('aria-valuenow', String(Math.round(clamp(value, 0, 1) * 100)));
  }

  function markStep(index) {
    if (index < 0 || index >= totalSteps) return;
    if (index > highestSeen) highestSeen = index;
    currentIndex = index;
    steps[index].classList.add('in-view');
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === index);
    });
  }

  function showReveal() {
    if (revealDone || !reveal) return;
    revealDone = true;
    reveal.classList.add('revealed');
    setProgress(1);
  }

  function updateProgress() {
    scrollQueued = false;
    if (!section) {
      /* No section wrapper: fall back to step-based progress only. */
      if (totalSteps > 0 && highestSeen >= 0) {
        setProgress((highestSeen + 1) / totalSteps);
      }
      return;
    }
    var rect = section.getBoundingClientRect();
    var viewportH = window.innerHeight || 1;
    var travelled = viewportH - rect.top;
    var span = viewportH + rect.height;
    var scrollProgress = span > 0 ? travelled / span : 0;
    var stepProgress = totalSteps > 0 && highestSeen >= 0
      ? (highestSeen + 1) / totalSteps : 0;
    /* Scroll position drives the bar; revealed steps only raise it, never lower it. */
    var value = Math.max(scrollProgress, stepProgress);
    if (rect.top >= viewportH) value = 0;
    if (rect.bottom <= 0) value = 1;
    if (revealDone) value = 1;
    setProgress(value);
    if (value >= 0.995) showReveal();
  }

  function queueProgressUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateProgress);
  }

  function observeSteps() {
    if (!totalSteps) return;

    if (reducedMotion) {
      /* Readable immediately, no heavy motion; progress still fills on scroll. */
      steps.forEach(function (step, i) {
        step.classList.add('in-view');
        if (i === 0) step.classList.add('is-active');
      });
      highestSeen = totalSteps - 1;
      currentIndex = 0;
      updateProgress();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (step) { step.classList.add('in-view'); });
      highestSeen = totalSteps - 1;
      updateProgress();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = steps.indexOf(entry.target);
        if (index === -1) return;
        entry.target.classList.add('in-view');
        /* Scrolling sets the current step, so auto-play continues from here
           instead of jumping back — manual scroll is never overridden. */
        markStep(index);
        if (index === totalSteps - 1) showReveal();
      });
      queueProgressUpdate();
    }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.25 });

    steps.forEach(function (step) { observer.observe(step); });
  }

  /* ---------- Auto-play highlight (never scrolls the page) ---------- */
  function stopAutoPlay() {
    if (autoTimer !== null) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function highlightStep(index) {
    if (!totalSteps) return;
    currentIndex = index;
    steps.forEach(function (step, i) {
      step.classList.toggle('is-highlighted', i === index);
      step.classList.toggle('is-active', i === index);
    });
    if (index === totalSteps - 1) showReveal();
  }

  function startAutoPlay() {
    if (reducedMotion || !totalSteps || autoTimer !== null) return;
    if (!sectionInView || document.hidden) return;
    autoTimer = window.setInterval(function () {
      if (document.hidden || !sectionInView) { stopAutoPlay(); return; }
      if (Date.now() < manualPauseUntil) return; /* manual scroll owns the moment */
      var next = currentIndex < 0 ? 0 : (currentIndex + 1) % totalSteps;
      /* Only highlight steps the visitor has already scrolled into view once,
         except the very first cycle, so auto-play never spoils unseen steps. */
      if (highestSeen >= 0 && next > highestSeen && highestSeen < totalSteps - 1) {
        next = 0;
      }
      steps[next].classList.add('in-view');
      highlightStep(next);
    }, 2500);
  }

  function observeSection() {
    if (!section) { sectionInView = true; startAutoPlay(); return; }
    if (!('IntersectionObserver' in window)) {
      sectionInView = true; startAutoPlay(); return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sectionInView = entry.isIntersecting;
        if (sectionInView) startAutoPlay(); else stopAutoPlay();
      });
    }, { threshold: 0.15 });
    observer.observe(section);
  }

  function noteManualInteraction() {
    /* Any manual scroll/touch/wheel inside the workflow pauses auto-play
       briefly; auto-play resumes on its own afterwards and never scrolls. */
    manualPauseUntil = Date.now() + 6000;
  }

  function initWorkflowEvents() {
    window.addEventListener('scroll', queueProgressUpdate, { passive: true });
    window.addEventListener('resize', queueProgressUpdate);
    if (section) {
      section.addEventListener('wheel', noteManualInteraction, { passive: true });
      section.addEventListener('touchmove', noteManualInteraction, { passive: true });
      section.addEventListener('pointerdown', noteManualInteraction, { passive: true });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    });
    if (section) {
      section.addEventListener('mouseenter', function () {
        /* Hovering pauses the highlight cycle while the visitor reads. */
        stopAutoPlay();
      });
      section.addEventListener('mouseleave', function () { startAutoPlay(); });
    }
    queueProgressUpdate();
  }

  /* ---------- Hero demo chat loop (optional, canned text only) ---------- */
  /* Runs ONLY if the coordinator markup opts in with data-demo-chat="auto" and
     provides [data-demo-bubble] elements. Nothing is sent, saved or transmitted:
     the loop just rotates canned demo lines already present on the page. */
  function initHeroDemoChat() {
    var chat = $('[data-demo-chat="auto"]');
    if (!chat || reducedMotion) return;
    var bubbles = $$('[data-demo-bubble]', chat);
    if (bubbles.length < 2) return;
    var canned = bubbles.map(function (bubble) { return bubble.textContent; });
    var index = 0;
    var timer = null;

    function tick() {
      if (document.hidden) return;
      index = (index + 1) % canned.length;
      bubbles.forEach(function (bubble, i) {
        bubble.textContent = canned[(index + i) % canned.length];
        bubble.classList.toggle('demo-current', i === 0);
      });
    }

    function start() {
      if (timer === null) timer = window.setInterval(tick, 4000);
    }
    function stop() {
      if (timer !== null) { window.clearInterval(timer); timer = null; }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* ---------- Boot ---------- */
  initMobileMenu();
  initSmoothScroll();
  observeSteps();
  observeSection();
  initWorkflowEvents();
  initHeroDemoChat();
})();
