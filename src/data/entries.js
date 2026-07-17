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
    description: `I'm interested in game theory, machine learning, and math.

Reach out if you'd like to talk or get to know https://mitcap.vc/`,
    date: "",
  },
  {
    id: "disgusting-transparency",
    title: "disgusting transparency",
    description: ``,
    date: "",
  },
];

export default entries;
