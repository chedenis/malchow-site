// Receives quote requests and Seasonal Care Plan signups from the site.
//
// Where the leads go:
// - If RESEND_API_KEY and LEADS_TO are set in Vercel (Project → Settings → Environment Variables),
//   each lead is emailed to LEADS_TO with photos attached.
// - If JOBBER_WEBHOOK_URL is set (e.g. a Zapier/Make hook that creates a Jobber request),
//   the lead is also POSTed there as JSON.
// - Always logged to Vercel's function logs as a backup.

const MAX_PHOTOS = 5;

function clean(v, max = 500) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map((x) => clean(x, 60)).filter(Boolean).join(', ');
  return String(v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only' });
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const stage = body.stage === 'details' ? 'details' : 'lead';
  const kind = body.kind === 'plan' ? 'plan' : 'quote';
  const id = clean(body.id, 40) || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const lead = {
    id, stage, kind,
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    location: clean(body.location, 200),
    textOk: body.textOk === true,
    service: clean(body.service),
    trees: clean(body.trees, 40),
    hazard: clean(body.hazard, 40),
    when: clean(body.when, 40),
    promo: clean(body.promo, 40).toUpperCase(),
    email: clean(body.email, 160),
    notes: clean(body.notes, 2000),
    page: clean(body.page, 120),
    at: new Date().toISOString(),
  };
  if (stage === 'lead' && (!lead.name || !lead.phone || !lead.location)) {
    return res.status(400).json({ error: 'Name, phone and address or ZIP are required.' });
  }

  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .slice(0, MAX_PHOTOS)
    .filter((p) => p && typeof p.data === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(p.data))
    .map((p, i) => ({ filename: clean(p.name, 60) || `photo-${i + 1}.jpg`, content: p.data.split(',')[1] }));

  console.log('LEAD', JSON.stringify({ ...lead, photos: photos.length }));

  const tasks = [];
  const { RESEND_API_KEY, LEADS_TO, LEADS_FROM, JOBBER_WEBHOOK_URL } = process.env;

  if (RESEND_API_KEY && LEADS_TO) {
    const label = kind === 'plan' ? 'Seasonal Care Plan signup' : 'Quote request';
    const subject = `${stage === 'lead' ? 'New' : 'Details for'} ${label}: ${lead.name || 'unknown'} ${lead.phone}`.trim();
    const rows = Object.entries(lead).filter(([, v]) => v !== '' && v !== false)
      .map(([k, v]) => `<tr><td style="padding:4px 10px;color:#666">${k}</td><td style="padding:4px 10px"><b>${escapeHtml(String(v))}</b></td></tr>`).join('');
    tasks.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: LEADS_FROM || 'Malchow Tree website <onboarding@resend.dev>',
        to: LEADS_TO.split(',').map((s) => s.trim()),
        reply_to: lead.email || undefined,
        subject,
        html: `<p>${label} from the website.</p><table>${rows}</table><p>Call: <a href="tel:${lead.phone}">${escapeHtml(lead.phone)}</a></p>`,
        attachments: photos.length ? photos : undefined,
      }),
    }).then((r) => { if (!r.ok) return r.text().then((t) => console.error('Resend error', r.status, t)); }));
  }

  if (JOBBER_WEBHOOK_URL) {
    tasks.push(fetch(JOBBER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, photoCount: photos.length }),
    }).catch((e) => console.error('Webhook error', e)));
  }

  await Promise.allSettled(tasks);
  return res.status(200).json({ ok: true, id });
}
