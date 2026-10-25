
/* part1 */
/* PART 1 — hero + scenes 1–3. Vanilla JS only. No network, no storage, no globals except wp1* guards. */
(function () {
  'use strict';

  function wp1ReducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function wp1RevealOnScroll() {
    var items = document.querySelectorAll('.wp1-reveal');
    if (!items.length) return;
    if (wp1ReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('wp1-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('wp1-in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function wp1BuildParticles() {
    var host = document.querySelector('[data-wp1-particles]');
    if (!host || wp1ReducedMotion()) return;
    var count = window.innerWidth < 860 ? 14 : 28;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('i');
      dot.style.left = Math.floor(Math.random() * 100) + '%';
      dot.style.top = Math.floor(Math.random() * 100) + '%';
      dot.style.animationDelay = (Math.random() * 4).toFixed(1) + 's';
      dot.style.animationDuration = (5 + Math.random() * 5).toFixed(1) + 's';
      host.appendChild(dot);
    }
  }

  function wp1Parallax() {
    var hero = document.getElementById('hero');
    if (!hero || wp1ReducedMotion()) return;
    var layers = hero.querySelectorAll('[data-wp1-depth]');
    if (!layers.length) return;
    var raf = null, mx = 0, my = 0;
    function wp1ApplyParallax() {
      raf = null;
      layers.forEach(function (el) {
        var depth = parseFloat(el.getAttribute('data-wp1-depth')) || 20;
        var x = (mx * depth).toFixed(1), y = (my * depth).toFixed(1);
        el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      });
    }
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / Math.max(r.width, 1) - 0.5);
      my = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5);
      if (!raf) raf = requestAnimationFrame(wp1ApplyParallax);
    }, { passive: true });
  }

  function wp1CycleLiveBubble() {
    var bubble = document.querySelector('[data-wp1-live-bubble]');
    if (!bubble) return;
    var messages = [
      'Evening delivery added to your demo request. No real order is placed.',
      'Demo FAQ answered instantly — no live chat is connected.',
      'Demo follow-up queued in this animation. Nothing is sent.'
    ];
    var idx = 0;
    window.setInterval(function () {
      idx = (idx + 1) % messages.length;
      // Keep the DEMO label + speaker line; replace only the message text node area safely.
      var who = bubble.querySelector('.wp1-bubble-who');
      var tag = bubble.querySelector('.wp1-demo-tag');
      bubble.textContent = '';
      if (who) bubble.appendChild(who);
      bubble.appendChild(document.createTextNode(messages[idx] + ' '));
      if (tag) bubble.appendChild(tag);
    }, 6000);
  }

  function wp1CycleInstagramPanels() {
    var panels = document.querySelectorAll('[data-wp1-ig-panel]');
    var agent = document.querySelector('[data-wp1-ig-agent]');
    if (!panels.length || wp1ReducedMotion()) return;
    var idx = 0;
    function wp1HighlightIgPanel() {
      panels.forEach(function (p, i) { p.classList.toggle('wp1-active', i === idx); });
      if (agent) agent.style.transform = 'translateX(' + (idx * 12) + 'px)';
      idx = (idx + 1) % panels.length;
    }
    wp1HighlightIgPanel();
    window.setInterval(wp1HighlightIgPanel, 3500);
  }

  function wp1Init() {
    wp1RevealOnScroll();
    wp1BuildParticles();
    wp1Parallax();
    if (!wp1ReducedMotion()) { wp1CycleLiveBubble(); wp1CycleInstagramPanels(); }
    else {
      var panels = document.querySelectorAll('[data-wp1-ig-panel]');
      if (panels.length) panels[0].classList.add('wp1-active');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wp1Init);
  } else {
    wp1Init();
  }
})();

