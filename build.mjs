// Builds the static site into ./public. Run: node build.mjs
// No dependencies. Vercel runs this on every push.
import { mkdirSync, writeFileSync, cpSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { biz, trust, towns, services, offers, offerRules, reviews } from './src/data.mjs';

const OUT = 'public';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync('src/css', join(OUT, 'css'), { recursive: true });
cpSync('src/js', join(OUT, 'js'), { recursive: true });
cpSync('src/img', join(OUT, 'img'), { recursive: true });
cpSync('config.json', join(OUT, 'config.json'));


const v = Date.now().toString(36); // cache-buster for css/js

// Turn [PLACEHOLDER] style brackets into visible highlighted text.
const ph = (s) => String(s).replace(/(\$?\[[^\]]+\]["%]?)/g, '<span class="ph">$1</span>');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const smsHref = `sms:${biz.phoneHref}`;
const telHref = `tel:${biz.phoneHref}`;

const _unusedLogo = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--c-forest)"/><g fill="none" stroke="#f5efe3" stroke-width="2"><circle cx="25" cy="25" r="16"/><circle cx="25.5" cy="25.5" r="11"/><circle cx="26" cy="26" r="6"/></g><path d="M24 2 L28 24 L24 26 Z" fill="var(--c-safety)"/></svg>`;

const icons = {
  'tree-removal': '<path d="M24 4c-7 0-12 5-12 11 0 2 .5 3.5 1.4 5C10.6 21.6 9 24.5 9 28c0 6 5 10 11 10h2v6h4v-6h2c6 0 11-4 11-10 0-3.5-1.6-6.4-4.4-8 .9-1.5 1.4-3 1.4-5C36 9 31 4 24 4Z" fill="currentColor" opacity=".25"/><path d="M6 44h36M34 10l8-6M30 14l12-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>',
  'tree-trimming': '<circle cx="14" cy="34" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="14" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M19 17l23 15M19 31l23-15" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  'stump-grinding': '<ellipse cx="24" cy="18" rx="16" ry="6" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="24" cy="18" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 18v14c0 3.3 7.2 6 16 6s16-2.7 16-6V18" fill="none" stroke="currentColor" stroke-width="3"/>',
  'storm-damage': '<path d="M12 20a10 10 0 0 1 19-4 8 8 0 1 1 3 15H14a7 7 0 0 1-2-11Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 30l-4 8h6l-3 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  'lot-clearing': '<path d="M4 40h40" stroke="currentColor" stroke-width="3"/><path d="M12 40V28M12 28l-6 4M12 28l5 3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M30 40l2-8 6 2" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="12" cy="20" r="7" fill="currentColor" opacity=".25"/>',
  'plant-health-care': '<path d="M24 42V20" stroke="currentColor" stroke-width="3"/><path d="M24 22c0-8 6-14 16-14 0 10-6 16-16 14ZM24 28c0-6-5-11-14-11 0 8 5 12 14 11Z" fill="currentColor" opacity=".3" stroke="currentColor" stroke-width="2.5"/>',
};
const icon = (slug) => `<svg class="service-icon" viewBox="0 0 48 48" aria-hidden="true">${icons[slug] || ''}</svg>`;

const navLinks = [
  ['/services', 'Services'],
  ['/service-area', 'Service area'],
  ['/offers', 'Offers'],
  ['/plan', 'Seasonal Care Plan'],
  ['/about', 'About'],
];

function photoPh(what) {
  return `<div class="photo-ph"><div><b>Photo needed</b>${esc(what)}</div></div>`;
}

const clientData = {
  phone: biz.phone,
  phoneHref: biz.phoneHref,
  offers: offers.map(({ code, name, line, detail, start, end }) => ({ code, name, line: line.replace(/\[|\]/g, ''), detail: detail.replace(/\[|\]/g, ''), start, end })),
};

function layout({ title, desc, path, body, schema, noindex = false, hideBar = false }) {
  const canonical = biz.url + (path === '/' ? '' : path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#1f3a2b">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@87..100,600..800&family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/brand-tokens.css?v=${v}">
<link rel="stylesheet" href="/css/tokens.css?v=${v}">
<link rel="stylesheet" href="/css/site.css?v=${v}">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
<script>window.MALCHOW=${JSON.stringify(clientData)};</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div id="top-banner" class="banner" hidden></div>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="/"><img src="/img/logo/malchow-horizontal-color.svg" alt="${biz.name}" width="196" height="45"></a>
    <nav class="nav" aria-label="Main">${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav>
    <a class="header-call" href="${telHref}">${biz.phone}</a>
    <a class="btn btn-primary header-quote" href="/quote" style="padding:10px 18px;font-size:.98rem">Free quote</a>
    <button class="menu-btn" aria-expanded="false" aria-controls="mobile-nav">Menu</button>
  </div>
  <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile">${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="/branch-out">Branch Out referrals</a><a href="${telHref}">Call ${biz.phone}</a></nav>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="logo" href="/"><img src="/img/logo/malchow-horizontal-reversed.svg" alt="${biz.name}" width="220" height="51"></a>
        <p style="margin-top:14px">Tree removal, trimming, stump grinding and storm cleanup for ${towns.slice(0, -1).map((t) => t.name).join(', ')} and ${towns.at(-1).name}. Owned and run by ${biz.owners}.</p>
      </div>
      <div>
        <h3>Reach us</h3>
        <ul>
          <li><a href="${telHref}">Call ${biz.phone}</a></li>
          <li><a href="${smsHref}">Text ${biz.phone}</a></li>
          <li><a href="mailto:${biz.email}">${biz.email}</a></li>
          <li>${biz.hours}</li>
        </ul>
      </div>
      <div>
        <h3>Services</h3>
        <ul>${services.map((s) => `<li><a href="/services/${s.slug}">${s.name}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h3>More</h3>
        <ul>
          <li><a href="/offers">Offers</a></li>
          <li><a href="/branch-out">Branch Out referrals</a></li>
          <li><a href="/plan">Seasonal Care Plan</a></li>
          <li><a href="/check">Is that tree leaning?</a></li>
          <li><a href="/service-area">Service area</a></li>
          <li>${biz.facebook ? `<a href="${biz.facebook}">Facebook</a>` : ph('[Facebook link]')} · ${biz.instagram ? `<a href="${biz.instagram}">Instagram</a>` : ph('[Instagram link]')}</li>
        </ul>
      </div>
    </div>
    <div class="legal">
      ISA Certified Arborist #${ph('[PLACEHOLDER]')} · Fully insured: ${ph('$[PLACEHOLDER]')} general liability and workers’ comp. Certificate of insurance on request. ${ph('[Colorado / city license # if any]')}<br>
      © ${new Date().getFullYear()} ${biz.name}, ${biz.city}, Colorado.
    </div>
  </div>
</footer>
${hideBar ? '' : `<nav class="mobile-bar" aria-label="Quick contact">
  <a href="${telHref}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"/></svg>Call</a>
  <a href="${smsHref}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-3 9H7V9h10Zm-4 4H7v-2h6Z"/></svg>Text</a>
  <a href="/quote"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm-1 7V3.5L18.5 9ZM8 13h8v2H8Zm0 4h5v2H8Z"/></svg>Free quote</a>
</nav>`}
<script src="/js/site.js?v=${v}" defer></script>
</body>
</html>`;
}

function write(path, html) {
  const file = path === '/' ? join(OUT, 'index.html') : join(OUT, path.replace(/^\//, '') + '.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function quoteForm({ kind = 'quote', title = 'Get a free quote', intro = 'Three quick things and we’ll call or text you back, usually same day.', detailsTitle = 'Thanks. A few more details help us price it right.' } = {}) {
  const id = `f-${kind}`;
  const serviceChoices = services.map((s) => `<label><input type="checkbox" name="service" value="${s.slug}"> ${s.name}</label>`).join('');
  const plan = kind === 'plan';
  return `<form class="form-card quote-form" data-kind="${kind}" novalidate>
  <div data-step="1">
    <h2>${title}</h2>
    <p class="small">${intro}</p>
    <div class="field"><label for="${id}-name">Your name</label><input id="${id}-name" name="name" type="text" autocomplete="name" required></div>
    <div class="field"><label for="${id}-phone">Phone</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>
    <div class="field"><label for="${id}-loc">Street address or ZIP <span class="hint">(so we know where the tree is)</span></label><input id="${id}-loc" name="location" type="text" autocomplete="street-address" required></div>
    <div class="field"><label style="font-weight:400;display:flex;gap:10px;align-items:flex-start"><input type="checkbox" name="textOk" value="yes" style="margin-top:5px;accent-color:var(--c-safety)"> <span>OK to text me about my quote and appointment. <span class="hint">Message and data rates may apply. Reply STOP to opt out any time.</span></span></label></div>
    <button class="btn btn-primary btn-lg" type="submit" style="width:100%">${plan ? 'Sign me up' : 'Get my free quote'}</button>
    <p class="small" style="margin-top:10px">Rather talk? Call or text <a href="${telHref}">${biz.phone}</a>.</p>
  </div>
  <div data-step="2" hidden>
    <p class="form-progress">Got it, ${plan ? 'you’re on our list' : 'your request is in'}. Step 2 of 2 (optional, but it helps).</p>
    <h2>${detailsTitle}</h2>
    ${plan ? '' : `<fieldset class="field"><legend>What do you need?</legend><div class="choice-row">${serviceChoices}<label><input type="checkbox" name="service" value="not-sure"> Not sure</label></div></fieldset>`}
    <div class="field"><label for="${id}-trees">How many trees?</label><select id="${id}-trees" name="trees"><option value="">Pick one</option><option>1</option><option>2 to 3</option><option>4 to 6</option><option>7 or more</option><option>Not sure</option></select></div>
    ${plan ? '' : `<fieldset class="field"><legend>Is anything on a house, car or power line right now?</legend><div class="choice-row">
      <label><input type="radio" name="hazard" value="no"> No</label>
      <label><input type="radio" name="hazard" value="house-or-car"> Yes, house or car</label>
      <label><input type="radio" name="hazard" value="power-line"> Yes, a power line</label>
      <label><input type="radio" name="hazard" value="leaning"> Not yet, but it’s leaning</label></div>
      <p class="small" style="margin-top:8px">If a tree is touching a power line, stay away and call Xcel at 1-800-895-1999 first.</p></fieldset>
    <div class="field"><label for="${id}-photos">Photos <span class="hint">(up to 5; the whole tree plus anything under it)</span></label><input id="${id}-photos" name="photos" type="file" accept="image/*" multiple><div class="thumbs"></div></div>`}
    <fieldset class="field"><legend>Best time for us to come look?</legend><div class="choice-row">
      <label><input type="radio" name="when" value="weekday-morning"> Weekday morning</label>
      <label><input type="radio" name="when" value="weekday-afternoon"> Weekday afternoon</label>
      <label><input type="radio" name="when" value="saturday"> Saturday</label>
      <label><input type="radio" name="when" value="any"> Any time, I don’t need to be home</label></div></fieldset>
    <div class="form-row">
      <div class="field"><label for="${id}-email">Email <span class="hint">(for the written quote)</span></label><input id="${id}-email" name="email" type="email" autocomplete="email"></div>
      ${plan ? '' : `<div class="field"><label for="${id}-promo">Promo or referral code</label><input id="${id}-promo" name="promo" type="text" autocapitalize="characters" placeholder="FIRSTCUT"><div class="code-status" aria-live="polite"></div></div>`}
    </div>
    <div class="field"><label for="${id}-notes">Anything else?</label><textarea id="${id}-notes" name="notes" rows="3" placeholder="Gate code, dog in the yard, which tree it is…"></textarea></div>
    <button class="btn btn-primary btn-lg" type="submit" style="width:100%">Send details</button>
    <p style="text-align:center;margin-top:10px"><button type="button" data-skip class="btn btn-ghost" style="padding:8px 16px;font-size:.9rem">Skip, just call me</button></p>
  </div>
  <div data-step="done" hidden>
    <h2>Thanks, we’ve got it.</h2>
    <p>${plan ? `One of us (${biz.owners.replace(' Malchow', '')}) will call to set up your first walk-through.` : 'We’ll call or text you back, usually the same day. If a tree is on your house or a line, call or text now:'} <a href="${telHref}">${biz.phone}</a>.</p>
  </div>
  <div class="form-msg" hidden role="status"></div>
</form>`;
}

const cta = `<section class="cta-band"><div class="wrap"><div><h2>Got a tree that’s worrying you?</h2><p style="margin:0">Send a photo. We’ll give you a straight answer and a free quote.</p></div><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary btn-lg" href="/quote">Get a free quote</a><a class="btn btn-lg" style="color:#fff;border-color:#fff" href="${smsHref}">Text ${biz.phone}</a></div></div></section>`;

const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': biz.url + '/#business',
  name: biz.name,
  alternateName: biz.short,
  description: 'Tree removal, trimming and pruning, stump grinding, emergency storm response, lot clearing and plant health care in Boulder and Broomfield counties, Colorado.',
  url: biz.url,
  telephone: biz.phoneHref,
  email: biz.email,
  image: biz.url + '/img/hero.jpg',
  logo: biz.url + '/img/logo/malchow-mark-color.svg',
  priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: biz.city, addressRegion: biz.state, postalCode: biz.zip, addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: 39.9528, longitude: -105.1686 },
  areaServed: towns.map((t) => ({ '@type': 'City', name: `${t.name}, CO` })),
  founder: [{ '@type': 'Person', name: 'Forest Malchow' }, { '@type': 'Person', name: 'Ryan Malchow' }],
  openingHours: 'Mo-Sa 07:00-18:00',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Tree services', itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: `${biz.url}/services/${s.slug}` } })) },
};

// ---------------- Home ----------------
write('/', layout({
  title: `${biz.name} | Tree removal and trimming in ${biz.city}, CO`,
  desc: `Tree removal, trimming, stump grinding and 24/7 storm help in Superior, Louisville, Boulder, Broomfield and nearby. Free quotes. Call or text ${biz.phone}.`,
  path: '/',
  schema: businessSchema,
  body: `
<section class="hero">
  <div class="hero-pan"><img src="/img/hero.jpg" alt="An arborist in a helmet and harness roped into a big cottonwood on a Superior street at sunset" width="1344" height="672" fetchpriority="high"></div>
  <div class="wrap">
    <p class="eyebrow" style="color:#ffd9a8">Tree service in ${biz.city} and the Boulder County area</p>
    <h1>Big trees, done right, yard left clean.</h1>
    <p>Removals, pruning and stump grinding from a local crew that shows up when we say and rakes up before we leave.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="/quote">Get a free quote</a>
      <a class="hero-call" href="${telHref}">${biz.phone}<small>Tap to call or text, storm line 24/7</small></a>
    </div>
    <div id="hero-offer" class="hero-offer" hidden></div>
  </div>
</section>
<section class="trust" aria-label="Why people trust us"><ul>${trust.map((t) => `<li><b>${ph(t.big)}</b><span>${ph(t.small)}</span></li>`).join('')}</ul></section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">What we do</p>
    <h2>Tree work for homes along the Front Range</h2>
    <p class="lede">Dead ash, a split maple over the garage, a stump in the way of new sod. Here’s what we handle, and every job includes cleanup and haul-off.</p>
    <div class="grid grid-3" style="margin-top:28px">
      ${services.map((s) => `<a class="card" href="/services/${s.slug}">${icon(s.slug)}<h3>${s.name}</h3><p>${s.short}</p><span class="more">Learn more</span></a>`).join('')}
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <p class="eyebrow">How it works</p>
    <h2>From photo to clean yard</h2>
    <ol class="steps" style="margin-top:24px">
      <li><h3>Send a photo or call</h3><p>Fill out the quote form, or text a picture of the tree to ${biz.phone}. Most people hear back the same day.</p></li>
      <li><h3>We walk it with you</h3><p>${biz.owners.replace(' Malchow', '')} come out, look at the tree and what’s around it, and give you a written price. No pressure.</p></li>
      <li><h3>We do the work and clean up</h3><p>The crew shows up in the window we gave you, works safe, and rakes, blows and hauls everything away.</p></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div id="offer-panel" class="offer-panel" hidden>
      <div>
        <p class="eyebrow" style="color:#ffd9a8">New customer offer</p>
        <h2 data-offer-name>First Cut</h2>
        <p style="font-size:1.3rem;color:#fff;font-weight:700" data-offer-line></p>
        <p data-offer-detail></p>
        <p class="small" style="color:#c6cfc1">${offerRules}</p>
      </div>
      <div style="text-align:center">
        <p style="margin-bottom:8px;color:#fff">Use code</p>
        <p><span class="code-chip" data-offer-code style="font-size:1.6rem">FIRSTCUT</span></p>
        <a class="btn btn-primary btn-lg" data-offer-link href="/quote?code=FIRSTCUT">Get my quote</a>
        <p style="margin-top:12px"><a href="/offers" style="color:#fff">See all offers</a></p>
      </div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <p class="eyebrow">Before and after</p>
    <h2>See the difference</h2>
    <p class="lede">Drag the handle. ${ph('[PLACEHOLDER]')} Real before and after photos from a Malchow Tree job go here.</p>
    <div class="ba" style="margin-top:24px">
      <div class="ba-layer"><div class="ba-ph before"><div><b>Before photo</b><br>Dead ash leaning toward the garage</div></div></div>
      <div class="ba-layer ba-after"><div class="ba-ph after"><div><b>After photo</b><br>Same yard, tree gone, stump ground, lawn raked</div></div></div>
      <span class="ba-label l">Before</span><span class="ba-label r">After</span>
      <div class="ba-handle"></div>
      <input type="range" min="0" max="100" value="50" aria-label="Slide to compare before and after">
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">Reviews</p>
    <h2>What neighbors say</h2>
    ${reviews.length ? `<div class="grid grid-3" style="margin-top:24px">${reviews.map((r) => `<figure class="review"><div class="stars" aria-label="${r.stars} stars">${'★'.repeat(r.stars)}</div><blockquote>${esc(r.text)}</blockquote><figcaption><b>${esc(r.name)}</b>, ${esc(r.town)}</figcaption></figure>`).join('')}</div>`
      : `<div class="empty-note" style="margin-top:20px">${ph('[PLACEHOLDER]')} 3 to 5 real Google reviews go here, with first name and town. We only post real ones. ${biz.google ? `<a href="${biz.google}">Read our Google reviews</a>` : ''}</div>`}
  </div>
</section>

<section class="section alt">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">Where we work</p>
      <h2>Based in ${biz.city}, working all over Boulder and Broomfield counties</h2>
      <ul class="towns" style="margin-top:20px">${towns.map((t) => `<li><a href="/service-area#${t.name.toLowerCase()}">${t.name}</a></li>`).join('')}</ul>
      <p>Just outside these towns? Ask anyway. <a href="/service-area">More about our service area</a></p>
    </div>
    <div class="card">
      <p class="eyebrow">Seasonal Care Plan</p>
      <h3>A yearly checkup and first in line after storms</h3>
      <p>A yearly walk-through from Forest or Ryan, first in line after storms, and ${ph('[10]%')} off any work that year. ${ph('$[PRICE]')} a year.</p>
      <a class="more" href="/plan">See the plan</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">About us</p>
      <h2>Local owners who answer their own phone</h2>
      <p>${ph('[PLACEHOLDER]')} ${biz.owners} started Malchow Tree in ${ph('[YEAR]')}. Their story in their own words goes here: how they got into climbing, what they care about on a job, why they stay local.</p>
      <p>When you call, you get one of us. When the crew shows up, one of us is there.</p>
      <a class="btn btn-ghost" href="/about">More about us</a>
    </div>
    ${photoPh('Forest and Ryan with the truck, both in work gear')}
  </div>
</section>

<section class="section alt" id="quote">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">Free quote</p>
      <h2>Tell us about your tree</h2>
      <p class="lede">Takes about 30 seconds. We’ll call or text back, usually the same day.</p>
      <ul class="checklist" style="margin-top:20px">
        <li>Free, written quote. No pressure.</li>
        <li>Cleanup and haul-off in every price.</li>
        <li>Insured. Certificate on request.</li>
        <li>Storm emergency? Text photos to <a href="${smsHref}">${biz.phone}</a> any time.</li>
      </ul>
      <div class="card" style="margin-top:20px" data-offer="BRANCH" hidden><p style="margin:0">Did a neighbor send you? Put their <b>BRANCH-</b> code in step 2 and you both save. <a href="/branch-out">How Branch Out works</a></p></div>
    </div>
    ${quoteForm()}
  </div>
</section>
${cta}`,
}));

// ---------------- Services ----------------
write('/services', layout({
  title: `Tree services | ${biz.name}`,
  desc: `Tree removal, trimming, stump grinding, storm cleanup, lot clearing and plant health care around ${biz.city}, CO.`,
  path: '/services',
  body: `<section class="page-hero"><div class="wrap"><h1>Tree services</h1><p>Every job includes cleanup and haul-off. Every price is written down before we start.</p></div></section>
<section class="section"><div class="wrap"><div class="grid grid-3">${services.map((s) => `<a class="card" href="/services/${s.slug}">${icon(s.slug)}<h3>${s.name}</h3><p>${s.short}</p><span class="more">Learn more</span></a>`).join('')}</div></div></section>${cta}`,
}));

for (const s of services) {
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/\[|\]/g, '') } })) };
  const serviceSchema = { '@context': 'https://schema.org', '@type': 'Service', name: s.name, serviceType: s.name, provider: { '@id': biz.url + '/#business' }, areaServed: towns.map((t) => `${t.name}, CO`) };
  write(`/services/${s.slug}`, layout({
    title: `${s.name} in ${biz.city}, Louisville and Boulder | ${biz.short}`,
    desc: `${s.short} Serving ${towns.map((t) => t.name).join(', ')}. Free quotes: ${biz.phone}.`,
    path: `/services/${s.slug}`,
    schema: [businessSchema, serviceSchema, faqSchema],
    body: `<section class="page-hero"><div class="wrap"><p class="crumbs"><a href="/services">Services</a> /</p><h1>${s.name}</h1><p>${s.short}</p>
${s.slug === 'storm-damage' ? `<p style="margin-top:16px"><a class="btn btn-primary btn-lg" href="${smsHref}">Text photos to ${biz.phone}</a></p>` : `<p style="margin-top:16px"><a class="btn btn-primary btn-lg" href="/quote?service=${s.slug}">Get a free quote</a></p>`}</div></section>
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <p style="font-size:1.15rem">${ph(s.intro)}</p>
    <h2 style="margin-top:30px">What’s included</h2>
    <ul class="checklist">${s.included.map((i) => `<li>${ph(i)}</li>`).join('')}</ul>
    <div class="grid grid-2" style="margin:30px 0">${photoPh(s.photoNote)}${photoPh('finished yard after cleanup')}</div>
    <h2>Questions people ask</h2>
    ${s.faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${ph(a)}</p></details>`).join('')}
  </div>
  <aside class="side-box">
    <h3>Get a price</h3>
    <p class="small">Send a photo and we’ll get back to you, usually the same day.</p>
    <p><a class="btn btn-primary" style="width:100%" href="/quote?service=${s.slug}">Free quote</a></p>
    <p><a class="btn btn-ghost" style="width:100%" href="${telHref}">Call ${biz.phone}</a></p>
    ${s.slug === 'storm-damage' ? `<p class="small">Promo codes don’t apply to emergency storm work.</p>` : `<p class="small" data-offer="FIRSTCUT" hidden>First time with us? <b>First Cut</b>: $100 off any removal over $1,000, code <b>FIRSTCUT</b>.</p>`}
    <p class="small">Working in ${towns.map((t) => t.name).join(', ')}.</p>
  </aside>
</div></section>${cta}`,
  }));
}

// ---------------- Service area ----------------
write('/service-area', layout({
  title: `Service area: ${towns.map((t) => t.name).slice(0, 5).join(', ')} and more | ${biz.short}`,
  desc: `Malchow Tree works in ${towns.map((t) => t.name).join(', ')}, Colorado. Based in ${biz.city}.`,
  path: '/service-area',
  schema: businessSchema,
  body: `<section class="page-hero"><div class="wrap"><h1>Where we work</h1><p>We’re based in ${biz.city} and work across Boulder and Broomfield counties, plus the edges of Jefferson and Adams. If you’re close but not listed, call anyway.</p></div></section>
<section class="section"><div class="wrap">
  <ul class="towns">${towns.map((t) => `<li><a href="#${t.name.toLowerCase()}">${t.name}</a></li>`).join('')}</ul>
  ${towns.map((t) => `<div class="town-block" id="${t.name.toLowerCase()}"><h2>Tree service in ${t.name}, CO</h2><p class="small">${t.county}</p><p>${t.note}</p><p><a href="/quote">Get a free quote in ${t.name}</a> · <a href="${telHref}">${biz.phone}</a></p></div>`).join('')}
</div></section>${cta}`,
}));

// ---------------- Offers ----------------
write('/offers', layout({
  title: `Offers and discounts | ${biz.short}`,
  desc: `Current tree service offers from Malchow Tree: First Cut ($100 off removals over $1,000), Branch Out referrals, Hometown Discount and more.`,
  path: '/offers',
  body: `<section class="page-hero"><div class="wrap"><h1>Offers</h1><p>Ways to save on tree work. Mention the code when you call, or type it in step 2 of the quote form.</p></div></section>
<section class="section"><div class="wrap">
  <div class="offer-list">
    ${offers.map((o) => `<div class="offer-card" data-offer="${o.code}" hidden>
      <h3>${o.name}</h3>
      <p class="line">${ph(o.line)}</p>
      <p>${ph(o.detail)}</p>
      <p>${o.code === 'BRANCH' ? '<a href="/branch-out">Get your Branch Out link</a>' : `Code <span class="code-chip">${o.code}</span> · <a href="/quote?code=${o.code}">Use it</a>`}</p>
    </div>`).join('')}
  </div>
  <p id="no-offers" class="empty-note" hidden>No offers running right now. Ask about our <a href="/plan">Seasonal Care Plan</a>.</p>
  <p class="small" style="margin-top:24px">${offerRules} Expired codes are honored for ${ph('[30]')} days on quotes already sent.</p>
</div></section>${cta}`,
}));

// ---------------- Branch Out ----------------
write('/branch-out', layout({
  title: `Branch Out referrals | ${biz.short}`,
  desc: `Send a neighbor to Malchow Tree. They get $[50] off their first job, you get $[50].`.replace(/\[|\]/g, ''),
  path: '/branch-out',
  body: `<section class="page-hero"><div class="wrap"><h1>Branch Out</h1><p>Send a neighbor our way. They save on their first job, and you get a thank-you from us.</p></div></section>
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <div id="ref-welcome" class="card" hidden style="margin-bottom:24px;border-left:5px solid var(--c-safety)">
      <h3>You were sent by <span data-ref-name></span></h3>
      <p style="margin:0">Your ${ph('$[50]')} off is saved on this device. It fills in when you <a href="/quote">ask for a quote</a>.</p>
    </div>
    <h2>How it works</h2>
    <ol class="steps" style="grid-template-columns:1fr">
      <li><h3>Get your link</h3><p>Type your last name below. Your link and code are ready to text or email.</p></li>
      <li><h3>Your neighbor saves</h3><p>${ph('$[50]')} off their first job over ${ph('$[500]')}. They can use your link or give us your code, BRANCH-YOURNAME.</p></li>
      <li><h3>You get ${ph('$[50]')}</h3><p>A gift card or credit toward your next job, once their job is paid. Refer 3 neighbors in a year and your next year of the <a href="/plan">Seasonal Care Plan</a> is free.</p></li>
    </ol>
    <p class="small" style="margin-top:20px">Homeowners only. If you’re a property manager, HOA, realtor or landscaper, ask us about our partner referral fee instead. Branch Out can’t be combined with other codes. Not valid on emergency storm work.</p>
  </div>
  <div class="form-card">
    <h2>Make your link</h2>
    <form id="ref-maker">
      <div class="field"><label for="ref-last">Your last name</label><input id="ref-last" name="lastname" type="text" autocomplete="family-name" required></div>
      <button class="btn btn-primary" type="submit" style="width:100%">Make my link</button>
    </form>
    <div id="ref-out" hidden style="margin-top:20px">
      <div class="field"><label for="ref-link">Your link</label><input id="ref-link" data-ref-link type="text" readonly></div>
      <p>Your code: <span class="code-chip" data-ref-code></span></p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button id="ref-copy" class="btn btn-ghost" type="button">Copy link</button>
        <a class="btn btn-ghost" data-ref-sms href="#">Text it</a>
        <a class="btn btn-ghost" data-ref-email href="#">Email it</a>
      </div>
      <p class="small" style="margin-top:12px">We match referrals by your last name. If two families share one, we’ll call to sort it out.</p>
    </div>
  </div>
</div></section>${cta}`,
}));

// ---------------- Seasonal Care Plan (/plan) ----------------
write('/plan', layout({
  title: `Seasonal Care Plan | ${biz.short}`,
  desc: `A yearly arborist walk-through, first in line after storms, and a discount on the year’s work.`,
  path: '/plan',
  body: `<section class="page-hero"><div class="wrap"><h1>Seasonal Care Plan</h1><p>For people with big trees who don’t want to wait two weeks after the next storm.</p></div></section>
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <p style="font-size:2rem;font-family:var(--font-display);font-weight:800;color:var(--c-forest);margin-bottom:4px">${ph('$[PRICE]')} <span style="font-size:1rem;color:var(--c-muted)">per year</span></p>
    <h2 style="margin-top:20px">What you get</h2>
    <ul class="checklist">
      <li><b>A yearly walk-through.</b> Forest or Ryan looks at every tree on your lot, including an emerald ash borer check on any ash, and gives you a short written list: what’s fine, what to watch, what needs work.</li>
      <li><b>First in line after storms.</b> Plan members get scheduled before new calls. Anything that’s a danger to people still comes first, for everyone.</li>
      <li><b>${ph('[10]%')} off any work that year.</b> Pruning, removal, stump grinding, ash treatment.</li>
      <li><b>A reminder when it’s time.</b> We’ll text you before dormant pruning season and before spring storm season.</li>
    </ul>
    <p class="small">The plan discount replaces promo codes; it doesn’t stack with them. Renews yearly; cancel any time.</p>
    ${photoPh('arborist walking a backyard with a homeowner, pointing up at a canopy')}
  </div>
  ${quoteForm({ kind: 'plan', title: 'Sign up', intro: 'We’ll call to set up your first walk-through. Nothing is charged until then.', detailsTitle: 'A couple of details for your walk-through' })}
</div></section>`,
}));

// ---------------- Leaning tree checklist (/check) ----------------
const checks = [
  ['Is the lean new?', 'A tree that has leaned the same way for 20 years has usually grown to balance itself. A tree that started leaning after a storm, or leans more than it did last year, is a warning sign.'],
  ['Look at the ground on the far side', 'Cracked, raised or mounded soil on the side opposite the lean means the roots are lifting. That one needs a call this week.'],
  ['Check for cracks and splits', 'Look where big limbs meet the trunk and where two trunks join in a V. A crack you can see daylight through, or a seam that’s gotten longer, is serious.'],
  ['Look for dead wood and mushrooms', 'Dead branches with no leaves in summer, bark falling off in sheets, or mushrooms and conks growing at the base all point to decay inside.'],
  ['What would it hit?', 'Draw a circle as wide as the tree is tall. If the house, a car, a fence, a play set or a power line is inside that circle, get it looked at, even if it seems fine.'],
];
write('/check', layout({
  title: `Is that tree leaning? A 5-point check | ${biz.short}`,
  desc: 'Five things to check on a leaning or storm-damaged tree, from local arborists in Superior, CO.',
  path: '/check',
  body: `<section class="page-hero"><div class="wrap"><h1>Is that tree leaning?</h1><p>Five things to look at from the ground. If any of them worry you, send us a photo and we’ll tell you honestly whether it’s a problem.</p></div></section>
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <ol class="steps" style="grid-template-columns:1fr">${checks.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>
    <div class="card" style="margin-top:24px;border-left:5px solid #b44c1c"><h3>If a tree is touching a power line</h3><p style="margin:0">Stay back at least 35 feet and call Xcel Energy at 1-800-895-1999. Don’t try to move it. We’ll handle the rest once the line is safe.</p></div>
  </div>
  <aside class="side-box">
    <h3>Not sure? Send a photo.</h3>
    <p class="small">Stand back far enough to get the whole tree in the shot, then one close-up of anything that looks wrong.</p>
    <p><a class="btn btn-primary" style="width:100%" href="${smsHref}">Text ${biz.phone}</a></p>
    <p><a class="btn btn-ghost" style="width:100%" href="/quote?service=tree-removal">Use the quote form</a></p>
    <p class="small" data-offer="STORMPREP" hidden>It’s storm-prep season: <b>Storm-Prep Check</b>, code <b>STORMPREP</b>. <a href="/offers">Details</a></p>
  </aside>
</div></section>`,
}));

// ---------------- About ----------------
write('/about', layout({
  title: `About ${biz.owners} | ${biz.short}`,
  desc: `${biz.name} is owned and run by ${biz.owners} in ${biz.city}, Colorado.`,
  path: '/about',
  body: `<section class="page-hero"><div class="wrap"><h1>About Malchow Tree</h1><p>Owned and run by ${biz.owners}, out of ${biz.city}, Colorado.</p></div></section>
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <p>${ph('[PLACEHOLDER: their story in their own words, one or two paragraphs. How they got into tree work, how long they’ve been climbing, why they started their own company, what they like about working in Superior and the towns around it.]')}</p>
    <h2 style="margin-top:28px">How we work</h2>
    <ul class="checklist">
      <li><b>We show up when we say.</b> You get an arrival window and a text when we’re on the way.</li>
      <li><b>We work safe.</b> Helmets, harnesses, eye and ear protection on every job. We rig big pieces down instead of dropping them on your lawn.</li>
      <li><b>We clean up.</b> Raked, blown off, hauled away. Cleanup is in every price.</li>
      <li><b>We tell you the truth about your tree.</b> If it can be saved, we’ll say so, even if a removal would be a bigger ticket.</li>
    </ul>
    <h2 style="margin-top:28px">Credentials</h2>
    <ul>
      <li>ISA Certified Arborist #${ph('[PLACEHOLDER]')}</li>
      <li>General liability: ${ph('$[PLACEHOLDER]')}. Workers’ comp: ${ph('[PLACEHOLDER]')}. Certificates sent on request.</li>
      <li>${ph('[PLACEHOLDER]')} years working on trees</li>
    </ul>
    <h2 style="margin-top:28px">Giving back</h2>
    <p>We’re working toward a local give-back program. ${ph('[PLACEHOLDER: details once it is signed]')}</p>
  </div>
  <div>${photoPh('Forest Malchow, in work gear')}<div style="height:16px"></div>${photoPh('Ryan Malchow, in work gear')}</div>
</div></section>${cta}`,
}));

// ---------------- Quote ----------------
write('/quote', layout({
  title: `Free tree service quote | ${biz.short}`,
  desc: `Get a free quote on tree removal, trimming or stump grinding. Takes 30 seconds. Or call or text ${biz.phone}.`,
  path: '/quote',
  body: `<section class="section"><div class="wrap two-col">
  <div>
    <h1>Get a free quote</h1>
    <p class="lede">Three quick things now, details after if you have a minute. We usually get back to you the same day.</p>
    <div class="banner storm" data-storm-only hidden style="border-radius:10px;text-align:left;margin:16px 0"><strong>Storm damage?</strong> Texting photos to <a href="${smsHref}">${biz.phone}</a> is the fastest way to reach us.</div>
    <ul class="checklist" style="margin-top:20px">
      <li>Free, written quote. No pressure.</li>
      <li>Cleanup and haul-off in every price.</li>
      <li>Have a code? Add it in step 2.</li>
    </ul>
    ${photoPh('crew in helmets raking up after a removal')}
  </div>
  ${quoteForm()}
</div></section>`,
}));

// ---------------- Quote link from emails (/q/{id}) ----------------
write('/q', layout({
  title: `Your quote | ${biz.short}`,
  desc: 'Your Malchow Tree quote.',
  path: '/q',
  noindex: true,
  body: `<section class="section"><div class="wrap prose">
  <h1>Your quote</h1>
  <p id="q-msg">Opening your quote…</p>
  <p>Questions about it? Call or text <a href="${telHref}">${biz.phone}</a>.</p>
</div></section>
<script>
document.addEventListener('malchow:config', function (e) {
  var id = location.pathname.split('/')[2] || '';
  var base = (e.detail && e.detail.quoteLinkBase) || '';
  var msg = document.getElementById('q-msg');
  if (base && id) { location.replace(base.replace('{id}', encodeURIComponent(id))); }
  else { msg.textContent = 'We couldn’t open that quote online. Give us a call or text and we’ll send it again.'; }
});
</script>`,
}));

// ---------------- Owner tools ----------------
write('/owner', layout({
  title: `Owner tools | ${biz.short}`,
  desc: 'Turn offers and storm mode on and off.',
  path: '/owner',
  noindex: true,
  hideBar: true,
  body: `<section class="page-hero"><div class="wrap"><h1>Owner tools</h1><p>Turn offers and storm mode on and off. Changes show on this phone or computer right away so you can check how it looks.</p></div></section>
<section class="section"><div class="wrap two-col">
  <div>
    <div class="card" style="margin-bottom:20px;border-left:5px solid var(--c-storm)">
      <div class="owner-row" style="border:0;padding:0">
        <div class="meta"><b>Storm mode</b><br><span class="small">Swaps the top banner to “Storm damage? Text photos to ${biz.phone}”.</span></div>
        <label class="switch"><input type="checkbox" id="o-storm"><span></span></label>
      </div>
    </div>
    <div class="card">
      <h3>Offers and codes</h3>
      <div class="field"><label for="o-hero">Main offer (banner and homepage)</label><select id="o-hero">${offers.filter((o) => o.code !== 'BRANCH').map((o) => `<option value="${o.code}">${o.name} (${o.code})</option>`).join('')}</select></div>
      ${offers.map((o) => `<div class="owner-row"><div class="meta"><b>${o.name}</b> <span class="code-chip" style="font-size:.75rem;padding:2px 6px">${o.code === 'BRANCH' ? 'BRANCH-NAME' : o.code}</span><br><span class="small">${ph(o.line)}${o.start ? ` · shows ${o.start.replace('-', '/')} to ${o.end.replace('-', '/')} only` : ''}</span></div><label class="switch"><input type="checkbox" data-code="${o.code}"><span></span></label></div>`).join('')}
      <div class="owner-row"><div class="meta"><b>Show seasonal offers outside their dates</b><br><span class="small">Normally Dormant Season Pruning and Storm-Prep Check only show in their months.</span></div><label class="switch"><input type="checkbox" id="o-ignore"><span></span></label></div>
    </div>
  </div>
  <aside class="side-box">
    <h3>Make it live for everyone</h3>
    <p class="small" id="o-status">Right now you’re seeing the live settings.</p>
    <p class="small">These switches only change what <b>this device</b> sees, so you can preview. To push a change to every visitor, copy the settings and send them to us. ${ph('[Once Vercel is connected we can make these switches go live instantly.]')}</p>
    <p><button class="btn btn-primary" id="o-copy" style="width:100%">Copy settings</button></p>
    <p><button class="btn btn-ghost" id="o-reset" style="width:100%">Go back to live settings</button></p>
    <pre class="export" id="o-json"></pre>
    <p><a href="/" target="_blank">Open the homepage to check it</a></p>
  </aside>
</div></section>
<script>
document.addEventListener('malchow:config', function () {
  var K = window.MALCHOW.OVERRIDE_KEY;
  var live = null;
  fetch('/config.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { live = j; init(); });
  function current() {
    var raw = null; try { raw = localStorage.getItem(K); } catch (e) {}
    var c = JSON.parse(JSON.stringify(live));
    if (raw) { try { var o = JSON.parse(raw); c = Object.assign(c, o, { offers: Object.assign({}, live.offers, o.offers || {}) }); } catch (e) {} }
    return c;
  }
  function init() {
    var c = current();
    document.getElementById('o-storm').checked = !!c.stormMode;
    document.getElementById('o-hero').value = c.heroOffer;
    var ignore = false;
    document.querySelectorAll('[data-code]').forEach(function (i) { var s = c.offers[i.dataset.code] || {}; i.checked = !!s.on; if (s.ignoreDates) ignore = true; });
    document.getElementById('o-ignore').checked = ignore;
    show(c);
  }
  function collect() {
    var c = JSON.parse(JSON.stringify(live));
    c.stormMode = document.getElementById('o-storm').checked;
    c.heroOffer = document.getElementById('o-hero').value;
    var ig = document.getElementById('o-ignore').checked;
    document.querySelectorAll('[data-code]').forEach(function (i) { c.offers[i.dataset.code] = Object.assign({}, c.offers[i.dataset.code], { on: i.checked, ignoreDates: ig || undefined }); });
    return c;
  }
  function show(c) {
    var same = JSON.stringify(c) === JSON.stringify(live);
    document.getElementById('o-status').innerHTML = same ? 'Right now you’re seeing the live settings.' : '<b style="color:#b44c1c">Preview only.</b> This device shows your changes; visitors still see the live settings.';
    document.getElementById('o-json').textContent = JSON.stringify(c, null, 2);
  }
  function save() {
    var c = collect();
    try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {}
    show(c);
  }
  document.querySelectorAll('.switch input, #o-hero').forEach(function (el) { el.addEventListener('change', save); });
  document.getElementById('o-copy').addEventListener('click', function () {
    var t = document.getElementById('o-json').textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { document.getElementById('o-copy').textContent = 'Copied'; }, function () {});
  });
  document.getElementById('o-reset').addEventListener('click', function () { try { localStorage.removeItem(K); } catch (e) {} init(); });
});
</script>`,
}));

// ---------------- 404 ----------------
writeFileSync(join(OUT, '404.html'), layout({
  title: `Page not found | ${biz.short}`,
  desc: 'Page not found.',
  path: '/404',
  noindex: true,
  body: `<section class="section"><div class="wrap prose"><h1>That page fell over.</h1><p>Try the <a href="/">homepage</a>, or call or text <a href="${telHref}">${biz.phone}</a>.</p></div></section>`,
}));

// favicon, robots, sitemap
cpSync('src/img/logo/malchow-mark-color.svg', join(OUT, 'img/favicon.svg'));
const pages = ['/', '/services', ...services.map((s) => `/services/${s.slug}`), '/service-area', '/offers', '/branch-out', '/plan', '/check', '/about', '/quote'];
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${biz.url}${p === '/' ? '/' : p}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nDisallow: /owner\nDisallow: /q\nSitemap: ${biz.url}/sitemap.xml\n`);

console.log(`Built ${pages.length + 3} pages into ./${OUT}`);
