// Everything the site says about the business lives here.
// Anything in [BRACKETS] is a placeholder the owners still need to confirm.

export const biz = {
  name: 'Malchow Arborist Service',
  short: 'Malchow Tree',
  owners: 'Forest and Ryan Malchow',
  city: 'Superior',
  state: 'CO',
  zip: '80027',
  phone: '(303) 555-0148', // made-up number, swap before launch
  phoneHref: '+13035550148',
  email: 'hello@malchowtree.com', // made-up email, swap before launch
  url: 'https://malchowtree.com', // [PLACEHOLDER] real domain
  hours: 'Mon to Sat, 7am to 6pm. Storm texts answered 24/7.',
  facebook: '', // [PLACEHOLDER]
  instagram: '', // [PLACEHOLDER]
  google: '', // [PLACEHOLDER] Google Business Profile link
};

// Shown in the trust strip and footer. Keep the brackets until the owners confirm.
export const trust = [
  { big: 'ISA Certified', small: 'Arborist #[PLACEHOLDER]' },
  { big: 'Insured', small: '$[PLACEHOLDER] liability + workers’ comp' },
  { big: '[PLACEHOLDER] ★', small: '[PLACEHOLDER] Google reviews' },
  { big: '[PLACEHOLDER] years', small: 'working on Front Range trees' },
];

export const towns = [
  { name: 'Superior', county: 'Boulder County', note: 'Home base. Rock Creek, Original Town and Sagamore are a few minutes from the shop, so we can usually look at a tree the same week. A lot of the yards here lost trees or took heat damage in the Marshall Fire, and we know which survivors are worth saving.' },
  { name: 'Louisville', county: 'Boulder County', note: 'Big old cottonwoods and silver maples in Old Town, plus ash trees all over the newer neighborhoods that need a plan before emerald ash borer gets to them.' },
  { name: 'Lafayette', county: 'Boulder County', note: 'Mature elms and spruce on tight lots. We rig over fences and next to garages and keep heavy equipment off the lawn when we can.' },
  { name: 'Boulder', county: 'Boulder County', note: 'Emerald ash borer has been here since 2013, so most of our Boulder work is ash removal, treatment and replanting. We also prune for wind and heavy spring snow.' },
  { name: 'Broomfield', county: 'City and County of Broomfield', note: 'Newer neighborhoods with fast-growing trees that are just hitting the size where they rub roofs and hang over driveways. A good pruning now saves a removal later.' },
  { name: 'Erie', county: 'Boulder and Weld counties', note: 'Wide-open lots that catch every wind event. Storm-prep checks and cleanup after downslope winds keep us busy here.' },
  { name: 'Westminster', county: 'Adams and Jefferson counties', note: 'Older ash, locust and Siberian elm along the Hwy 36 corridor. Lots of removals near power drops, which we plan around and coordinate with Xcel when needed.' },
  { name: 'Arvada', county: 'Jefferson County', note: 'Old Town Arvada has some of the biggest street trees around. We handle cabling, deadwood pruning and full removals when a tree has run its course.' },
];

const commonFaq = [
  ['Do you clean up?', 'Yes. We rake, blow off the driveway and haul away the brush and wood unless you want to keep some for firewood. Cleanup is in every quote, not an add-on.'],
  ['Are you insured?', 'Yes, liability and workers’ comp: $[PLACEHOLDER] in coverage. We can have our insurance company send a certificate straight to you, your HOA or your property manager.'],
];