/* part2 */
/* ============================================================
   WORKER 2 / PART 2 — vanilla JS only, guarded, prefixed wp2.
   No network calls, no storage, no libraries, no live navigation.
   - Scroll reveals (IntersectionObserver, fallback: show all)
   - Gentle scroll parallax via rAF (transform only, disabled on
     mobile / reduced-motion, never changes scroll behaviour)
   - Subtle 3D tilt on [data-wp2-tilt] (pointer:fine only)
   - Scene 5 demo workflow sequencer (loops while in view)
   - Final CTA: scroll to #pricing if present, else on-screen
     demo confirmation. Secondary link: #agents, else features area.
   ============================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  var wp2Reduced = false;
  try {
    wp2Reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { wp2Reduced = false; }

  /* ---------- 1. Scroll-triggered reveals + stagger ---------- */
  var wp2RevealEls = document.querySelectorAll('.wp2-reveal, .wp2-stagger');
  if ('IntersectionObserver' in window && !wp2Reduced) {
    var wp2Observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('wp2-in');
          wp2Observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    wp2RevealEls.forEach(function (el) { wp2Observer.observe(el); });
  } else {
    // Fallback / reduced-motion: content fully visible, no trap.
    wp2RevealEls.forEach(function (el) { el.classList.add('wp2-in'); });
  }

  /* ---------- 2. Gentle parallax (responds to actual scroll) ---------- */
  var wp2ParallaxEls = document.querySelectorAll('[data-wp2-parallax]');
  var wp2Ticking = false;
  function wp2ApplyParallax() {
    wp2Ticking = false;
    if (wp2Reduced || window.innerWidth < 820) {
      wp2ParallaxEls.forEach(function (el) { el.style.transform = ''; });
      return;
    }
    wp2ParallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var depth = parseFloat(el.getAttribute('data-wp2-parallax')) || 0.04;
      // Only shift while on screen; small range so layout never jumps.
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * depth;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      }
    });
  }
  function wp2OnScroll() {
    if (!wp2Ticking) { wp2Ticking = true; requestAnimationFrame(wp2ApplyParallax); }
  }
  if (wp2ParallaxEls.length && !wp2Reduced) {
    window.addEventListener('scroll', wp2OnScroll, { passive: true });
    window.addEventListener('resize', wp2OnScroll, { passive: true });
    wp2ApplyParallax();
  }

  /* ---------- 3. Subtle 3D tilt (pointer:fine only) ---------- */
  var wp2TiltEls = document.querySelectorAll('[data-wp2-tilt]');
  var wp2FinePointer = false;
  try { wp2FinePointer = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
  if (wp2FinePointer && !wp2Reduced) {
    wp2TiltEls.forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / Math.max(r.width, 1) - 0.5;
        var y = (ev.clientY - r.top) / Math.max(r.height, 1) - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 5).toFixed(2) +
          'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 4. Scene 5: generic demo workflow sequencer ---------- */
  var wp2Flow = document.getElementById('wp2-flow');
  var wp2Reply = document.getElementById('wp2-demo-reply');
  var wp2Replay = document.getElementById('wp2-replay-flow');
  var wp2Replies = [
    'Working through the demo workflow…',
    'Demo: understanding the question…',
    'Demo: applying the demo business rules…',
    'Demo: drafting a helpful reply…',
    'Demo reply ready to send (demo only, nothing sent).',
    '✓ Demo: reply sent in this mock + demo record updated.'
  ];
  if (wp2Flow && wp2Reply) {
    var wp2Steps = wp2Flow.querySelectorAll('.wp2-flow-step');
    var wp2Nodes = document.querySelectorAll('.wp2-node');
    var wp2Timer = null;
    var wp2Index = -1;
    function wp2ClearFlow() {
      wp2Steps.forEach(function (s) { s.classList.remove('wp2-step-on'); });
      wp2Nodes.forEach(function (n) { n.classList.remove('wp2-node-on'); });
    }
    function wp2AdvanceFlow() {
      wp2Index += 1;
      if (wp2Index >= wp2Steps.length) {
        clearInterval(wp2Timer); wp2Timer = null;
        wp2Reply.textContent = '✓ Demo complete: “Yes — demo weekend delivery is available.” (Nothing was actually sent.)';
        return;
      }
      wp2ClearFlow();
      wp2Steps[wp2Index].classList.add('wp2-step-on');
      wp2Steps[wp2Index].scrollIntoView({ block: 'nearest', behavior: 'auto' });
      wp2Nodes.forEach(function (n) {
        if (parseInt(n.getAttribute('data-wp2-node'), 10) <= wp2Index) n.classList.add('wp2-node-on');
      });
      wp2Reply.textContent = wp2Replies[wp2Index] || wp2Replies[0];
    }
    function wp2StartFlow() {
      if (wp2Timer) clearInterval(wp2Timer);
      wp2Index = -1; wp2ClearFlow();
      wp2Reply.textContent = wp2Replies[0];
      if (wp2Reduced) {
        // Reduced motion: show the finished demo state at once.
        wp2Steps.forEach(function (s) { s.classList.add('wp2-step-on'); });
        wp2Nodes.forEach(function (n) { n.classList.add('wp2-node-on'); });
        wp2Reply.textContent = '✓ Demo complete: “Yes — demo weekend delivery is available.” (Nothing was actually sent.)';
        return;
      }
      wp2Timer = setInterval(wp2AdvanceFlow, 1400);
      wp2AdvanceFlow();
    }
    // Start once when the workflow scrolls into view.
    if ('IntersectionObserver' in window) {
      var wp2FlowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { wp2StartFlow(); wp2FlowObserver.disconnect(); }
        });
      }, { threshold: 0.3 });
      wp2FlowObserver.observe(wp2Flow);
    } else { wp2StartFlow(); }
    if (wp2Replay) wp2Replay.addEventListener('click', wp2StartFlow);
  }

  /* ---------- 5. Final CTA (DEMO — goes nowhere live) ---------- */
  var wp2Cta = document.getElementById('wp2-cta-start');
  var wp2Confirm = document.getElementById('wp2-demo-confirm');
  var wp2Note = document.getElementById('wp2-cta-note');
  if (wp2Cta) {
    wp2Cta.addEventListener('click', function () {
      var pricing = document.getElementById('pricing');
      if (pricing) {
        pricing.scrollIntoView({ behavior: wp2Reduced ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      // No #pricing in this fragment build: on-screen demo confirmation only.
      if (wp2Confirm) wp2Confirm.hidden = false;
      if (wp2Note) wp2Note.textContent = 'Demo confirmation shown above — no account created, nothing sent, nowhere live.';
    });
  }

  /* Secondary link: #agents if present, else a features area, else stay. */
  var wp2Features = document.getElementById('wp2-cta-features');
  if (wp2Features) {
    wp2Features.addEventListener('click', function (ev) {
      var agents = document.getElementById('agents');
      var features = document.getElementById('features') ||
        document.querySelector('[data-wp2-features]');
      var target = agents || features;
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: wp2Reduced ? 'auto' : 'smooth', block: 'start' });
      } else if (agents === null && !features) {
        // No destination exists in this fragment build: keep href harmless.
        ev.preventDefault();
        if (wp2Confirm) {
          wp2Confirm.hidden = false;
          wp2Confirm.textContent = 'Demo note: the features area lives in another part of the page — nothing was sent or opened live.';
        }
      }
      // If #agents exists, the default anchor scroll is left intact.
    });
  }
})();

