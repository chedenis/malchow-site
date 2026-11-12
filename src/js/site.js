// Malchow Tree site script. No libraries.
(function () {
  'use strict';

  var OVERRIDE_KEY = 'malchow-owner-override';
  var REF_KEY = 'malchow-ref';

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  // ---- Settings: /config.json, plus an owner preview override on this device only ----
  function loadConfig() {
    return fetch('/config.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (cfg) {
        var raw = safeGet(OVERRIDE_KEY);
        if (raw) {
          try {
            var o = JSON.parse(raw);
            cfg = Object.assign({}, cfg, o, { offers: Object.assign({}, cfg.offers || {}, o.offers || {}) });
            cfg._preview = true;
          } catch (e) {}
        }
        return cfg;
      });
  }

  function inWindow(start, end, now) {
    if (!start || !end) return true;
    var md = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    return start <= end ? (md >= start && md <= end) : (md >= start || md <= end);
  }

  function activeOffers(cfg) {
    var now = new Date();
    var list = (window.MALCHOW && window.MALCHOW.offers) || [];
    return list.filter(function (o) {
      var s = (cfg.offers || {})[o.code];
      if (!s || !s.on) return false;
      if (s.ignoreDates) return true;
      return inWindow(o.start, o.end, now);
    });
  }

  function applyConfig(cfg) {
    var M = window.MALCHOW || {};
    var offers = activeOffers(cfg);
    var codes = offers.map(function (o) { return o.code; });
    window.MALCHOW.activeCodes = codes;

    // Banner
    var banner = document.getElementById('top-banner');
    if (banner) {
      if (cfg.stormMode) {
        banner.className = 'banner storm';
        banner.innerHTML = '<strong>Storm damage?</strong> Text photos to <a href="sms:' + M.phoneHref + '">' + M.phone + '</a>. We answer 24/7, life-safety calls first.';
        banner.hidden = false;
      } else {
        var hero = offers.filter(function (o) { return o.code === cfg.heroOffer; })[0] || offers.filter(function (o) { return o.code !== 'BRANCH'; })[0];
        if (hero) {
          banner.className = 'banner';
          banner.innerHTML = '<strong>' + hero.name + ':</strong> ' + hero.line + '. Use code <a href="/quote?code=' + hero.code + '">' + hero.code + '</a>';
          banner.hidden = false;
        } else {
          banner.hidden = true;
        }
      }
      if (cfg._preview) banner.innerHTML += ' <span style="opacity:.75">(owner preview)</span>';
    }

    // Hero offer pill
    var heroOffer = document.getElementById('hero-offer');
    if (heroOffer) {
      var h = offers.filter(function (o) { return o.code === cfg.heroOffer; })[0];
      if (cfg.stormMode) {
        heroOffer.innerHTML = '<b>Storm damage?</b> Text photos to ' + M.phone + ' any time.';
        heroOffer.hidden = false;
      } else if (h) {
        heroOffer.innerHTML = '<b>' + h.name + ':</b> ' + h.line + ' &middot; code ' + h.code;
        heroOffer.hidden = false;
      } else heroOffer.hidden = true;
    }

    // Home offer panel shows the chosen hero offer
    var panel = document.getElementById('offer-panel');
    if (panel) {
      var ho = offers.filter(function (o) { return o.code === cfg.heroOffer; })[0];
      if (ho) {
        panel.querySelector('[data-offer-name]').textContent = ho.name;
        panel.querySelector('[data-offer-line]').textContent = ho.line;
        panel.querySelector('[data-offer-detail]').textContent = ho.detail;
        panel.querySelector('[data-offer-code]').textContent = ho.code;
        panel.querySelector('[data-offer-link]').href = '/quote?code=' + ho.code;
        panel.hidden = false;
      } else panel.hidden = true;
    }

    // Any element tagged with data-offer only shows while that offer is on
    document.querySelectorAll('[data-offer]').forEach(function (el) {
      el.hidden = codes.indexOf(el.getAttribute('data-offer')) === -1;
    });
    var none = document.getElementById('no-offers');
    if (none) none.hidden = document.querySelectorAll('.offer-card[data-offer]:not([hidden])').length > 0;
    document.querySelectorAll('[data-storm-only]').forEach(function (el) { el.hidden = !cfg.stormMode; });
  }

  // ---- Mobile menu ----
  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var nav = document.getElementById('mobile-nav');
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Hero: wide photo pans sideways as you scroll ----
  var pan = document.querySelector('.hero-pan img');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (pan && !reduce) {
    var hero = pan.closest('.hero');
    var ticking = false;
    var update = function () {
      ticking = false;
      var box = hero.getBoundingClientRect();
      var extra = pan.getBoundingClientRect().width - box.width;
      if (extra <= 0) { pan.style.transform = 'none'; return; }
      // progress 0 at page top, 1 when the hero has scrolled out
      var p = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height)));
      // start showing the left (open sky for the headline), drift right toward the tree
      var start = extra * 0.15;
      var x = start + (extra - start) * p;
      pan.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (pan.complete) update(); else pan.addEventListener('load', update);
  }

  // ---- Before/after slider ----
  document.querySelectorAll('.ba').forEach(function (ba) {
    var r = ba.querySelector('input[type=range]');
    var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set);
    set();
  });

  // ---- Referral: remember ?ref= for the quote form ----
  var params = new URLSearchParams(location.search);
  var ref = params.get('ref');
  if (ref) {
    ref = ref.replace(/[^a-z\-]/gi, '').toUpperCase().slice(0, 30);
    if (ref) safeSet(REF_KEY, ref);
  }

  // ---- Branch Out link maker ----
  var maker = document.getElementById('ref-maker');
  if (maker) {
    var out = document.getElementById('ref-out');
    maker.addEventListener('submit', function (e) {
      e.preventDefault();
      var last = maker.lastname.value.replace(/[^a-z\-]/gi, '').toUpperCase();
      if (!last) return;
      var link = location.origin + '/branch-out?ref=' + encodeURIComponent(last);
      out.hidden = false;
      out.querySelector('[data-ref-link]').value = link;
      out.querySelector('[data-ref-code]').textContent = 'BRANCH-' + last;
      var msg = 'We used Malchow Tree for our trees and they did a great job. Use my link for $[50] off your first job: ' + link;
      out.querySelector('[data-ref-sms]').href = 'sms:?&body=' + encodeURIComponent(msg);
      out.querySelector('[data-ref-email]').href = 'mailto:?subject=' + encodeURIComponent('Our tree people') + '&body=' + encodeURIComponent(msg);
    });
    var copy = document.getElementById('ref-copy');
    if (copy) copy.addEventListener('click', function () {
      var inp = out.querySelector('[data-ref-link]');
      inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(function () {
        copy.textContent = 'Copied';
      }, function () { document.execCommand && document.execCommand('copy'); copy.textContent = 'Copied'; });
    });
  }
  var refWelcome = document.getElementById('ref-welcome');
  if (refWelcome && ref) {
    refWelcome.hidden = false;
    refWelcome.querySelector('[data-ref-name]').textContent = 'the ' + ref.charAt(0) + ref.slice(1).toLowerCase() + ' family';
  }

  // ---- Quote form ----
  function compressImage(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type)) return resolve(null);
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight;
        var s = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', data: c.toDataURL('image/jpeg', 0.72) });
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function checkCode(code) {
    code = (code || '').trim().toUpperCase();
    if (!code) return { ok: true, empty: true };
    var active = (window.MALCHOW && window.MALCHOW.activeCodes) || [];
    if (/^BRANCH-[A-Z\-]+$/.test(code)) return { ok: active.indexOf('BRANCH') > -1, code: code, name: 'Branch Out' };
    var o = ((window.MALCHOW && window.MALCHOW.offers) || []).filter(function (x) { return x.code === code; })[0];
    if (o && active.indexOf(code) > -1) return { ok: true, code: code, name: o.name };
    return { ok: false, code: code };
  }

  document.querySelectorAll('form.quote-form').forEach(function (form) {
    var step1 = form.querySelector('[data-step="1"]');
    var step2 = form.querySelector('[data-step="2"]');
    var done = form.querySelector('[data-step="done"]');
    var msg = form.querySelector('.form-msg');
    var leadId = null;
    var photos = [];

    var codeInput = form.querySelector('[name=promo]');
    var codeStatus = form.querySelector('.code-status');
    var presetCode = params.get('code') || (safeGet(REF_KEY) ? 'BRANCH-' + safeGet(REF_KEY) : '');
    if (codeInput && presetCode) codeInput.value = presetCode.toUpperCase();
    function showCode() {
      if (!codeInput || !codeStatus) return;
      var r = checkCode(codeInput.value);
      if (r.empty) { codeStatus.textContent = ''; codeStatus.className = 'code-status'; return; }
      codeStatus.textContent = r.ok ? '✓ ' + r.name + ' will be applied to your quote.' : 'We don’t recognize that code right now. We’ll still check it when we quote.';
      codeStatus.className = 'code-status ' + (r.ok ? 'ok' : 'bad');
    }
    if (codeInput) { codeInput.addEventListener('input', showCode); document.addEventListener('malchow:config', showCode); }

    var fileInput = form.querySelector('[name=photos]');
    if (fileInput) fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files, 0, 5);
      var thumbs = form.querySelector('.thumbs');
      thumbs.innerHTML = '';
      Promise.all(files.map(compressImage)).then(function (list) {
        photos = list.filter(Boolean);
        photos.forEach(function (p) { var i = document.createElement('img'); i.src = p.data; i.alt = ''; thumbs.appendChild(i); });
        if (fileInput.files.length > 5) { msg.className = 'form-msg err'; msg.textContent = 'We kept the first 5 photos.'; msg.hidden = false; }
      });
    });

    function send(payload) {
      return fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Send failed'); return j; }); });
    }
    function fail() {
      msg.hidden = false; msg.className = 'form-msg err';
      msg.innerHTML = 'That didn’t go through. Call or text us at <a href="tel:' + window.MALCHOW.phoneHref + '">' + window.MALCHOW.phone + '</a> and we’ll take it from there.';
    }
    function busy(btn, on) { btn.disabled = on; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = on ? 'Sending…' : btn.dataset.label; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;
      var btn = form.querySelector('[data-step]:not([hidden]) button[type=submit]');
      if (!step1.hidden) {
        if (!form.reportValidity()) return;
        busy(btn, true);
        send({
          stage: 'lead', kind: form.dataset.kind || 'quote',
          name: form.name.value, phone: form.phone.value, location: form.location.value,
          textOk: form.textOk ? form.textOk.checked : false,
          page: location.pathname
        }).then(function (j) {
          leadId = j.id;
          step1.hidden = true;
          if (step2) { step2.hidden = false; var f = step2.querySelector('input,select,textarea'); if (f) f.focus(); }
          else { done.hidden = false; }
        }).catch(fail).then(function () { busy(btn, false); });
        return;
      }
      busy(btn, true);
      var fd = new FormData(form);
      send({
        stage: 'details', id: leadId, kind: form.dataset.kind || 'quote',
        name: form.name.value, phone: form.phone.value,
        service: fd.getAll('service'), trees: fd.get('trees'), hazard: fd.get('hazard'),
        when: fd.get('when'), promo: (fd.get('promo') || '').toUpperCase(), notes: fd.get('notes'),
        email: fd.get('email'), photos: photos
      }).then(function () {
        step2.hidden = true; done.hidden = false;
      }).catch(fail).then(function () { busy(btn, false); });
    });
    var skip = form.querySelector('[data-skip]');
    if (skip) skip.addEventListener('click', function () { step2.hidden = true; done.hidden = false; });
  });

  // Fill service type from ?service=
  var svc = params.get('service');
  if (svc) document.querySelectorAll('input[name=service][value="' + svc.replace(/"/g, '') + '"]').forEach(function (i) { i.checked = true; });

  loadConfig().then(function (cfg) {
    window.MALCHOW.config = cfg;
    applyConfig(cfg);
    document.dispatchEvent(new CustomEvent('malchow:config', { detail: cfg }));
  });
  window.MALCHOW.loadConfig = loadConfig;
  window.MALCHOW.OVERRIDE_KEY = OVERRIDE_KEY;
})();