export const services = [
  {
    slug: 'tree-removal',
    name: 'Tree removal',
    short: 'Dead, dying or too close to the house. We take it down in pieces and leave the yard clean.',
    intro: 'Most removals we do are trees that are dead from emerald ash borer, split in a windstorm, or just too big for where they were planted. We take them down in sections with ropes and rigging so nothing lands where it shouldn’t, then clean up like we were never there.',
    included: ['A walk-through with you before we start, so we agree on where the drop zone is and what stays', 'Rigging and lowering in sections when the tree is near a house, fence or line', 'Brush chipped and hauled off, wood cut to firewood length or hauled away, your call', 'Raking and blowing off driveways, walks and the street', 'Stump grinding quoted on the same visit if you want it'],
    faq: [
      ['How much does it cost to take down a tree?', 'It depends on the size, what’s under it and how we can get to it. Most single-tree removals in our area run $[PLACEHOLDER] to $[PLACEHOLDER]. Send a photo and we’ll give you a real number, free.'],
      ['Do I need a permit?', 'For most private-yard trees in Boulder and Broomfield counties, no. Some cities have rules for street trees in the right-of-way, and some HOAs want a heads-up. We’ll tell you if your tree needs one.'],
      ['Can you take down a tree near power lines?', 'If it’s the line from the pole to your house, usually yes, and we plan around it. If the tree touches the main lines on the pole, Xcel has to make it safe first. We’ll call them with you.'],
      ...commonFaq,
    ],
    photoNote: 'crew lowering a section with a rope, climber in helmet and harness',
  },
  {
    slug: 'tree-trimming',
    name: 'Trimming and pruning',
    short: 'Clear the roof, lift the canopy, take out deadwood. Cut right so the tree grows back healthy.',
    intro: 'Good pruning makes a tree safer and lets it live longer. Bad pruning (topping, flush cuts, lion-tailing) makes it weaker. We follow ANSI A300 pruning standards: right cuts, right amount, right time of year.',
    included: ['Deadwood removal so branches don’t come down on the car', 'Clearance over the roof, driveway, sidewalk and street', 'Thinning to let wind through before spring snow and summer storms', 'Structural pruning on young trees so they grow strong', 'Cleanup and haul-off'],
    faq: [
      ['When is the best time to prune?', 'For most trees, late winter when they’re dormant. You can see the structure, the tree heals fast in spring, and pests are quiet. That’s why we run Dormant Season Pruning from December through February.'],
      ['Will you top my tree?', 'No. Topping causes weak sprouts and rot. If a tree is too big for its spot, we’ll reduce it properly or talk with you about replacing it.'],
      ['How often should I prune?', 'Every 3 to 5 years for most mature shade trees, more often for young trees we’re training.'],
      ...commonFaq,
    ],
    photoNote: 'climber in a maple canopy making a clean cut, helmet and harness on',
  },
  {
    slug: 'stump-grinding',
    name: 'Stump grinding',
    short: 'Ground 6 to 8 inches below grade, chips raked out, ready for sod or a new tree.',
    intro: 'A stump left behind sprouts suckers, draws ants and trips the mower. We grind it down below grade so you can plant grass, lay sod or put a new tree in close by.',
    included: ['Utility locate called in before we grind (811)', 'Ground 6 to 8 inches below grade, deeper if you’re replanting', 'Surface roots chased out a few feet', 'Chips raked into the hole or hauled away, your choice', 'Narrow gate? Tell us the width and we’ll bring the right grinder ([PLACEHOLDER] smallest gate width)'],
    faq: [
      ['How much is stump grinding?', 'Usually priced by the diameter. Most stumps run $[PLACEHOLDER] to $[PLACEHOLDER]. Several stumps at once costs less each.'],
      ['Can I plant a new tree in the same spot?', 'It’s better to go a few feet over. The old roots take a couple of years to break down.'],
      ...commonFaq,
    ],
    photoNote: 'stump grinder working, operator in eye and ear protection',
  },
  {
    slug: 'storm-damage',
    name: 'Storm and emergency',
    short: 'Tree on the house, car or fence? Text us photos any time. Life-safety calls go first.',
    intro: 'Front Range storms come fast: heavy wet snow in spring, downslope winds that gust past 80 mph, hail in summer. When a tree comes down, text us photos at any hour. We answer, tell you what’s safe, and get a crew out as fast as we can.',
    included: ['24/7 text line for photos and questions', 'Trees off roofs, cars and fences, with lowering so we don’t add damage', 'Tarping help and coordination with your roofer', 'Photos and notes for your insurance adjuster', 'Cleanup once the danger is gone'],
    faq: [
      ['What do I do right now?', 'Stay away from anything touching a wire, and call Xcel at 1-800-895-1999 if a line is down. Get everyone out of rooms under the tree. Then text us photos.'],
      ['Will insurance pay for it?', 'Often, when a tree hits a covered structure. We document everything and can talk with your adjuster. Your policy decides the rest.'],
      ['Do your discounts apply to storm work?', 'No. Promo codes don’t apply to emergency storm work. We keep emergency pricing straight and fair for everyone.'],
      ...commonFaq,
    ],
    photoNote: 'crew clearing a fallen limb off a roof after a snowstorm, all in PPE',
  },
  {
    slug: 'lot-clearing',
    name: 'Lot and brush clearing',
    short: 'Overgrown fence lines, Russian olive, scrub and dead trees cleared for building or fire safety.',
    intro: 'Clearing for a new build, opening up a back lot, or cutting fuel near the house. We take out the dead stuff and the invasives (Russian olive, Siberian elm, tamarisk) and leave the trees worth keeping.',
    included: ['A walk with you to flag what stays and what goes', 'Removal of dead trees, brush and invasive species', 'Chipping on site, chips left for mulch or hauled away', 'Defensible-space thinning around the house', 'Stump grinding as needed'],
    faq: [
      ['Do you do wildfire mitigation?', 'We do defensible-space thinning and cleanup around homes. After the Marshall Fire a lot of folks in Superior and Louisville asked about this, and we’re glad to walk your lot.'],
      ['How do you price clearing?', 'Usually by the day or half day once we see it. Send photos or a pin on a map.'],
      ...commonFaq,
    ],
    photoNote: 'chipper at the edge of a cleared lot, crew in PPE',
  },
  {
    slug: 'plant-health-care',
    name: 'Plant health care',
    short: 'Ash borer treatment, fertilizing, cabling and checkups that keep a good tree around longer.',
    intro: 'Not every sick tree needs to come down. We check what’s wrong and give you an honest call on whether it’s worth saving. Emerald ash borer treatment, deep-root fertilizing, cabling a split trunk, and watering advice for our dry winters.',
    included: ['A tree checkup with a written note on what we found', 'Emerald ash borer trunk injections for ash worth saving', 'Deep-root fertilizing where soil is poor', 'Cabling and bracing for split or weak trunks', 'Winter watering tips for Colorado’s dry months'],
    faq: [
      ['Is my ash tree worth treating?', 'If it’s healthy, a good size and less than about a third of the canopy is thin, treatment usually costs less than removal over time. We’ll give you a straight answer.'],
      ['How often do you treat for ash borer?', 'Most trunk injections protect for about 2 years, then we come back. [PLACEHOLDER] confirm the product and interval you use.'],
      ...commonFaq,
    ],
    photoNote: 'arborist checking bark on an ash tree up close',
  },
];

