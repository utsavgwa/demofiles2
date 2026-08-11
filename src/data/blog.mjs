// Blog posts. Dickens-derived dummy long-form copy.
export const posts = [
  {
    slug: 'why-every-reader-needs-a-tutor',
    title: 'Why every reader needs a tutor',
    eyebrow: 'Manifesto',
    date: '2026-03-14',
    excerpt:
      'A country that could afford Chancery could always have afforded a schoolmaster. The difference now is arithmetic.',
    body: [
      'The strongest finding in education is also the least surprising one: a child taught one to one does better than a child taught thirty to one. Everybody has always known this. Wealthy families have acted on it for four hundred years.',
      'What nobody has ever solved is supply. There are not enough patient, well-read adults with free evenings, and there never will be. So the advantage stays where it started, with the households that can buy an evening of somebody else&#39;s attention.',
      'Dickens spent a career pointing at that arrangement. Nicholas Nickleby put a Yorkshire school on the front page and closed several of them. Hard Times put a schoolroom in Coketown and asked what a curriculum made only of Facts does to a child. Bleak House put a boy on a crossing who could not read the word on the sign he swept beneath.',
      'The complaint was never that education was hard. It was that attention was rationed, and rationed by income.',
      'A tutor that costs less than a paperback changes the ration, and nothing else. It does not make the books shorter or the arguments easier. It means the child who gets stuck on the third page of Bleak House at half past nine at night has somebody to get unstuck with.',
      'That is a smaller claim than most companies make. We think it is the only one worth making, and we would rather be judged on whether the child finished the chapter.',
    ],
  },
  {
    slug: 'the-point-of-building-for-readers',
    title: 'The point of building for readers',
    eyebrow: 'Essay',
    date: '2026-05-02',
    excerpt:
      'Any model can summarise a novel. The interesting engineering problem is refusing to, at the right moment, for the right child.',
    body: [
      'Ask any competent model for the plot of Great Expectations and you will get it in four seconds, correct and complete and entirely useless to a fifteen-year-old who has to write about it on Friday.',
      'The hard part of a tutor is not knowledge. It is restraint under pressure, applied unevenly. Hold the answer back too long and the child gives up. Hand it over too early and the child learns that the machine finishes their sentences.',
      'So the product is a judgement, made every turn: is this reader still close enough that struggling teaches them something? That judgement needs to know the chapter, the child, what they got wrong last Tuesday, and what they are actually asking underneath the question they typed.',
      'It is also why we build against books rather than against subjects. A book has a fixed text. A fixed text can be checked. When the tutor says that Jaggers washes his hands after every client, that sentence can be matched against a chapter, and if it cannot be matched, it does not get spoken.',
      'Serialised fiction was the first medium that took a mass audience through long, difficult, morally complicated arguments, one week at a time, and it worked because readers argued about it between instalments.',
      'We are building the argument between instalments. That is the whole point of building for readers.',
    ],
  },
];

export const blogIntro = {
  headline: 'More words from us',
  subhead: 'Notes on reading, teaching, and the small mechanics of a tutor that waits.',
};

export const bySlug = (slug) => posts.find((p) => p.slug === slug);

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
