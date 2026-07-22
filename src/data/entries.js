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
    description: `Hobbies are supposed to be generative- they create things, capabilities, memories or a renewed mind. But, we have invented activities which are not.
A star example is a gambling addiction: a mathematically literal negative-sum game.
A more recent example is the transformation of information absorption to algorithmic black holes. We have invented a form of reading that teaches you nothing and only reinforces what you know.
We do not question enough the hours spent everyday consuming media that is unaligned with what we want to learn and who we want to become.
Instead of just limiting the time we spend, the underlying mechanism must change.
In both the Apple and Google app stores, popular gambling games are required to publish their exact expected percentages to prevent addiction. So why is the way we consume media allowed to be served in a way that is not treated similarly? In the infinite scroll format, content is withheld, drawn one-by-one at random, like a person pulling rabbits out of a hat.
When we can replace this illusion of simulated curiosity with disgusting transparency, addiction fades.

Addiction is non-generative, good obsession is.
This sort of disgusting transparency has a very robust form of beauty, the same that emerges when you take apart a computer to observe the traces and pins. It is the same beauty that emerges in the repetitive sweat of a ballerina’s practices. It is the same beauty that is caught by a glimpse into the kitchen-full of viscera and laboring hands behind a fine-dining dish.`,
    date: "",
  },
];

export default entries;
