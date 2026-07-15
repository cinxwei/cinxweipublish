// Each entry = one constellation = one "thing".
//
// Shape of an entry:
//   id           unique string
//   title        shown in the hover label and the card
//   description  the content shown in the card — line breaks are preserved,
//                so poems can be written naturally in a template literal
//   date         display string (any format you like); empty = no date shown
//   media        reserved for later — e.g. { type: "image", src: "/img/x.jpg", alt: "" }
//                leave as null until you have real content
//   name         star-chart name shown under the constellation. null = no
//                label (edits made in admin mode are kept in localStorage);
//                set a string here to hardcode it
//   image        the hand-drawn chart for this constellation (PNG with a
//                transparent background, from public/constellations/)
//   field        x = phase on the sky ring (0..145, see lib/sky.js) — spread
//                entries across the full ring so the cycle has no gap;
//                y = % of viewport height; size in vmin
//
// To edit a poem: just change its `description` string below.

const chart = (n) => `${import.meta.env.BASE_URL}constellations/chart-${n}.png`;

// "about me" always gets chart-2; the other hand-drawn charts are dealt out
// at random on each page load.
const dealt = [3, 4, 5, 6].map(chart);
for (let i = dealt.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [dealt[i], dealt[j]] = [dealt[j], dealt[i]];
}

const entries = [
  {
    id: "dollhouse",
    title: "dollhouse",
    description: `a pond like a celadon bowl.
pinching and pulling the surface,
the whole thing follows like a petshop goldfish bag,
filled with duckweed pearls and fallen osmanthus petals.
every step clatters like azulejo tiles, kaolin clay, headed
toward the Alps, where the peaks are dusted with
powdered sugar like madeleines arranged atop
a sea rippling with silver embroidery
spun from silkworms in a shoebox.`,
    date: "",
    media: null,
    name: "dollhouse",
    image: dealt[0],
    field: { x: 13, y: 48, size: 30 },
  },
  {
    id: "about-me",
    title: "about me",
    description:
      "Hi, I'm Cindy. Currently working on software at Imbue. It's nice to meet you!",
    date: "",
    media: null,
    name: "about me",
    image: chart(2),
    field: { x: 42, y: 28, size: 34 },
  },
  {
    id: "dwelling",
    title: "dwelling",
    description: `something’s spilled the horizon—
even God’s chalice could not hold this.
slumped on the storm drain, crumpled against the curb,
rain rushes over and encases her like rice-paper.
//
the kite vendor helped us carry her.
i sit nearby and offer light slices cut
out of the rich orange glow from the window.
//
a coastside meadow where we taste salt and pollen on the breeze, earth baking.
she wades through peonies, then runs with joy pouring open like a broken yolk
until she steps atop poppies, dahlias and off the horizon.`,
    date: "",
    media: null,
    name: "dwelling",
    image: dealt[1],
    field: { x: 71, y: 12, size: 36 },
  },
  {
    id: "scavengers",
    title: "scavengers",
    description: `from the skyscraper skeleton, we perch on one of its ribs.
every fate we fall a dull knife edge, we stick out our tongues to taste the tar sky.
occasionally someone I used to know slots into the miniature crosswalk below,
and a stone tumbles into my stomach like a pachinko machine.

i wish we could be heaved up the constructed esophagus,
yellow tape and blue tarp, then spit out a yawning helipad.
but, we are scaling the bones of window ledges and fire escapes.
climbing rung by rung, iron beams kneading into our soles,
craving running with pavement below our feet.`,
    date: "",
    media: null,
    name: "scavengers",
    image: dealt[2],
    field: { x: 100, y: 55, size: 30 },
  },
  {
    id: "endless-ballet",
    title: "endless ballet",
    description: `I’m frozen glass bundled with ribbon.
I’m taut strung
over a violin bridge,
iron bow-tipped.

I draw myself over and over
against the squint of steel strings.
The shanks of my shoes pound, my needlework sings.

The audience door cracks open,
a light-blade barely slithers through and I bow.`,
    date: "",
    media: null,
    name: "endless ballet",
    image: dealt[3],
    field: { x: 129, y: 16, size: 34 },
  },
];

export default entries;