/* part3 */
/* ============================================================
   WORKER 3 — nav / sound / progress (DEMO landing page)
   Vanilla JS only. All identifiers prefixed wp3.
   Guarded: every lookup null-checked; script no-ops if fragments
   are absent. No network calls, no storage, no autoplay.
   Sound: OFF by default. Only enabled by a user click on the
   toggle, and only then does a Web Audio context get created.
   Sounds are tiny synthesized blips (no audio files, no fetch).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mobile menu: open / close ---------- */
  var wp3MenuBtn = document.getElementById('wp3-menu-btn');
  var wp3MobileMenu = document.getElementById('wp3-mobile-menu');
  if (wp3MenuBtn && wp3MobileMenu) {
    wp3MenuBtn.addEventListener('click', function () {
      var wp3Open = wp3MobileMenu.hasAttribute('hidden');
      if (wp3Open) {
        wp3MobileMenu.removeAttribute('hidden');
        wp3MenuBtn.setAttribute('aria-expanded', 'true');
        wp3MenuBtn.setAttribute('aria-label', 'Close menu');
      } else {
        wp3MobileMenu.setAttribute('hidden', '');
        wp3MenuBtn.setAttribute('aria-expanded', 'false');
        wp3MenuBtn.setAttribute('aria-label', 'Open menu');
      }
      wp3PlayBlip();
    });
    /* Close the menu when a link inside it is tapped. */
    var wp3Links = wp3MobileMenu.querySelectorAll('a');
    for (var i = 0; i < wp3Links.length; i++) {
      wp3Links[i].addEventListener('click', function () {
        wp3MobileMenu.setAttribute('hidden', '');
        wp3MenuBtn.setAttribute('aria-expanded', 'false');
        wp3MenuBtn.setAttribute('aria-label', 'Open menu');
      });
    }
  }

  /* ---------- Scroll progress indicator ---------- */
  var wp3ProgressFill = document.getElementById('wp3-progress-fill');
  function wp3UpdateProgress() {
    if (!wp3ProgressFill) { return; }
    var wp3Doc = document.documentElement;
    var wp3Max = wp3Doc.scrollHeight - wp3Doc.clientHeight;
    var wp3Pct = wp3Max > 0 ? (wp3Doc.scrollTop / wp3Max) * 100 : 0;
    wp3ProgressFill.style.width = wp3Pct + '%';
  }
  window.addEventListener('scroll', wp3UpdateProgress, { passive: true });
  window.addEventListener('resize', wp3UpdateProgress);
  wp3UpdateProgress();

  /* ---------- Sound toggle: OFF by default, click-to-enable ---------- */
  var wp3SoundOn = false; /* default muted/off — never autoplay */
  var wp3AudioCtx = null;
  var wp3Toggle = document.getElementById('wp3-sound-toggle');
  var wp3Icon = wp3Toggle ? wp3Toggle.querySelector('.wp3-sound-icon') : null;
  var wp3Label = wp3Toggle ? wp3Toggle.querySelector('.wp3-sound-label') : null;

  function wp3PlayBlip() {
    if (!wp3SoundOn || !wp3AudioCtx) { return; }
    try {
      var wp3Osc = wp3AudioCtx.createOscillator();
      var wp3Gain = wp3AudioCtx.createGain();
      wp3Osc.type = 'sine';
      wp3Osc.frequency.value = 880;
      wp3Gain.gain.setValueAtTime(0.04, wp3AudioCtx.currentTime);
      wp3Gain.gain.exponentialRampToValueAtTime(0.001, wp3AudioCtx.currentTime + 0.12);
      wp3Osc.connect(wp3Gain);
      wp3Gain.connect(wp3AudioCtx.destination);
      wp3Osc.start();
      wp3Osc.stop(wp3AudioCtx.currentTime + 0.13);
    } catch (wp3Err) { /* silent: interface sound is optional */ }
  }

  if (wp3Toggle) {
    wp3Toggle.addEventListener('click', function () {
      wp3SoundOn = !wp3SoundOn;
      if (wp3SoundOn && !wp3AudioCtx) {
        /* Created only after this user click — never before. */
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) { wp3AudioCtx = new AC(); }
        } catch (wp3Err) { wp3AudioCtx = null; }
      }
      if (wp3AudioCtx && wp3AudioCtx.state === 'suspended') {
        wp3AudioCtx.resume().catch(function () {});
      }
      wp3Toggle.setAttribute('aria-pressed', wp3SoundOn ? 'true' : 'false');
      wp3Toggle.setAttribute('aria-label', wp3SoundOn
        ? 'Interface sounds on. Tap to turn off.'
        : 'Interface sounds off. Tap to turn on.');
      if (wp3Icon) { wp3Icon.textContent = wp3SoundOn ? '🔊' : '🔇'; }
      if (wp3Label) { wp3Label.textContent = wp3SoundOn ? 'Sound On' : 'Sound Off'; }
      wp3PlayBlip(); /* confirmation blip only after enabling */
    });
  }

  /* Subtle click blips on demo buttons — only when sound is ON. */
  var wp3Clickables = document.querySelectorAll('.wp3-plan-btn, .wp3-nav-link, .wp3-footer-link');
  for (var j = 0; j < wp3Clickables.length; j++) {
    wp3Clickables[j].addEventListener('click', wp3PlayBlip);
  }
})();
