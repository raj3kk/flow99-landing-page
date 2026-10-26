'use strict';

/*
 * Flow99 landing page — original vanilla JS, no libraries, no CDN.
 * Features (all guarded with null checks; nothing throws if a hook is absent):
 *   1. Hero glow follows the mouse (desktop only) + subtle scroll drift.
 *   2. .reveal elements fade/slide in via IntersectionObserver, staggered
 *      by index within their parent (transition-delay capped).
 *   3. .float-panel elements get a subtle scroll parallax (desktop only).
 *      CSS keyframes own the floating; this file never fights them.
 *   4. Auto-playing demo chat loop (canned replies only, no network,
 *      no input, no send). Pauses when the tab is hidden.
 *   5. Mobile menu toggle (class 'open' + aria-expanded).
 *   6. Smooth anchor scrolling (respects prefers-reduced-motion).
 * Deliberately absent from this file: network calls, browser storage,
 * cookies, credentials, payments, one-time codes, logins, navigation to
 * live sites, scroll-snap, scroll trapping, audio/sound.
 */

document.addEventListener('DOMContentLoaded', function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(min-width: 768px)').matches;

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */

  // rAF throttle: at most one callback per animation frame.
  function rafThrottle(fn) {
    var scheduled = false;
    return function () {
      if (scheduled) { return; }
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        fn();
      });
    };
  }

  /* ------------------------------------------------------------------ */
  /* 1. Hero glow: mouse-follow (desktop) + subtle scroll drift          */
  /* ------------------------------------------------------------------ */

  var hero = document.getElementById('hero');
  var heroGlow = document.getElementById('heroGlow');

  if (hero && heroGlow && !reducedMotion && isDesktop) {
    var glowX = 0;
    var glowY = 0;
    var scrollShift = 0;

    function applyGlow() {
      heroGlow.style.transform =
        'translate(' + glowX.toFixed(1) + 'px, ' + (glowY + scrollShift).toFixed(1) + 'px)';
    }
    var applyGlowThrottled = rafThrottle(applyGlow);

    hero.addEventListener('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      // Offset from hero centre, damped so the glow drifts rather than snaps.
      glowX = (event.clientX - rect.left - rect.width / 2) * 0.12;
      glowY = (event.clientY - rect.top - rect.height / 2) * 0.12;
      applyGlowThrottled();
    });

    window.addEventListener('scroll', rafThrottle(function () {
      // Subtle downward drift as the hero leaves the viewport.
      scrollShift = Math.min(window.scrollY * 0.08, 60);
      applyGlow();
    }), { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Reveal on scroll (IntersectionObserver, staggered per parent)    */
  /* ------------------------------------------------------------------ */

  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    if (reducedMotion) {
      // No animation: everything visible immediately.
      revealEls.forEach(function (el) {
        el.classList.add('visible');
        el.style.transitionDelay = '0ms';
      });
    } else if ('IntersectionObserver' in window) {
      // Stagger: delay by index within the element's parent, capped at 300ms.
      var parentsSeen = new Map();
      revealEls.forEach(function (el) {
        var parent = el.parentElement;
        var index = parentsSeen.get(parent) || 0;
        parentsSeen.set(parent, index + 1);
        el.style.transitionDelay = Math.min(index * 80, 300) + 'ms';
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      // Coordinator merge fix: hide first (pre-reveal), then reveal on intersect.
      // Without this, .reveal's visible-by-default base state meant no fade-in.
      revealEls.forEach(function (el) {
        el.classList.add('pre-reveal');
        observer.observe(el);
      });
    } else {
      // Fallback for very old browsers: show everything.
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Float-panel scroll parallax (desktop only, never fights CSS)     */
  /* ------------------------------------------------------------------ */

  var floatPanels = document.querySelectorAll('.float-panel');

  if (floatPanels.length > 0 && !reducedMotion && isDesktop) {
    var applyParallax = rafThrottle(function () {
      floatPanels.forEach(function (panel) {
        var rect = panel.getBoundingClientRect();
        var viewportH = window.innerHeight || 1;
        // Only nudge panels near the viewport; strength is deliberately small
        // so the CSS float keyframes remain the dominant motion.
        if (rect.bottom > -100 && rect.top < viewportH + 100) {
          var offset = (rect.top + rect.height / 2 - viewportH / 2) * -0.04;
          panel.style.setProperty('--scroll-parallax', offset.toFixed(1) + 'px');
          panel.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
        }
      });
    });
    window.addEventListener('scroll', applyParallax, { passive: true });
    // Initial position, in case the page loads mid-scroll.
    applyParallax();
  }

  /* ------------------------------------------------------------------ */
  /* 4. Demo chat: auto-playing scripted loop, canned replies only       */
  /* ------------------------------------------------------------------ */

  var demoChat = document.getElementById('demoChat');
  var chatMessages = document.getElementById('chatMessages');
  var demoChatStatus = document.getElementById('demoChatStatus');

  if (demoChatStatus) {
    demoChatStatus.textContent = 'DEMO \u2014 no message is sent or saved';
  }

  if (chatMessages) {
    // Three short scripted exchanges for a fictional 'Demo Store'.
    // Every AI line is a canned demo reply; nothing is sent anywhere.
    var script = [
      { who: 'customer', text: 'Hi! Is the handmade soap in stock?' },
      { who: 'ai', text: 'Yes! The handmade soap is in stock at \u20B9299. Would you like to book one?' },
      { who: 'customer', text: 'Yes, please book one for me.' },
      { who: 'ai', text: 'Done! Your order is booked. You will get a reminder before delivery.' },
      { who: 'customer', text: 'What time do you deliver?' },
      { who: 'ai', text: 'We deliver between 10 am and 7 pm. Your slot is tomorrow, 11 am.' },
      { who: 'customer', text: 'Can I change it to the evening?' },
      { who: 'ai', text: 'Of course \u2014 moved to tomorrow evening, 6 pm. Reminder set!' }
    ];

    var MAX_BUBBLES = 6;
    var step = 0;
    var timer = null;
    var running = false;

    function appendBubble(line) {
      var bubble = document.createElement('div');
      bubble.className = line.who === 'ai' ? 'msg-ai' : 'msg-customer';
      bubble.textContent = line.text;
      chatMessages.appendChild(bubble);
      // Keep only the last ~6 bubbles so the demo never grows unbounded.
      while (chatMessages.children.length > MAX_BUBBLES) {
        chatMessages.removeChild(chatMessages.firstChild);
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function playNext() {
      appendBubble(script[step % script.length]);
      step += 1;
      // Brief pause after each AI reply so the exchange reads naturally.
      var last = script[(step - 1 + script.length) % script.length];
      var delay = last.who === 'ai' ? 2200 : 1400;
      timer = window.setTimeout(function () {
        if (running) { playNext(); }
      }, delay);
    }

    function startLoop() {
      if (running) { return; }
      running = true;
      // Small lead-in so the first bubble does not appear instantly.
      timer = window.setTimeout(playNext, 600);
    }

    function stopLoop() {
      running = false;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    // Pause while the tab is hidden; restart when it becomes visible again.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    });

    startLoop();
  }

  /* ------------------------------------------------------------------ */
  /* 5. Mobile menu toggle                                               */
  /* ------------------------------------------------------------------ */

  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Clicking any link inside the menu closes it.
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Smooth anchor scrolling                                          */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var targetId = anchor.getAttribute('href');
      // Ignore bare '#' links; only handle real in-page targets.
      if (!targetId || targetId === '#') { return; }
      // getElementById avoids selector-parsing errors on unusual hrefs.
      var target = document.getElementById(targetId.slice(1));
      if (!target) { return; } // Target missing: let the default happen (no-op).
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });
});
