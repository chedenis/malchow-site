# Malchow Tree website

Static site for Malchow Arborist Service (Superior, CO). Plain HTML, CSS and JS built by one Node script, plus one Vercel function for the quote form. No dependencies.

## Run it

```
node build.mjs        # writes ./public
npm run dev           # build + serve on http://localhost:3000 (the form needs `vercel dev` to post)
```

Vercel runs `node build.mjs` and serves `public/` (see `vercel.json`).

## Where things live

| What | File |
|---|---|
| Phone, email, towns, services, FAQs, offers, reviews | `src/data.mjs` |
| Offers on/off, storm mode, main offer | `config.json` (or preview on `/owner`) |
| Page templates | `build.mjs` |
| Brand colors and fonts | `src/css/brand-tokens.css` (from the brand kit), mapped in `src/css/tokens.css` |
| Logo | `src/img/logo/` (Gambel Oak, final) |
| Hero image | `src/img/hero-placeholder.svg` (swap for the Midjourney photo, see below) |
| Quote form handler | `api/quote.js` |

## Pages

`/` home, `/services` + 6 service pages, `/service-area`, `/offers`, `/branch-out?ref=LASTNAME`, `/plan` (Seasonal Care Plan), `/check` (leaning-tree checklist), `/about`, `/quote`, `/q/{id}` (quote links from emails), `/owner` (owner tools, not indexed).

## Quote form leads

Step 1 is name, phone, address/ZIP and an "OK to text me" box. It is sent as soon as they tap the button, so a lead isn't lost if they stop there. Step 2 (service, trees, hazard, photos, time, email, promo code, notes) is sent as a follow-up with the same id.

Set these in Vercel → Project → Settings → Environment Variables:

- `RESEND_API_KEY` and `LEADS_TO` (comma-separated emails): each lead is emailed with photos attached. Optional `LEADS_FROM` once the domain is verified in Resend.
- `JOBBER_WEBHOOK_URL`: a Zapier/Make hook that creates a Jobber request.

Every lead is also written to the Vercel function logs.

## Quote links (`/q/{id}`)

Set `quoteLinkBase` in `config.json` to the quoting tool's link pattern, e.g. Jobber's client hub URL with `{id}` where the quote id goes. Until then the page tells people to call or text.

## Hero image

Scroll-linked pan works with any very wide image. Drop it at `src/img/hero.jpg` (about 3200px wide, under 500 KB) and change the `src` in the hero in `build.mjs`.

Midjourney prompt:

```
wide cinematic photo, late afternoon golden light over a quiet tree-lined residential street in Superior, Colorado, Flatirons foothills faint in the far distance, a towering mature cottonwood in a front yard on the right side of frame, an arborist in a helmet and harness roped in high in the canopy, small and distant, a clean white bucket truck parked at the curb, open blue sky and lawn on the left side of frame for text, realistic, natural colors, shallow haze, shot on a full-frame camera, no text, no logos --ar 3:1 --style raw --v 7
```

At least 4800×1600 after a 2x upscale, horizon in the top third, open space on the left, no lettering on the truck, crew in helmet and harness.