// Offer master list. Names and codes match the offers doc exactly. Amounts in [ ] are placeholders.
export const offers = [
  { code: 'FIRSTCUT', name: 'First Cut', line: '$100 off any removal over $1,000', detail: 'For first-time customers. Mention the code when you ask for a quote, or type it in the form.', confirmed: true },
  { code: 'FREESTUMP', name: 'Stump’s On Us', line: 'Free grinding on up to [2] stumps under [24]" with any removal', detail: 'With any tree removal. Stumps up to [24] inches across.' },
  { code: 'BRANCH', name: 'Branch Out', line: 'Your neighbor gets $[50] off, you get $[50]', detail: 'Our referral program. Share your link, they save on their first job over $[500], and you get a $[50] card or credit once their job is paid.' },
  { code: 'DORMANT', name: 'Dormant Season Pruning', line: '[10]% off pruning, Dec 1 to Feb 28', detail: 'Winter is the best time to prune most trees. We pass on the slower-season savings.', start: '12-01', end: '02-28' },
  { code: 'STORMPREP', name: 'Storm-Prep Check', line: '$[X] storm-prep inspection, credited toward any work booked within [30] days', detail: 'Before spring snow and wind season. We look for weak limbs, cracks and anything hanging over the roof.', start: '03-01', end: '05-31' },
  { code: 'HOMETOWN', name: 'Hometown Discount', line: '[10]% off for seniors 65+, veterans and first responders', detail: 'Up to $[X] off a job. Just let us know when you book.' },
  { code: 'SAMESTREET', name: 'Same Street Discount', line: '[10]% off each house when 2 or more on one street book the same day', detail: 'Talk to your neighbor. If we’re already on your street, it saves everybody money.' },
];
export const offerRules = 'One code per job (we’ll use whichever saves you more). Codes don’t apply to emergency storm work or to Seasonal Care Plan pricing.';

export const reviews = [
  // Real reviews only. Paste them here when the owners pick 3 to 5.
  // { name: 'First name + last initial', town: 'Louisville', text: '...', stars: 5 },
];
