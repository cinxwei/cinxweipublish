// Each entry = one constellation = one "thing".
//
// Shape of an entry:
//   id           unique string
//   title        shown in the hover label and the card
//   description  short blurb shown in the card
//   date         display string (any format you like)
//   media        reserved for later — e.g. { type: "image", src: "/img/x.jpg", alt: "" }
//                leave as null until you have real content
//   name         star-chart name shown under the constellation. null = a
//                random Latin-ish name is generated (edits made in admin mode
//                are kept in localStorage); set a string here to hardcode it
//   stars        3-6 points in a local 0–100 coordinate box; these define the
//                hand-drawn shape of the constellation
//   links        pairs of star indices to connect with lines (the "drawing")
//   contentStar  index of the star that holds the content, or null to have one
//                picked at random on each page load
//   field        where the constellation sits in the sky, as % of the viewport,
//                plus a size in vmin
//
// To plug in real content later: just edit title/description/date/media.
// The stars/links/field values only affect the shape and placement.

const entries = [
  {
    id: "thing-01",
    title: "Untitled — March 2026",
    description:
      "Placeholder description for the first small thing. A few sentences about what it was, why it mattered, or what it felt like to make.",
    date: "March 2026",
    media: null,
    name: null,
    stars: [
      { x: 10, y: 70 },
      { x: 35, y: 40 },
      { x: 62, y: 55 },
      { x: 88, y: 25 },
      { x: 70, y: 85 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
    contentStar: null,
    field: { x: 10, y: 12, size: 38 },
  },
  {
    id: "thing-02",
    title: "Untitled — January 2026",
    description:
      "Placeholder description. Maybe this one was a sketch done on the back of a receipt, or the first run over five miles.",
    date: "January 2026",
    media: null,
    name: null,
    stars: [
      { x: 20, y: 20 },
      { x: 55, y: 35 },
      { x: 80, y: 70 },
      { x: 40, y: 80 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    contentStar: null,
    field: { x: 58, y: 6, size: 30 },
  },
  {
    id: "thing-03",
    title: "Untitled — November 2025",
    description:
      "Placeholder description. A shipped feature, a small tool, something that quietly works every day now.",
    date: "November 2025",
    media: null,
    name: null,
    stars: [
      { x: 15, y: 50 },
      { x: 45, y: 25 },
      { x: 75, y: 45 },
      { x: 90, y: 80 },
      { x: 55, y: 75 },
      { x: 25, y: 88 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [4, 0],
    ],
    contentStar: null,
    field: { x: 78, y: 26, size: 40 },
  },
  {
    id: "thing-04",
    title: "Untitled — September 2025",
    description:
      "Placeholder description. A memory more than an artifact — the kind of thing that doesn't photograph well but stays.",
    date: "September 2025",
    media: null,
    name: null,
    stars: [
      { x: 30, y: 15 },
      { x: 70, y: 30 },
      { x: 50, y: 60 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
    contentStar: null,
    field: { x: 26, y: 58, size: 26 },
  },
  {
    id: "thing-05",
    title: "Untitled — July 2025",
    description:
      "Placeholder description. Something learned, half-finished, abandoned on purpose, or finished and never shown to anyone until now.",
    date: "July 2025",
    media: null,
    name: null,
    stars: [
      { x: 10, y: 30 },
      { x: 40, y: 15 },
      { x: 68, y: 38 },
      { x: 85, y: 68 },
      { x: 52, y: 82 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    contentStar: null,
    field: { x: 60, y: 56, size: 36 },
  },
  {
    id: "thing-06",
    title: "Untitled — May 2025",
    description:
      "Placeholder description. A workout milestone, a recipe that finally came out right, a small repair.",
    date: "May 2025",
    media: null,
    name: null,
    stars: [
      { x: 25, y: 75 },
      { x: 45, y: 40 },
      { x: 75, y: 55 },
      { x: 88, y: 20 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    contentStar: null,
    field: { x: 5, y: 64, size: 30 },
  },
  {
    id: "thing-07",
    title: "Untitled — February 2025",
    description:
      "Placeholder description. The kind of small thing that only makes sense next to the others — which is the point of the sky.",
    date: "February 2025",
    media: null,
    name: null,
    stars: [
      { x: 18, y: 25 },
      { x: 50, y: 12 },
      { x: 78, y: 35 },
      { x: 60, y: 65 },
      { x: 30, y: 85 },
      { x: 10, y: 60 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
    contentStar: null,
    field: { x: 38, y: 26, size: 34 },
  },
  {
    id: "thing-08",
    title: "Untitled — December 2024",
    description:
      "Placeholder description. The oldest star in the sky for now. Everything else drifted in after it.",
    date: "December 2024",
    media: null,
    name: null,
    stars: [
      { x: 20, y: 60 },
      { x: 50, y: 30 },
      { x: 80, y: 50 },
      { x: 65, y: 85 },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 3],
    ],
    contentStar: null,
    field: { x: 82, y: 66, size: 31 },
  },
];

export default entries;
