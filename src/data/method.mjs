// Method page (the reference site calls this "Research"). Citations are Dickens
// chapters rather than papers, since this is a demonstration build.
export const methodIntro = {
  headline: 'Rooted in the text, built with intention',
  subhead:
    'Every design decision in Boz traces back to something we can point at in a book. Here is the reasoning behind how we teach.',
};

export const foundation = {
  eyebrow: 'The foundation',
  title: 'Reading with someone is the oldest advantage in education',
  body: [
    'A child reading alone meets a hard sentence and stops. A child reading with someone meets the same sentence and is asked a question about it. The second child finishes the chapter.',
    'That is the whole of the effect, and it has never been in dispute. What has been in dispute is the price. Boz exists to argue that the price can now be close to nothing.',
  ],
  citation: 'David Copperfield, Ch. 4 — the little room of books upstairs',
};

export const evidence = [
  {
    source: 'Serial readership, 1836 to 1870',
    title: 'Weekly instalments beat the complete volume',
    summary:
      'Readers who met a novel a chapter at a time, with a week to argue about it, retained more of it than readers handed the finished three-decker. Spacing and discussion, not volume, did the work.',
    link: '#',
  },
  {
    source: 'The public readings, 1858 to 1870',
    title: 'A voice outperforms a page',
    summary:
      'The same text, read aloud and performed with questions to the room, moved audiences who had already read it in print. Boz is voice-first for the same reason.',
    link: '#',
  },
];

export const contrast = {
  title: 'Most AI gets teaching fundamentally wrong',
  intro:
    'A general assistant optimises for answering the question. A tutor optimises for the child being able to answer it next time. Those are different objectives, and they produce different products.',
  columns: ['General chatbot', 'Boz'],
  rows: [
    { factor: 'When asked for help', a: 'Gives the answer', b: 'Asks the question underneath it' },
    { factor: 'Adaptation', a: 'One voice for everyone', b: 'Adjusts to this reader, this chapter' },
    { factor: 'Errors', a: 'Corrects the answer', b: 'Diagnoses the reasoning' },
    { factor: 'Visual support', a: 'Text and images', b: 'A shared page both can draw on' },
    { factor: 'Engagement', a: 'Reading and typing', b: 'Talking, out loud, in your own words' },
  ],
};

export const principles = [
  {
    title: 'The Socratic turn',
    principle: 'Guide by question, not by answer. Withhold only while the struggle is still productive.',
    basis:
      'The most-quoted lessons in Dickens are cross-examinations, not lectures. Boz holds the answer back, then hands it over the moment holding back stops teaching.',
    citation: 'Hard Times, Book I, Ch. 2',
  },
  {
    title: 'Expert error remediation',
    principle: 'Identify the error, select a strategy, form a pedagogical intention. In that order.',
    basis:
      'Novice tutors jump straight to the correction. Expert tutors spend their first move deciding what kind of wrong it is. Boz is built to take that first move every time.',
    citation: 'Bleak House, Ch. 39',
  },
  {
    title: 'Misconception diagnosis',
    principle: 'Model the reasoning behind the mistake, not just the mistake.',
    basis:
      'A reader who thinks Miss Havisham stopped the clocks out of vanity has a theory, not a gap. Boz names the theory, then tests it against the text.',
    citation: 'Great Expectations, Ch. 8',
  },
  {
    title: 'Voice-first learning',
    principle: 'Interactive beats constructive beats active beats passive.',
    basis:
      'Explaining a chapter aloud, in your own words, to something that will push back, is the highest rung of engagement available at home on a Tuesday night.',
    citation: 'The public readings, 1858',
  },
  {
    title: 'Turn-by-turn verification',
    principle: 'Every response is checked against the text before it is spoken.',
    basis:
      'Quotations are matched to the chapter they claim to come from. A tutor that invents a line of Dickens is worse than no tutor at all.',
    citation: 'Our Mutual Friend, Book II, Ch. 5',
  },
];

export const evaluation = [
  {
    title: 'Chapter comprehension checks',
    detail: '1,490 questions written by teachers, covering plot, motive, structure and voice across the shelf.',
  },
  {
    title: 'Misconception bench',
    detail: '192 recorded sessions, 1,596 responses annotated by readers who teach these books for a living.',
  },
  {
    title: 'Answer-withholding rate',
    detail: 'How often the tutor declined to hand over an answer that the child was still close to reaching.',
  },
  {
    title: 'Quotation fidelity',
    detail: 'Every quotation the tutor produces is matched against the source text. Target is one hundred percent.',
  },
];

export const methodCta = {
  title: 'Give your child a reader who never gets tired',
  subhead: 'Set up your family account in under two minutes.',
};
