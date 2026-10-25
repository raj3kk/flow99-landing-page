// Flow99 landing demo — static only. No network send, no storage, no login/payment/OTP.
(function () {
  'use strict';
  var currentLang = 'hinglish';

  // Hindi / English text for main UI strings. Hinglish is the HTML original, restored from data-orig.
  var I18N = {
    navFeatures: { hindi: 'फीचर्स', en: 'Features' },
    navHow: { hindi: 'कैसे काम करता है', en: 'How It Works' },
    navDemo: { hindi: 'डेमो', en: 'Demo' },
    navPricing: { hindi: 'प्राइसिंग', en: 'Pricing' },
    navFaq: { hindi: 'सामान्य प्रश्न', en: 'FAQ' },
    navContact: { hindi: 'संपर्क', en: 'Contact' },
    ctaDemo: { hindi: 'डेमो देखें →', en: 'See Demo →' },
    heroEyebrow: { hindi: 'लाइव डेमो • कोई असली WhatsApp नहीं, सिर्फ सिमुलेशन', en: 'LIVE DEMO • No real WhatsApp, simulation only' },
    heroTitle: { hindi: 'रात 2 बजे आया ग्राहक भी <em>जवाब पाए</em> — सुबह तक बुकिंग पक्की।', en: 'Even a customer at 2 AM <em>gets a reply</em> — booking confirmed by morning.' },
    heroLede: { hindi: 'Flow99 आपके WhatsApp पर AI असिस्टेंट लगाता है — जो हर मैसेज का तुरंत जवाब दे, बुकिंग ले, रिमाइंडर भेजे, और कोई ग्राहक रात को खाली हाथ वापस न जाए। नीचे फोन में खुद ट्राई करें, यही असली फील है।', en: 'Flow99 puts an AI assistant on your WhatsApp — it replies to every message instantly, takes bookings, sends reminders, and no customer leaves empty-handed at night. Try it in the phone below; that is the real feel.' },
    heroCta: { hindi: '▶ डेमो देखें — खुद चैट करें', en: '▶ See Demo — chat yourself' },
    heroCta2: { hindi: 'डेमो प्राइसिंग देखें', en: 'See Demo Pricing' },
    proof1t: { hindi: 'जवाब, छुट्टी पर भी', en: 'replies, even on holidays' },
    proof2t: { hindi: 'डेमो में AI रिप्लाई टाइम', en: 'demo AI reply time' },
    proof3t: { hindi: 'डेमो चैट में मैसेज', en: 'missed demo message' },
    heroNote: { hindi: '⚠ यह पेज स्टैंडअलोन डेमो है। इस पर दिखाए नंबर, रिव्यू और कीमतें असली Flow99 के नहीं हैं।', en: '⚠ This page is a standalone demo. Numbers, reviews and prices shown here are not real Flow99 figures.' },
    floatA: { hindi: 'बुकिंग कन्फर्म — कल 11:00 AM', en: 'Booking confirmed — Tomorrow 11:00 AM' },
    floatB: { hindi: 'रिमाइंडर सेट — 1 घंटा पहले', en: 'Reminder set — 1 hour before' },
    phoneOnline: { hindi: 'ऑनलाइन • AI असिस्टेंट चालू', en: 'online • AI assistant active' },
    phoneOnline2: { hindi: 'ऑनलाइन • AI असिस्टेंट चालू', en: 'online • AI assistant active' },
    phoneHint: { hindi: 'डेमो चैट नीचे वाले सेक्शन में चलेगी ↓', en: 'The demo chat runs in the section below ↓' },
    probKicker: { hindi: 'समस्या — जो हर रोज़ होती है', en: 'THE PROBLEM — WHAT HAPPENS EVERY DAY' },
    probTitle: { hindi: 'ग्राहक मैसेज करता है। आप व्यस्त होते हैं। वह चला जाता है।', en: 'A customer messages. You are busy. They leave.' },
    prob1t: { hindi: 'मिस्ड मैसेज', en: 'Missed messages' },
    prob1p: { hindi: 'दिन में 40 मैसेज आए, 12 का जवाब देर से मिला — 5 ग्राहकों ने दूसरी दुकान ट्राई कर ली।', en: '40 messages in a day, 12 answered late — 5 customers tried another shop.' },
    prob2t: { hindi: 'रात के ग्राहक खो गए', en: 'Night customers lost' },
    prob2p: { hindi: 'रात 10 बजे के बाद पूछने वाला सुबह तक इंतज़ार नहीं करता। सुबह तक वह किसी और का ग्राहक है।', en: 'Someone asking after 10 PM will not wait till morning. By morning, they are someone else’s customer.' },
    prob3t: { hindi: 'भूली हुई बुकिंग', en: 'Forgotten bookings' },
    prob3p: { hindi: 'बुकिंग तो हो गई, रिमाइंडर नहीं गया — ग्राहक आया ही नहीं, स्लॉट खाली रह गया।', en: 'The booking happened, no reminder went out — the customer never came, the slot stayed empty.' },
    demoKicker: { hindi: 'लाइव डेमो — सिर्फ सिमुलेशन, कोई असली सेंड नहीं', en: 'LIVE DEMO — SIMULATION ONLY, NO REAL SEND' },
    demoTitle: { hindi: 'यहाँ टाइप करें। AI अभी जवाब देगा। यही पूरा प्रोडक्ट है।', en: 'Type here. The AI replies now. This is the whole product.' },
    demoSub: { hindi: 'नीचे लिखें — जैसे असली ग्राहक लिखता है: “कीमत क्या है?”, “कल बुकिंग चाहिए”, “टाइमिंग क्या है?” — या एक बटन दबाएँ और पूरा फ्लो देखें।', en: 'Write below — like a real customer: “What is the price?”, “I need a booking tomorrow”, “What are the timings?” — or press a button and watch the full flow.' },
    demoWelcome: { hindi: 'नमस्ते! 🙏 मैं Flow99 डेमो असिस्टेंट हूँ। पूछें — कीमत, टाइमिंग, या बुकिंग?', en: 'Hello! 🙏 I am the Flow99 demo assistant. Ask — price, timings, or booking?' },
    demoNote: { hindi: 'डेमो चैट: जवाब canned डेमो रिप्लाई से आते हैं। कोई मैसेज कहीं भेजा या सेव नहीं होता।', en: 'Demo chat: replies are canned demo replies. No message is sent or saved anywhere.' },
    simTitle: { hindi: 'एक क्लिक, पूरा फ्लो देखें', en: 'One click, see the full flow' },
    simB: { hindi: 'ब्रॉडकास्ट सिमुलेशन चलाएँ', en: 'Run broadcast simulation' },
    simBk: { hindi: 'बुकिंग सिमुलेशन चलाएँ', en: 'Run booking simulation' },
    simR: { hindi: 'रिमाइंडर सिमुलेशन चलाएँ', en: 'Run reminder simulation' },
    simEmpty: { hindi: 'कोई सिमुलेशन चलाएँ — यहाँ step-by-step दिखेगा: मैसेज गया → AI ने जवाब दिया → बुकिंग/रिमाइंडर समय पर।', en: 'Run a simulation — here you will see it step by step: message sent → AI replied → booking/reminder on time.' },
    clockLabel: { hindi: 'डेमो क्लॉक (आपका लोकल टाइम)', en: 'Demo clock (your local time)' },
    clockNote: { hindi: 'रिमाइंडर “समय पर” इसी क्लॉक से जुड़ता है — डेमो में time-based फ्लो दिखाने के लिए।', en: 'The “on time” reminder is tied to this clock — to show the time-based flow in the demo.' },
    featKicker: { hindi: 'फीचर्स — हर एक के साथ एक छोटा उदाहरण', en: 'FEATURES — EACH WITH A SMALL EXAMPLE' },
    featTitle: { hindi: 'सिर्फ ऑटो-रिप्लाई नहीं — पूरा काम संभालने वाला सिस्टम।', en: 'Not just auto-reply — a system that handles the whole job.' },
    howKicker: { hindi: 'कैसे काम करता है — 3 स्टेप्स', en: 'HOW IT WORKS — 3 STEPS' },
    howTitle: { hindi: 'सेटअप लंबा नहीं। तीन स्टेप्स, फिर ऑटोमेशन ऑन।', en: 'Setup is not long. Three steps, then automation on.' },
    resKicker: { hindi: 'रिज़ल्ट — डेमो नंबर, असली दावे नहीं', en: 'RESULTS — DEMO NUMBERS, NOT REAL CLAIMS' },
    resTitle: { hindi: 'डेमो में क्या दिखता है, जब सिस्टम समय पर चलता है।', en: 'What the demo shows, when the system runs on time.' },
    priceKicker: { hindi: 'प्राइसिंग — डेमो प्राइसिंग ओनली', en: 'PRICING — DEMO PRICING ONLY' },
    priceTitle: { hindi: 'डेमो प्लान — असली Flow99 कीमतें नहीं हैं।', en: 'Demo plans — these are not real Flow99 prices.' },
    billM: { hindi: 'मासिक', en: 'Monthly' },
    billY: { hindi: 'वार्षिक (डेमो: 2 महीने फ्री जैसा दिखाया गया)', en: 'Yearly (demo: shown as 2 months free)' },
    popular: { hindi: 'सबसे पॉपुलर (डेमो)', en: 'Most popular (demo)' },
    priceNote: { hindi: '⚠ डेमो प्राइसिंग: यह Flow99 की असली कीमतें होने का दावा नहीं है। यहाँ कोई पेमेंट, OTP या लॉगिन नहीं है।', en: '⚠ Demo pricing: this does not claim to be real Flow99 prices. No payment, OTP or login happens on this page.' },
    revKicker: { hindi: 'रिव्यू — डेमो ओनली, असली नाम/फोटो नहीं', en: 'REVIEWS — DEMO ONLY, NO REAL NAMES/PHOTOS' },
    revTitle: { hindi: 'डेमो बिज़नेस क्या कहते — कल्पना, असली रिव्यू नहीं।', en: 'What demo businesses say — imagined, not real reviews.' },
    faqKicker: { hindi: 'सामान्य प्रश्न', en: 'FAQ' },
    faqTitle: { hindi: 'अक्सर पूछे जाने वाले सवाल', en: 'Frequently asked questions' },
    ctaTitle: { hindi: 'एक बार डेमो चैट करके देखें — फिर फैसला करें।', en: 'Try the demo chat once — then decide.' },
    ctaSub: { hindi: 'ऊपर डेमो में अपना सवाल टाइप करें, या नीचे डेमो फॉर्म भरें (कुछ सेव नहीं होगा)।', en: 'Type your question in the demo above, or fill the demo form below (nothing will be saved).' },
    ctaBtn: { hindi: 'डेमो देखें ↑', en: 'See Demo ↑' },
    contactSubmit: { hindi: 'डेमो रिक्वेस्ट भेजें (सिर्फ डेमो)', en: 'Send Demo Request (demo only)' },
    contactNote: { hindi: 'डेमो फॉर्म: सबमिट पर सिर्फ स्क्रीन पर कन्फर्मेशन दिखेगा। कोई डेटा सेव, ईमेल या WhatsApp सेंड नहीं होगा।', en: 'Demo form: on submit only an on-screen confirmation appears. No data is saved, emailed or sent on WhatsApp.' },
    footerText: { hindi: 'स्टैंडअलोन डेमो लैंडिंग पेज। लाइव Flow99 (flow99.in) से कनेक्टेड नहीं। कोई लॉगिन, पेमेंट, OTP या असली WhatsApp सेंड नहीं।', en: 'Standalone demo landing page. Not connected to live Flow99 (flow99.in). No login, payment, OTP or real WhatsApp send.' },
    tryDemo: { hindi: 'डेमो ट्राई करें', en: 'Try Demo' },
    tryDemo2: { hindi: 'डेमो ट्राई करें', en: 'Try Demo' },
    tryDemo3: { hindi: 'डेमो ट्राई करें', en: 'Try Demo' }
  };

  var els = document.querySelectorAll('[data-i18n]');
  els.forEach(function (el) { if (!el.dataset.orig) el.dataset.orig = el.innerHTML; });

  function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.lang === lang); });
    els.forEach(function (el) {
      var key = el.dataset.i18n;
      if (lang === 'hinglish' || !I18N[key] || !I18N[key][lang]) { el.innerHTML = el.dataset.orig; }
      else { el.innerHTML = I18N[key][lang]; }
    });
    var input = document.getElementById('demoInput');
    if (input) input.placeholder = lang === 'en' ? 'Type like a customer…' : lang === 'hindi' ? 'ग्राहक जैसा मैसेज लिखें…' : 'Yahaan customer jaisa message likho…';
  }
  document.querySelectorAll('.lang-btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  // Reveal on scroll (IntersectionObserver = no scroll jank)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Light parallax: rAF-throttled, desktop only, respects reduced motion
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pxEls = document.querySelectorAll('[data-parallax]');
  var ticking = false;
  function onScroll() {
    if (ticking || reduceMotion || window.innerWidth < 900) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      pxEls.forEach(function (el) {
        var f = parseFloat(el.dataset.parallax || '10');
        el.style.transform = 'translateY(' + (y * f / 1000).toFixed(1) + 'px)';
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hero phone tilt on desktop mouse move
  var stage = document.querySelector('.hero-stage');
  var phone = document.getElementById('heroPhone');
  if (stage && phone && !reduceMotion) {
    stage.addEventListener('mousemove', function (e) {
      if (window.innerWidth < 900) return;
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var yy = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = 'rotateY(' + (-7 + x * 10).toFixed(1) + 'deg) rotateX(' + (2 - yy * 8).toFixed(1) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () { phone.style.transform = ''; });
  }

  // Demo clock
  var clockEl = document.getElementById('demoClock');
  function tickClock() {
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  }
  tickClock(); setInterval(tickClock, 1000);
  function nowTime() { return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }

  // Demo chat — canned replies only
  var chat = document.getElementById('demoChat');
  function addBubble(text, cls) {
    var d = document.createElement('div');
    d.className = 'bubble ' + cls; d.textContent = text; chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight; return d;
  }
  function replyFor(msg) {
    var m = ' ' + msg.toLowerCase() + ' ';
    if (/price|कीमत|rate|charge|kitna|कितना/.test(m)) return currentLang === 'en' ? 'Demo reply: Our services start at ₹299 (demo price). Which service do you want — haircut, facial, or something else?' : 'Demo jawab: Humari service ₹299 se shuru hoti hai (demo price). Aapko kaunsi service chahiye — haircut, facial, ya kuch aur?';
    if (/booking|book|बुक|slot|kal|कल|tomorrow|aaj/.test(m)) return currentLang === 'en' ? 'Demo reply: Done! ✅ Your demo booking is confirmed for tomorrow 11:00 AM. A reminder will come 1 hour before — in this demo, nothing is really booked.' : 'Demo jawab: Done! ✅ Aapki demo booking kal 11:00 AM ke liye confirm hai. Reminder 1 ghanta pehle milega — demo me asli booking nahi hoti.';
    if (/timing|time|samay|समय|khula|open|close|kab/.test(m)) return currentLang === 'en' ? 'Demo reply: We are open 10 AM to 9 PM, every day. And this AI replies even at night — that is the demo idea.' : 'Demo jawab: Hum subah 10 se raat 9 baje tak khule hain, har din. Aur ye AI raat ko bhi jawab deta hai — yehi demo ka idea hai.';
    if (/offer|discount|ऑफर|off|deal/.test(m)) return currentLang === 'en' ? 'Demo reply: Demo offer: 20% off on your first visit (demo only, not a real offer). Want a demo booking with it?' : 'Demo jawab: Demo offer: Pehli visit par 20% off (sirf demo, asli offer nahi). Iske saath demo booking kar doon?';
    if (/namaste|hello|hi\b|hii|hey/.test(m)) return currentLang === 'en' ? 'Demo reply: Hello! 🙏 How can I help — price, timings, or a booking?' : 'Demo jawab: Namaste! 🙏 Kaise madad karoon — price, timing, ya booking?';
    return currentLang === 'en' ? 'Demo reply: Got it! In a real setup the AI would answer from your business details. Try: “price?”, “timing?”, or “booking tomorrow”.' : 'Demo jawab: Samajh gaya! Asli setup me AI aapke business details se jawab dega. Try karo: “price?”, “timing?”, ya “kal booking”.';
  }
  function sendDemo(text) {
    if (!text.trim()) return;
    addBubble(text, 'in');
    var typing = addBubble('AI type kar raha hai…', 'out typing');
    setTimeout(function () {
      typing.remove();
      addBubble(replyFor(text), 'out');
    }, 900);
  }
  var form = document.getElementById('demoForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('demoInput');
    var v = input.value; input.value = ''; sendDemo(v);
  });
  document.querySelectorAll('[data-chip]').forEach(function (b) { b.addEventListener('click', function () { sendDemo(b.dataset.chip); }); });

  // Simulations — timeline only, no send
  var timeline = document.getElementById('timeline');
  var SIMS = {
    broadcast: [
      '📣 Broadcast taiyaar: “Demo offer — 20% off” (demo text)',
      '👥 3 demo customers ko bheja gaya (simulation — koi real send nahi)',
      '✅ 2 ne turant reply kiya, 1 ne demo booking poochhi'
    ],
    booking: [
      '💬 Customer: “Kal 11 baje booking chahiye”',
      '🤖 AI: Slot check kiya (demo) → 11:00 AM khaali hai',
      '✅ Booking confirm + calendar note (demo) — asli booking nahi'
    ],
    reminder: [
      '⏰ Booking: Kal 11:00 AM (demo)',
      '🕙 Reminder time: 10:00 AM — 1 ghanta pehle (demo clock se)',
      '✅ Reminder bheja gaya (simulation) → customer ne “Aa raha hoon” kaha (demo)'
    ]
  };
  document.querySelectorAll('[data-sim]').forEach(function (b) {
    b.addEventListener('click', function () {
      var steps = SIMS[b.dataset.sim] || [];
      timeline.innerHTML = '';
      steps.forEach(function (s, i) {
        setTimeout(function () {
          var p = document.createElement('p');
          p.innerHTML = '<span class="time">' + nowTime() + '</span> <span class="ok">✓ Step ' + (i + 1) + ':</span> ' + s;
          timeline.appendChild(p);
        }, i * 700);
      });
    });
  });

  // Pricing toggle
  document.querySelectorAll('.bill-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.bill-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      var yearly = b.dataset.bill === 'yearly';
      document.querySelectorAll('[data-price-monthly]').forEach(function (el) { el.hidden = yearly; });
      document.querySelectorAll('[data-price-yearly]').forEach(function (el) { el.hidden = !yearly; });
    });
  });

  // Contact demo form — shows confirmation only, saves nothing
  var cForm = document.getElementById('contactForm');
  if (cForm) cForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('formMsg');
    var name = document.getElementById('cName').value.trim();
    msg.textContent = currentLang === 'en'
      ? 'Demo confirmation: Thanks' + (name ? ', ' + name : '') + '! This is a demo only — nothing was saved or sent.'
      : 'Demo confirmation: Dhanyavaad' + (name ? ', ' + name : '') + '! Ye sirf demo hai — kuch save ya send nahi hua.';
    msg.hidden = false;
    cForm.reset();
  });
})();
