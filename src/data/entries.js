// Each entry = one "thing": about me, or a blog post / poem.
// Listed on the landing page in this order; each gets its own page at #/<id>.
//
// Shape of an entry:
//   id           unique string (also the URL: #/<id>)
//   title        shown in the link list and as the page heading
//   description  the page content — line breaks are preserved, so poems can
//                be written naturally in a template literal
//   date         display string (any format you like); empty = no date shown
//
// To edit a poem: just change its `description` string below.

const entries = [
  {
    id: "about-me",
    title: "about me",
    description:
      "Hi, I'm Cindy. Currently working on software at Imbue. It's nice to meet you!",
    date: "",
  },
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
  },
];

export default entries;
